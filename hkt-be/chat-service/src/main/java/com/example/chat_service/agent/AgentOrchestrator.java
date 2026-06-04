package com.example.chat_service.agent;

import com.example.chat_service.cart.*;
import com.example.chat_service.entities.Product;
import com.example.chat_service.service.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Điều phối toàn bộ logic hội thoại.
 *
 * ChatController chỉ còn là thin HTTP layer — mọi xử lý nằm ở đây.
 *
 * Flow mỗi message:
 *
 *   handle(userId, prompt, token)
 *     │
 *     ├─ [0] User muốn huỷ? → clearPending → "Dạ em hiểu rồi..."
 *     │
 *     ├─ [1] Session có pendingIntent?
 *     │       → handlePendingSlot() → merge slot → đủ? execute : hỏi tiếp
 *     │
 *     ├─ [2] Resolve co-reference ("nó", "cái đó" → tên thật)
 *     │
 *     ├─ [3] Detect cart intent (ADD/REMOVE/BUY/VIEW)
 *     │       → handleCartIntent() → extract entities → checkAndExecuteOrAsk()
 *     │
 *     └─ [4] Conversation RAG bình thường
 *             → buildUserMessage() → groqService.chat() (multi-turn)
 */
@Component
public class AgentOrchestrator {

    // ── Dependencies ──────────────────────────────────────────────────────────
    private final GroqService          groqService;
    private final ProductCacheService  productCacheService;
    private final VectorStoreService   vectorStoreService;
    private final EmbeddingService     embeddingService;
    private final CartIntentDetector   cartIntentDetector;
    private final CartActionParser     cartActionParser;
    private final CartActionService    cartActionService;
    private final FuzzyProductMatcher  fuzzyMatcher;

    // ── Session store (in-memory per userId) ──────────────────────────────────
    private final Map<String, AgentSession> sessions = new ConcurrentHashMap<>();

    // ── Constants ─────────────────────────────────────────────────────────────
    private static final List<String> CANCEL_KEYWORDS = List.of(
            "thôi", "không cần", "bỏ qua", "huỷ", "hủy", "cancel", "stop", "bỏ đi"
    );

    private static final List<String> CO_REF_PATTERNS = List.of(
            "sản phẩm đó", "sản phẩm này", "cái đó", "cái này",
            "thứ đó", "thứ này", "món đó", "món này",
            "item đó", "item này", "cái kia", "thứ kia",
            "nó", "đó", "vậy đó"
    );

    private static final Set<String> VALID_SIZES =
            Set.of("XS", "S", "M", "L", "XL", "XXL");

    private static final String SYSTEM_PROMPT = """
Bạn là trợ lý mua sắm dễ thương của HKT Shop.

Xưng "em", gọi khách là "anh/chị", dùng emoji phù hợp.
Trả lời ngắn gọn tối đa 3 câu.

CHỈ sử dụng thông tin được cung cấp.
TUYỆT ĐỐI không bịa thêm thông tin sản phẩm ngoài dữ liệu hệ thống.
Không tự suy luận giá, khuyến mãi, tồn kho hoặc thông số sản phẩm.

QUY TẮC GIÁ:
- Giá được cung cấp trong dữ liệu sản phẩm là GIÁ HIỆN TẠI/GIÁ BÁN CUỐI CÙNG.
- Không được tự tính giá sau giảm hoặc giá trước giảm.
- Nếu thấy thông tin "giảm giá X%" thì chỉ được thông báo sản phẩm đang có ưu đãi X%.
- Chỉ tính toán giá giảm khi dữ liệu cung cấp rõ cả giá gốc và giá sau giảm.

Nếu thông tin không có → trả lời "em chưa có thông tin này".

Thông tin shop:
- Ship toàn quốc, đổi trả 7 ngày lỗi NSX
- Hotline/Zalo: 0903.456.789 | MrK: 0794263939
- Giờ làm: 8h30–22h00
- Đặt hàng: chọn sản phẩm → chọn size → nhập thông tin → thanh toán (bank/ví/tiền mặt)
""";

    public AgentOrchestrator(GroqService groqService,
                             ProductCacheService productCacheService,
                             VectorStoreService vectorStoreService,
                             EmbeddingService embeddingService,
                             CartIntentDetector cartIntentDetector,
                             CartActionParser cartActionParser,
                             CartActionService cartActionService,
                             FuzzyProductMatcher fuzzyMatcher) {
        this.groqService        = groqService;
        this.productCacheService = productCacheService;
        this.vectorStoreService  = vectorStoreService;
        this.embeddingService    = embeddingService;
        this.cartIntentDetector  = cartIntentDetector;
        this.cartActionParser    = cartActionParser;
        this.cartActionService   = cartActionService;
        this.fuzzyMatcher        = fuzzyMatcher;
    }

    // ── Main entry point ──────────────────────────────────────────────────────

    public Map<String, Object> handle(String userId, String prompt, String token) {
        AgentSession session = sessions.computeIfAbsent(userId, k -> new AgentSession());
        System.out.printf("[Agent] userId=%s | %s | prompt='%s'%n", userId, session, prompt);

        // ── 0. Huỷ pending ────────────────────────────────────────────────────
        if (session.hasPendingIntent() && isCancelMessage(prompt)) {
            session.clearPending();
            return textResponse("Dạ em hiểu rồi, anh/chị cần gì cứ hỏi em nhé! 😊");
        }

        // ── 1. Đang pending → tiếp tục slot filling ───────────────────────────
        if (session.hasPendingIntent()) {
            return handlePendingSlot(session, prompt, token);
        }

        // ── 2. Resolve co-reference ───────────────────────────────────────────
        String resolvedPrompt = resolveCoReference(prompt, session);

        // ── 3. Detect cart intent ─────────────────────────────────────────────
        CartIntentDetector.CartIntent cartIntent =
                cartIntentDetector.detect(resolvedPrompt);

        if (cartIntent != CartIntentDetector.CartIntent.NONE) {
            if (token == null) {
                return textResponse(
                        "Anh/chị vui lòng đăng nhập để sử dụng tính năng giỏ hàng nhé! 🔐");
            }
            if (cartIntent == CartIntentDetector.CartIntent.VIEW_CART) {
                return cartActionService.viewCart(token);
            }
            return handleCartIntent(session, cartIntent, resolvedPrompt, token);
        }

        // ── 4. Conversation RAG ───────────────────────────────────────────────
        return handleConversation(session, prompt);
    }

    // ── [1] Slot filling ──────────────────────────────────────────────────────

    /**
     * User đang trong clarification loop (pendingIntent != NONE).
     * Parse câu trả lời → merge slot → kiểm tra đủ chưa.
     */
    private Map<String, Object> handlePendingSlot(AgentSession session,
                                                  String prompt, String token) {
        System.out.printf("[Agent:slot] step=%s | prompt='%s'%n", session.nextStep, prompt);

        CartEntityExtractor.ExtractedEntities entities =
                groqService.extractEntities(prompt);

        // ── Merge product ─────────────────────────────────────────────────────
        if (session.pendingProduct == null || session.pendingProduct.isBlank()) {
            if (!entities.productName.isBlank()) {
                String matched = matchProductName(entities.productName);
                if (matched != null) {
                    session.pendingProduct = matched;
                    System.out.printf("[Agent:slot] PRODUCT filled: '%s'%n", matched);
                } else {
                    // Không match → gợi ý top-3 và giữ nguyên step
                    return askWithSuggestions(session, entities.productName,
                            actionLabel(session.pendingIntent));
                }
            }
            // Nếu vẫn chưa có product → hỏi lại (không rơi vào merge size/qty)
            if (session.pendingProduct == null || session.pendingProduct.isBlank()) {
                session.nextStep = AgentSession.PendingStep.AWAIT_PRODUCT;
                return textResponse(String.format(
                        "Anh/chị muốn %s sản phẩm nào ạ? 🤔",
                        actionLabel(session.pendingIntent)));
            }
        }

        // ── Merge size ────────────────────────────────────────────────────────
        if (session.pendingSize == null) {
            // Thử extract trực tiếp từ câu ngắn trước (nhanh hơn, chính xác hơn)
            String directSize = extractSizeDirect(prompt);
            if (directSize != null) {
                session.pendingSize = directSize;
                System.out.printf("[Agent:slot] SIZE filled (direct): '%s'%n", directSize);
            } else if (!entities.fromContext && VALID_SIZES.contains(entities.size)) {
                session.pendingSize = entities.size;
                System.out.printf("[Agent:slot] SIZE filled (groq): '%s'%n", entities.size);
            }
        }

        // ── Merge quantity ────────────────────────────────────────────────────
        if (session.pendingQuantity == null && entities.quantity > 0) {
            session.pendingQuantity = entities.quantity;
            System.out.printf("[Agent:slot] QTY filled: %d%n", entities.quantity);
        }

        return checkAndExecuteOrAsk(session, token);
    }

    /**
     * Kiểm tra slot còn thiếu không → hỏi đúng slot đó, hoặc thực thi nếu đủ.
     *
     * Thứ tự ưu tiên hỏi: product → size → (qty default 1, không hỏi).
     */
    private Map<String, Object> checkAndExecuteOrAsk(AgentSession session, String token) {
        // Product là bắt buộc với mọi intent
        if (session.pendingProduct == null || session.pendingProduct.isBlank()) {
            session.nextStep = AgentSession.PendingStep.AWAIT_PRODUCT;
            return textResponse(String.format(
                    "Anh/chị muốn %s sản phẩm nào ạ? 🤔",
                    actionLabel(session.pendingIntent)));
        }

        // REMOVE_FROM_CART không cần size / qty → thực thi luôn
        if (session.pendingIntent == CartIntentDetector.CartIntent.REMOVE_FROM_CART) {
            return executeCartAction(session, token);
        }

        // ADD_TO_CART / BUY_NOW cần size
        if (session.pendingSize == null) {
            session.nextStep = AgentSession.PendingStep.AWAIT_SIZE;
            String available = availableSizes(session.pendingProduct);
            return textResponse(String.format(
                    "Anh/chị muốn %s %s size mấy ạ? 📏%s",
                    actionLabel(session.pendingIntent),
                    session.pendingProduct,
                    available.isEmpty() ? "" : " (Còn: " + available + ")"));
        }

        // Quantity: default 1 nếu user không nói, không hỏi thêm
        // Quantity: BẮT BUỘC hỏi nếu chưa có
        if (session.pendingQuantity == null) {
            session.nextStep = AgentSession.PendingStep.AWAIT_QUANTITY;
            return textResponse(String.format(
                    "Anh/chị muốn %s %s size %s bao nhiêu cái ạ? 🔢",
                    actionLabel(session.pendingIntent),
                    session.pendingProduct,
                    session.pendingSize != null ? session.pendingSize : "___"));
        }
        return executeCartAction(session, token);
    }

    /**
     * Đủ thông tin → build ParsedCartAction từ session và delegate CartActionService.
     */
    private Map<String, Object> executeCartAction(AgentSession session, String token) {
        System.out.printf("[Agent] Execute %s | product='%s' size=%s qty=%d%n",
                session.pendingIntent, session.pendingProduct,
                session.pendingSize, session.pendingQuantity);

        CartActionParser.ParsedCartAction parsed = new CartActionParser.ParsedCartAction();
        parsed.resolvedProductName = session.pendingProduct;
        parsed.resolvedScore       = 1.0;   // đã match rồi, không cần threshold
        parsed.productKeyword      = session.pendingProduct;
        if (session.pendingSize == null || session.pendingQuantity == null) {
            return checkAndExecuteOrAsk(session, token); // quay lại hỏi
        }
        parsed.size     = session.pendingSize;
        parsed.quantity = session.pendingQuantity;
        parsed.needsContext        = false;

        CartIntentDetector.CartIntent intent = session.pendingIntent;
        session.clearPending(); // clear TRƯỚC khi gọi để tránh vòng lặp nếu action throw

        return switch (intent) {
            case BUY_NOW          -> cartActionService.buildBuyNowAction(parsed, token);
            case ADD_TO_CART      -> cartActionService.buildAddToCartAction(parsed, token);
            case REMOVE_FROM_CART -> cartActionService.buildRemoveFromCartAction(parsed, token);
            default               -> textResponse("Em không hiểu yêu cầu này ạ 😅");
        };
    }

    // ── [3] Cart intent — lần đầu detect ─────────────────────────────────────

    private Map<String, Object> handleCartIntent(AgentSession session,
                                                 CartIntentDetector.CartIntent intent,
                                                 String resolvedPrompt,
                                                 String token) {
        // Extract entities từ câu đã resolve co-reference
        List<String> allNames = productCacheService.getAllProducts()
                .stream().map(Product::getName).collect(Collectors.toList());
        String englishQuery = embeddingService.translateToEnglish(resolvedPrompt);
        CartActionParser.ParsedCartAction parsed =
                cartActionParser.parse(resolvedPrompt, englishQuery, allNames);

        System.out.printf("[Agent] First intent %s | parsed=%s%n", intent, parsed);

        // Lưu vào session state
        session.pendingIntent = intent;

        if (parsed.isResolved()) {
            session.pendingProduct = parsed.resolvedProductName;
        } else if (parsed.productKeyword != null && !parsed.productKeyword.isBlank()) {
            // Có keyword nhưng score thấp → thử match lại một lần nữa
            String matched = matchProductName(parsed.productKeyword);
            session.pendingProduct = matched; // null nếu vẫn không match
        } else {
            session.pendingProduct = null;
        }

        // Size: chỉ lưu nếu valid
        session.pendingSize = (parsed.size != null && VALID_SIZES.contains(parsed.size))
                ? parsed.size
                : null;

        // Quantity
        session.pendingQuantity = parsed.quantity > 0 ? parsed.quantity : null;

        return checkAndExecuteOrAsk(session, token);
    }

    // ── [4] Conversation RAG ──────────────────────────────────────────────────

    private Map<String, Object> handleConversation(AgentSession session, String prompt) {
        String userMessage = buildUserMessage(prompt, session);

        try {
            // Multi-turn: truyền history thật sự, không ghép string
            String reply = groqService.chat(SYSTEM_PROMPT, session.history, userMessage);
            String botReply = (reply == null || reply.isBlank())
                    ? "Dạ để em kiểm tra lại giúp anh/chị nha! 🙏"
                    : reply.trim();

            session.savePair(prompt, botReply);
            updateLastMentionedProduct(session, botReply, prompt);

            List<Map<String, Object>> suggestedProducts = findSuggestedProducts(botReply);
            List<Long> compareIds = detectCompareRequest(prompt, botReply);

            Map<String, Object> response = new HashMap<>();
            response.put("message",           botReply);
            response.put("suggestedProducts", suggestedProducts);
            if (compareIds != null && compareIds.size() >= 2) {
                response.put("compareIds", compareIds);
            }
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            return textResponse("Em đang hơi lag xíu, anh/chị nhắn lại giúp em nha! 😅");
        }
    }

    // ── RAG: build user message (giữ nguyên logic cũ) ────────────────────────

    private String buildUserMessage(String userPrompt, AgentSession session) {
        StringBuilder sb = new StringBuilder();

        String intent        = detectIntent(userPrompt);
        String intentContext = buildIntentContext(intent, userPrompt);

        if (intentContext != null) {
            sb.append("⚠️ THÔNG TIN CHÍNH XÁC TỪ HỆ THỐNG — PHẢI TRẢ LỜI ĐÚNG:\n");
            sb.append(intentContext).append("\n");
        } else {
            List<Product> keywordMatches = findByKeyword(userPrompt);
            String englishQuery          = embeddingService.translateToEnglish(userPrompt);
            List<Map<String, Object>> vectorMatches =
                    vectorStoreService.searchRelevant(englishQuery, 5);

            Set<String> addedNames    = new HashSet<>();
            StringBuilder productList = new StringBuilder();

            for (Product p : keywordMatches) {
                productList.append(buildProductDetail(p));
                addedNames.add(p.getName());
            }
            for (Map<String, Object> p : vectorMatches) {
                String name = (String) p.get("name");
                if (name != null && !addedNames.contains(name)) {
                    productList.append(buildProductDetailFromMap(p));
                    addedNames.add(name);
                }
            }

            if (addedNames.isEmpty()) {
                sb.append("Không tìm thấy sản phẩm liên quan.\n\n");
            } else {
                sb.append("⚠️ QUAN TRỌNG: Sản phẩm CÓ THẬT — tư vấn dựa trên đây:\n");
                sb.append(productList).append("\n");
            }
        }

        sb.append("Khách hỏi: ").append(userPrompt);
        return sb.toString();
    }

    // ── Product matching helpers ──────────────────────────────────────────────

    /**
     * Match keyword với DB theo 3 layer, trả về tên chuẩn hoặc null.
     *
     * Layer 1 — Substring (case-insensitive):
     *   "necklace" → tìm product nào có tên chứa "necklace" → match ngay.
     *   Xử lý đúng trường hợp user gõ category/type thay vì tên đầy đủ.
     *
     * Layer 2 — Vector search + Fuzzy trên candidates:
     *   Dịch keyword → embed → Qdrant top-10 → fuzzyMatcher trên candidates.
     *   Threshold thấp hơn vì candidates đã được pre-filter bằng semantic search.
     *
     * Layer 3 — Fuzzy toàn bộ DB với threshold gốc:
     *   Fallback khi vector search miss hoặc trả ít kết quả.
     */
    private String matchProductName(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        List<Product> allProducts = productCacheService.getAllProducts();
        if (allProducts.isEmpty()) return null;

        String lowerKw = keyword.toLowerCase().trim();

        // ── Layer 1: Substring match ──────────────────────────────────────────
        // "necklace" contained in "Y Logo Smashed Necklace Grey" → match trực tiếp
        List<Product> substringMatches = allProducts.stream()
                .filter(p -> {
                    String lowerName = p.getName().toLowerCase();
                    // product name chứa keyword HOẶC keyword chứa một token của tên
                    return lowerName.contains(lowerKw)
                            || Arrays.stream(lowerName.split("[\\s\\-]+"))
                            .anyMatch(token -> token.length() > 3 && lowerKw.contains(token));
                })
                .collect(Collectors.toList());

        if (substringMatches.size() == 1) {
            System.out.printf("[Agent] matchProductName('%s') → '%s' (substring exact)%n",
                    keyword, substringMatches.get(0).getName());
            return substringMatches.get(0).getName();
        }
        if (substringMatches.size() > 1) {
            // Nhiều kết quả → chọn cái có tên ngắn nhất (thường là match chính xác nhất)
            Product best = substringMatches.stream()
                    .min(Comparator.comparingInt(p -> p.getName().length()))
                    .get();
            System.out.printf("[Agent] matchProductName('%s') → '%s' (substring best of %d)%n",
                    keyword, best.getName(), substringMatches.size());
            return best.getName();
        }

        // ── Layer 2: Vector search → Fuzzy trên candidates ───────────────────
        // Dùng englishQuery nếu keyword là tiếng Anh, dịch nếu tiếng Việt
        try {
            String vectorQuery = embeddingService.translateToEnglish(keyword);
            List<Map<String, Object>> vectorResults =
                    vectorStoreService.searchRelevant(vectorQuery, 10);

            if (!vectorResults.isEmpty()) {
                List<String> candidates = vectorResults.stream()
                        .map(m -> (String) m.get("name"))
                        .filter(n -> n != null && !n.isBlank())
                        .collect(Collectors.toList());

                FuzzyProductMatcher.MatchResult vectorBest =
                        fuzzyMatcher.findBest(keyword, candidates);

                System.out.printf(
                        "[Agent] matchProductName('%s') vector→fuzzy: '%s' (%.3f)%n",
                        keyword, vectorBest.name, vectorBest.score);

                // Threshold thấp hơn vì candidates đã được semantic filter
                if (vectorBest.score >= FuzzyProductMatcher.THRESHOLD * 0.7) {
                    return vectorBest.name;
                }
            }
        } catch (Exception e) {
            System.err.printf("[Agent] Vector search failed for '%s': %s%n",
                    keyword, e.getMessage());
        }

        // ── Layer 3: Fuzzy toàn bộ DB với threshold gốc ───────────────────────
        List<String> allNames = allProducts.stream()
                .map(Product::getName).collect(Collectors.toList());
        FuzzyProductMatcher.MatchResult fuzzyBest = fuzzyMatcher.findBest(keyword, allNames);
        System.out.printf("[Agent] matchProductName('%s') fuzzy-full: '%s' (%.3f, threshold=%.2f)%n",
                keyword, fuzzyBest.name, fuzzyBest.score, FuzzyProductMatcher.THRESHOLD);
        return fuzzyBest.isAccepted() ? fuzzyBest.name : null;
    }

    /** Gợi ý top-3 khi không match chính xác */
    private Map<String, Object> askWithSuggestions(AgentSession session,
                                                   String keyword, String action) {
        List<String> names = productCacheService.getAllProducts()
                .stream().map(Product::getName).collect(Collectors.toList());
        List<FuzzyProductMatcher.MatchResult> topK =
                fuzzyMatcher.findTopK(keyword, names, 3);

        session.nextStep = AgentSession.PendingStep.AWAIT_PRODUCT;

        if (!topK.isEmpty()) {
            String suggestions = topK.stream()
                    .map(r -> "• " + r.name)
                    .collect(Collectors.joining("\n"));
            return textResponse(String.format(
                    "Em không tìm thấy chính xác, anh/chị muốn %s cái nào ạ? 🤔\n%s",
                    action, suggestions));
        }
        return textResponse(String.format(
                "Em không tìm thấy \"%s\" trong shop ạ 😅 " +
                        "Anh/chị có thể mô tả rõ hơn hoặc xem tại shop nhé!",
                keyword));
    }

    /** Lấy danh sách size còn hàng của sản phẩm */
    private String availableSizes(String productName) {
        return productCacheService.getAllProducts().stream()
                .filter(p -> p.getName().equals(productName))
                .findFirst()
                .map(p -> {
                    if (p.getSizeDetails() == null) return "";
                    return p.getSizeDetails().stream()
                            .filter(sd -> sd.getQuantity() > 0)
                            .map(sd -> sd.getSize().getNameSize().toString())
                            .collect(Collectors.joining(", "));
                })
                .orElse("");
    }

    /**
     * Extract size trực tiếp từ câu ngắn (regex, không cần Groq).
     * Dùng trong slot filling để tránh gọi Groq thêm 1 round.
     */
    private String extractSizeDirect(String prompt) {
        String upper = prompt.toUpperCase().trim();
        // Câu rất ngắn: "L", "XL", "size M"
        if (upper.matches("(?:SIZE\\s*)?(XS|S|M|L|XL|XXL)")) {
            return upper.replaceAll("SIZE\\s*", "").trim();
        }
        // Trong câu dài: "tôi muốn size L"
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("\\bsize\\s*(XS|S|M|L|XL|XXL)\\b",
                        java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(prompt);
        if (m.find()) return m.group(1).toUpperCase();
        // Standalone size word
        java.util.regex.Matcher m2 = java.util.regex.Pattern
                .compile("(?:^|\\s)(XS|S|M|L|XL|XXL)(?:\\s|$)",
                        java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(prompt);
        if (m2.find()) return m2.group(1).toUpperCase();
        return null;
    }

    // ── Co-reference resolution (giữ nguyên logic cũ) ────────────────────────

    private String resolveCoReference(String prompt, AgentSession session) {
        String lower = prompt.toLowerCase();
        boolean hasCoRef = CO_REF_PATTERNS.stream().anyMatch(lower::contains);
        if (!hasCoRef) return prompt;

        String lastProduct = session.lastMentionedProduct;
        if (lastProduct == null || lastProduct.isBlank()) return prompt;

        String resolved = prompt;
        List<String> sortedPatterns = CO_REF_PATTERNS.stream()
                .sorted(Comparator.comparingInt(String::length).reversed())
                .collect(Collectors.toList());
        for (String pattern : sortedPatterns) {
            resolved = resolved.replaceAll("(?i)" + Pattern.quote(pattern), lastProduct);
        }
        System.out.printf("[CoRef] '%s' → '%s' (with: '%s')%n",
                prompt, resolved, lastProduct);
        return resolved;
    }

    private void updateLastMentionedProduct(AgentSession session,
                                            String botReply, String userPrompt) {
        List<Product> all = productCacheService.getAllProducts();
        if (all.isEmpty()) return;

        // Ưu tiên match trực tiếp trong botReply (case-insensitive)
        String lowerReply = botReply.toLowerCase();
        Optional<Product> direct = all.stream()
                .filter(p -> {
                    String n = p.getName().toLowerCase();
                    return lowerReply.contains(n)
                            || lowerReply.contains(n.replace(" ", ""))
                            || lowerReply.contains(n.replace("-", ""));
                })
                .findFirst();

        if (direct.isPresent()) {
            session.lastMentionedProduct = direct.get().getName();
            return;
        }

        // Fallback: fuzzy trong botReply
        List<String> names = all.stream().map(Product::getName).collect(Collectors.toList());
        FuzzyProductMatcher.MatchResult best = fuzzyMatcher.findBest(botReply, names);
        if (best.isAccepted()) {
            session.lastMentionedProduct = best.name;
        }
    }

    // ── Intent detection & RAG context (giữ nguyên logic cũ) ─────────────────

    private static final Set<String> STOP_WORDS = Set.of(
            "cái", "con", "bộ", "của", "và", "hoặc", "có", "không", "thì",
            "là", "giá", "bao", "nhiêu", "vậy", "ạ", "ơi", "nhé", "nha",
            "shop", "cho", "em", "anh", "chị", "mua", "tôi", "muốn", "cần",
            "hỏi", "xem", "được", "này", "còn", "hàng", "hết", "size",
            "chất", "liệu", "form", "dáng", "màu", "sắc", "thông", "tin"
    );

    private List<Product> findByKeyword(String userPrompt) {
        String lower    = userPrompt.toLowerCase();
        String[] tokens = lower.split("[\\s\\-/|,\"]+");
        List<String> keywords = Arrays.stream(tokens)
                .filter(t -> t.length() > 2 && !STOP_WORDS.contains(t))
                .collect(Collectors.toList());
        if (keywords.isEmpty()) return List.of();

        return productCacheService.getAllProducts().stream()
                .filter(p -> {
                    String name = p.getName().toLowerCase();
                    String[] parts = name.split("[\\s\\-/|,]+");
                    return keywords.stream().anyMatch(kw ->
                            name.contains(kw) || Arrays.stream(parts).anyMatch(part ->
                                    part.length() > 2 && fuzzyMatcher.fuzzyContains(
                                            kw, part, FuzzyProductMatcher.KEYWORD_THRESHOLD)));
                })
                .limit(5).collect(Collectors.toList());
    }

    private String detectIntent(String prompt) {
        String lower = prompt.toLowerCase();
        if (lower.contains("mắc nhất") || lower.contains("đắt nhất"))   return "MOST_EXPENSIVE";
        if (lower.contains("rẻ nhất")  || lower.contains("giá thấp nhất")) return "CHEAPEST";
        if ((lower.contains("so sánh") || lower.contains("compare"))
                && (lower.contains("ngẫu nhiên") || lower.contains("random"))) return "COMPARE_RANDOM";
        if (lower.contains("còn hàng") || lower.contains("hết hàng") || lower.contains("tồn kho"))
            return "STOCK_QUERY";
        if (lower.contains("giảm giá") || lower.contains("sale") || lower.contains("khuyến mãi"))
            return "DISCOUNT_QUERY";
        if (lower.contains("đánh giá") || lower.contains("rating") || lower.contains("review"))
            return "RATING_QUERY";
        return "NORMAL";
    }

    private String buildIntentContext(String intent, String userPrompt) {
        List<Product> all = productCacheService.getAllProducts();
        return switch (intent) {
            case "MOST_EXPENSIVE" -> {
                Product p = all.stream()
                        .max(Comparator.comparingDouble(Product::getCostPrice)).orElse(null);
                yield p == null ? null : "Sản phẩm MẮC NHẤT:\n" + buildProductDetail(p);
            }
            case "CHEAPEST" -> {
                Product p = all.stream()
                        .min(Comparator.comparingDouble(Product::getCostPrice)).orElse(null);
                yield p == null ? null : "Sản phẩm RẺ NHẤT:\n" + buildProductDetail(p);
            }
            case "COMPARE_RANDOM" -> {
                List<Product> shuffled = new ArrayList<>(all);
                Collections.shuffle(shuffled);
                List<Product> two = shuffled.stream().limit(2).collect(Collectors.toList());
                if (two.size() < 2) yield null;
                yield "So sánh 2 sản phẩm ngẫu nhiên:\n"
                        + buildProductDetail(two.get(0))
                        + buildProductDetail(two.get(1));
            }
            case "STOCK_QUERY" -> {
                List<Product> matched = findByKeyword(userPrompt);
                if (matched.isEmpty()) yield null;
                StringBuilder ctx = new StringBuilder("Thông tin tồn kho:\n");
                matched.forEach(p -> {
                    String sizes = p.getSizeDetails() == null ? "hết hàng" :
                            p.getSizeDetails().stream().filter(sd -> sd.getQuantity() > 0)
                                    .map(sd -> sd.getSize().getNameSize().toString())
                                    .collect(Collectors.joining(", "));
                    ctx.append(String.format("⭐ %s: %s | Size còn: %s\n",
                            p.getName(),
                            p.getQuantity() > 0 ? "CÒN HÀNG (" + p.getQuantity() + ")" : "HẾT HÀNG",
                            sizes.isBlank() ? "hết" : sizes));
                });
                yield ctx.toString();
            }
            case "DISCOUNT_QUERY" -> {
                List<Product> matched = findByKeyword(userPrompt);
                if (!matched.isEmpty()) {
                    StringBuilder ctx = new StringBuilder("Thông tin giảm giá:\n");
                    matched.forEach(p -> ctx.append(String.format("⭐ %s: %s\n",
                            p.getName(),
                            p.getDiscountAmount() > 0
                                    ? "đang giảm " + (int) p.getDiscountAmount() + "%"
                                    : "không giảm giá")));
                    yield ctx.toString();
                }
                List<Product> onSale = all.stream()
                        .filter(p -> p.getDiscountAmount() > 0).collect(Collectors.toList());
                if (onSale.isEmpty()) yield "Hiện shop chưa có sản phẩm giảm giá.\n";
                StringBuilder ctx = new StringBuilder("Sản phẩm đang giảm giá:\n");
                onSale.forEach(p -> ctx.append(String.format("⭐ %s | %,.0fđ | giảm %d%%\n",
                        p.getName(), p.getCostPrice(), (int) p.getDiscountAmount())));
                yield ctx.toString();
            }
            case "RATING_QUERY" -> {
                List<Product> matched = findByKeyword(userPrompt);
                if (!matched.isEmpty()) {
                    StringBuilder ctx = new StringBuilder("Thông tin đánh giá:\n");
                    matched.forEach(p -> ctx.append(String.format("⭐ %s: %.1f/5.0 sao\n",
                            p.getName(), p.getRating())));
                    yield ctx.toString();
                }
                List<Product> topRated = all.stream()
                        .sorted(Comparator.comparingDouble(Product::getRating).reversed())
                        .limit(5).collect(Collectors.toList());
                StringBuilder ctx = new StringBuilder("Top 5 sản phẩm đánh giá cao nhất:\n");
                topRated.forEach(p -> ctx.append(String.format("⭐ %s | %.1f sao | %,.0fđ\n",
                        p.getName(), p.getRating(), p.getCostPrice())));
                yield ctx.toString();
            }
            default -> null;
        };
    }

    private String buildProductDetail(Product p) {
        String sizes = (p.getSizeDetails() == null || p.getSizeDetails().isEmpty())
                ? "hết hàng"
                : p.getSizeDetails().stream()
                .filter(sd -> sd.getQuantity() > 0)
                .map(sd -> sd.getSize().getNameSize().toString())
                .collect(Collectors.joining(", "));
        String category = "";
        try { category = p.getCategory() != null ? p.getCategory().getName() : ""; }
        catch (Exception ignored) {}
        return String.format(
                "⭐ %s\n   Giá: %,.0fđ | Danh mục: %s\n   Chất liệu: %s | Form: %s\n" +
                        "   Mô tả: %s\n   Rating: %.1f⭐ | %s | %s | Size: %s\n",
                p.getName(), p.getCostPrice(), category,
                p.getMaterial()    != null ? p.getMaterial()    : "N/A",
                p.getForm()        != null ? p.getForm()        : "N/A",
                p.getDescription() != null ? p.getDescription() : "N/A",
                p.getRating(),
                p.getDiscountAmount() > 0
                        ? "giảm giá " + (int) p.getDiscountAmount() + "%" : "không giảm giá",
                p.getQuantity() > 0
                        ? "còn hàng (" + p.getQuantity() + ")" : "hết hàng",
                sizes);
    }

    private String buildProductDetailFromMap(Map<String, Object> p) {
        double discount = (double) p.getOrDefault("discount_amount", 0.0);
        long   quantity = (long)   p.getOrDefault("quantity",        0L);
        double rating   = (double) p.getOrDefault("rating",          0.0);
        return String.format(
                "- %s\n   Giá: %,.0fđ | Danh mục: %s\n   Chất liệu: %s | Form: %s\n" +
                        "   Mô tả: %s\n   Rating: %.1f⭐ | %s | %s | Size: %s\n",
                p.get("name"), (double) p.get("price"),
                p.getOrDefault("category",    "N/A"),
                p.getOrDefault("material",    "N/A"),
                p.getOrDefault("form",        "N/A"),
                p.getOrDefault("description", "N/A"),
                rating,
                discount > 0 ? "giảm giá " + (int) discount + "%" : "không giảm giá",
                quantity > 0 ? "còn hàng (" + quantity + ")"      : "hết hàng",
                p.getOrDefault("sizes", "N/A"));
    }

    private List<Map<String, Object>> findSuggestedProducts(String botReply) {
        String lower = botReply.toLowerCase();
        return productCacheService.getAllProducts().stream()
                .filter(p -> {
                    String name = p.getName().toLowerCase();
                    return lower.contains(name)
                            || lower.contains(name.replace(" ", ""))
                            || lower.contains(name.replace("-", ""));
                })
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",   p.getId());
                    m.put("name", p.getName());
                    return m;
                })
                .distinct().limit(5).collect(Collectors.toList());
    }

    private List<Long> detectCompareRequest(String userPrompt, String botReply) {
        String text = (userPrompt + " " + botReply).toLowerCase();
        boolean isCompare = text.contains("so sánh") || text.contains(" vs ")
                || text.contains("versus") || text.contains("đối chiếu")
                || text.contains("khác nhau") || text.contains("nên mua cái nào");
        if (!isCompare) return null;
        Set<Long> ids = new HashSet<>();
        for (Product p : productCacheService.getAllProducts()) {
            String name = p.getName().toLowerCase();
            if (text.contains(name) || text.contains(name.replace(" ", "")))
                ids.add((long) p.getId());
        }
        return (ids.size() >= 2 && ids.size() <= 4) ? new ArrayList<>(ids) : null;
    }

    // ── Misc helpers ──────────────────────────────────────────────────────────

    private boolean isCancelMessage(String prompt) {
        String lower = prompt.toLowerCase();
        return CANCEL_KEYWORDS.stream().anyMatch(lower::contains);
    }

    private String actionLabel(CartIntentDetector.CartIntent intent) {
        return switch (intent) {
            case BUY_NOW          -> "mua";
            case ADD_TO_CART      -> "thêm vào giỏ";
            case REMOVE_FROM_CART -> "xóa";
            default               -> "xử lý";
        };
    }

    private Map<String, Object> textResponse(String message) {
        return Map.of("message", message, "suggestedProducts", List.of());
    }

    /** Gọi khi user logout — xoá session để tránh data leak */
    public void clearSession(String userId) {
        sessions.remove(userId);
        System.out.printf("[Agent] Session cleared: userId=%s%n", userId);
    }
}