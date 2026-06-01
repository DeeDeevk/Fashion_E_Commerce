package com.example.chat_service.controller;

import com.example.chat_service.cart.CartActionParser;
import com.example.chat_service.cart.CartActionService;
import com.example.chat_service.cart.CartIntentDetector;
import com.example.chat_service.client.CartClient;
import com.example.chat_service.client.OrderClient;
import com.example.chat_service.dto.CartResponse;
import com.example.chat_service.entities.Product;
import com.example.chat_service.service.EmbeddingService;
import com.example.chat_service.service.FuzzyProductMatcher;
import com.example.chat_service.service.GroqService;
import com.example.chat_service.service.ProductCacheService;
import com.example.chat_service.service.VectorStoreService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.Optional;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final GroqService          groqService;
    private final ProductCacheService  productCacheService;
    private final VectorStoreService   vectorStoreService;
    private final EmbeddingService     embeddingService;
    private final CartClient           cartClient;
    private final OrderClient          orderClient;
    private final CartIntentDetector   cartIntentDetector;
    private final CartActionParser     cartActionParser;
    private final CartActionService    cartActionService;
    private final FuzzyProductMatcher  fuzzyMatcher;
    private final JwtDecoder           jwtDecoder;

    // ── Session state ─────────────────────────────────────────────────────────
    private static final Map<String, Deque<String[]>> chatHistory          = new ConcurrentHashMap<>();
    private static final Map<String, String>          lastMentionedProduct = new ConcurrentHashMap<>();
    private static final int MAX_PAIRS = 5;

    // ── Co-reference words cần resolve ───────────────────────────────────────
    // Các từ/cụm mà user dùng để chỉ sản phẩm đã nhắc trước đó
    private static final List<String> CO_REF_PATTERNS = List.of(
            "sản phẩm đó", "sản phẩm này", "cái đó", "cái này",
            "thứ đó", "thứ này", "món đó", "món này",
            "item đó", "item này", "cái kia", "thứ kia",
            "nó", "đó", "vậy đó"
    );

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý mua sắm dễ thương của HKT Shop.
            Xưng "em", gọi khách là "anh/chị", dùng emoji phù hợp.
            Trả lời ngắn gọn tối đa 3 câu, dựa HOÀN TOÀN vào thông tin được cung cấp.
            TUYỆT ĐỐI không bịa thêm thông tin sản phẩm ngoài những gì được cung cấp.
            Nếu thông tin không có → trả lời "em chưa có thông tin này".
            Thông tin shop:
            - Ship toàn quốc, đổi trả 7 ngày lỗi NSX
            - Hotline/Zalo: 0903.456.789 | MrK: 0794263939
            - Giờ làm: 8h30–22h00
            - Đặt hàng: chọn sản phẩm → chọn size → nhập thông tin → thanh toán (bank/ví/tiền mặt)
            """;

    public ChatController(GroqService groqService, ProductCacheService productCacheService,
                          VectorStoreService vectorStoreService, EmbeddingService embeddingService,
                          CartClient cartClient, CartIntentDetector cartIntentDetector,
                          CartActionParser cartActionParser, CartActionService cartActionService,
                          FuzzyProductMatcher fuzzyMatcher,
                          OrderClient orderClient,
                          JwtDecoder jwtDecoder) {
        this.groqService         = groqService;
        this.productCacheService = productCacheService;
        this.vectorStoreService  = vectorStoreService;
        this.embeddingService    = embeddingService;
        this.cartClient          = cartClient;
        this.cartIntentDetector  = cartIntentDetector;
        this.cartActionParser    = cartActionParser;
        this.cartActionService   = cartActionService;
        this.fuzzyMatcher        = fuzzyMatcher;
        this.orderClient         = orderClient;
        this.jwtDecoder          = jwtDecoder;
    }

    // ── POST /chat/ask ────────────────────────────────────────────────────────

    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> askGroq(
            HttpServletRequest request,
            @RequestBody PromptRequest promptRequest) {

        String token      = extractToken(request.getHeader("Authorization"));
        String userPrompt = promptRequest.getPrompt().trim();
        String userId     = token != null ? "user_" + token : "guest";

        if (userPrompt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Dạ anh/chị nhắn gì cho em với ạ! 😊",
                    "suggestedProducts", List.of()));
        }

        // ── Cart intent ──────────────────────────────────────────────────────
        CartIntentDetector.CartIntent cartIntent = cartIntentDetector.detect(userPrompt);
        if (cartIntent != CartIntentDetector.CartIntent.NONE) {
            if (token == null) {
                return ResponseEntity.ok(Map.of(
                        "message", "Anh/chị vui lòng đăng nhập để sử dụng tính năng giỏ hàng nhé! 🔐",
                        "suggestedProducts", List.of()));
            }

            // ★ RESOLVE CO-REFERENCE: "nó", "cái đó" → tên sản phẩm thật từ session
            String resolvedPrompt = resolveCoReference(userPrompt, userId);

            List<String> productNames = productCacheService.getAllProducts()
                    .stream().map(Product::getName).collect(Collectors.toList());

            // Dịch câu đã resolve sang tiếng Anh để embed Qdrant
            String englishQueryForCart = embeddingService.translateToEnglish(resolvedPrompt);

            CartActionParser.ParsedCartAction parsed =
                    cartActionParser.parse(resolvedPrompt, englishQueryForCart, productNames);

            Map<String, Object> cartResponse = switch (cartIntent) {
                case BUY_NOW          -> cartActionService.buildBuyNowAction(parsed, token);
                case ADD_TO_CART      -> cartActionService.buildAddToCartAction(parsed, token);
                case REMOVE_FROM_CART -> cartActionService.buildRemoveFromCartAction(parsed, token);
                case VIEW_CART        -> cartActionService.viewCart(token);
                default               -> null;
            };
            if (cartResponse != null) return ResponseEntity.ok(cartResponse);
        }

        // ── Conversation ─────────────────────────────────────────────────────
        Deque<String[]> history = chatHistory.computeIfAbsent(userId, k -> new ArrayDeque<>());
        String userMessage = buildUserMessage(userPrompt, history);

        try {
            String reply = groqService.generateText(SYSTEM_PROMPT, userMessage);
            String botReply = (reply == null || reply.isBlank())
                    ? "Dạ để em kiểm tra lại giúp anh/chị nha! 🙏"
                    : reply.trim();

            savePair(history, userPrompt, botReply);

            // ★ CẬP NHẬT lastMentionedProduct: lưu sản phẩm đầu tiên AI đề cập trong reply
            List<Map<String, Object>> suggestedProducts = findSuggestedProducts(botReply);
            updateLastMentionedProduct(userId, suggestedProducts, botReply, userPrompt);

            List<Long> compareIds = detectCompareRequest(userPrompt, botReply);

            Map<String, Object> response = new HashMap<>();
            response.put("message", botReply);
            response.put("suggestedProducts", suggestedProducts);
            if (compareIds != null && compareIds.size() >= 2) {
                response.put("compareIds", compareIds);
            }
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                    "message", "Em đang hơi lag xíu, anh/chị nhắn lại giúp em nha! 😅",
                    "suggestedProducts", List.of()));
        }
    }

    // ── Co-reference resolution ───────────────────────────────────────────────

    /**
     * Thay thế các từ chỉ định mơ hồ ("nó", "cái đó", "sản phẩm đó", …)
     * bằng tên sản phẩm cuối cùng được đề cập trong session của userId.
     *
     * Ví dụ:
     *   lastMentionedProduct = "Nike Air Max 270"
     *   input  = "ok mua nó đi size M"
     *   output = "ok mua Nike Air Max 270 đi size M"
     */
    private String resolveCoReference(String prompt, String userId) {
        String lower = prompt.toLowerCase();

        // Kiểm tra có từ co-reference không
        boolean hasCoRef = CO_REF_PATTERNS.stream().anyMatch(lower::contains);
        if (!hasCoRef) return prompt;

        // Lấy sản phẩm được nhắc gần nhất trong session
        String lastProduct = lastMentionedProduct.get(userId);
        if (lastProduct == null || lastProduct.isBlank()) {
            System.out.printf("[CoRef] userId=%s: co-ref detected but no lastMentionedProduct in session%n", userId);
            return prompt; // không có context → giữ nguyên, để CartActionParser tự xử lý
        }

        // Thay thế theo thứ tự từ dài nhất → ngắn nhất để tránh partial replace
        String resolved = prompt;
        List<String> sortedPatterns = CO_REF_PATTERNS.stream()
                .sorted(Comparator.comparingInt(String::length).reversed())
                .collect(Collectors.toList());

        for (String pattern : sortedPatterns) {
            // Case-insensitive replace, giữ nguyên phần còn lại của câu
            resolved = resolved.replaceAll("(?i)" + Pattern.quote(pattern), lastProduct);
        }

        System.out.printf("[CoRef] userId=%s | '%s' → '%s' (resolved with: %s)%n",
                userId, prompt, resolved, lastProduct);
        return resolved;
    }

    /**
     * Cập nhật sản phẩm được nhắc gần nhất.
     *
     * Ưu tiên 1: suggestedProducts (đã match tên trong botReply)
     * Ưu tiên 2: fuzzy match tên sản phẩm trong botReply (phòng khi casing/dấu lệch)
     * Ưu tiên 3: fuzzy match trong userPrompt (phòng khi bot không nhắc lại tên)
     */
    private void updateLastMentionedProduct(String userId,
                                            List<Map<String, Object>> suggestedProducts,
                                            String botReply,
                                            String userPrompt) {
        // Ưu tiên 1: suggestedProducts đã được resolve chính xác
        if (suggestedProducts != null && !suggestedProducts.isEmpty()) {
            String productName = (String) suggestedProducts.get(0).get("name");
            if (productName != null && !productName.isBlank()) {
                lastMentionedProduct.put(userId, productName);
                System.out.printf("[CoRef] userId=%s: updated from suggestedProducts → '%s'%n",
                        userId, productName);
                return;
            }
        }

        // Ưu tiên 2: fuzzy match tên sản phẩm trong botReply
        //   (xử lý trường hợp casing/dấu cách khác nhau giữa DB và reply)
        List<Product> allProducts = productCacheService.getAllProducts();
        if (!allProducts.isEmpty()) {
            List<String> allNames = allProducts.stream()
                    .map(Product::getName).collect(Collectors.toList());

            // Thử match trực tiếp trong botReply trước (nhanh hơn fuzzy)
            String lowerReply = botReply.toLowerCase();
            Optional<Product> directMatch = allProducts.stream()
                    .filter(p -> {
                        String n = p.getName().toLowerCase();
                        return lowerReply.contains(n)
                                || lowerReply.contains(n.replace(" ", ""))
                                || lowerReply.contains(n.replace("-", ""));
                    })
                    .findFirst();

            if (directMatch.isPresent()) {
                lastMentionedProduct.put(userId, directMatch.get().getName());
                System.out.printf("[CoRef] userId=%s: updated from botReply direct match → '%s'%n",
                        userId, directMatch.get().getName());
                return;
            }

            // Fallback: fuzzy match trong botReply
            FuzzyProductMatcher.MatchResult bestFromReply =
                    fuzzyMatcher.findBest(botReply, allNames);
            if (bestFromReply.isAccepted()) {
                lastMentionedProduct.put(userId, bestFromReply.name);
                System.out.printf("[CoRef] userId=%s: updated from botReply fuzzy → '%s' (%.3f)%n",
                        userId, bestFromReply.name, bestFromReply.score);
                return;
            }

            // Ưu tiên 3: fuzzy match trong userPrompt
            List<Product> fromKeyword = findByKeyword(userPrompt);
            if (!fromKeyword.isEmpty()) {
                lastMentionedProduct.put(userId, fromKeyword.get(0).getName());
                System.out.printf("[CoRef] userId=%s: updated from userPrompt keyword → '%s'%n",
                        userId, fromKeyword.get(0).getName());
            }
        }
    }

    // ── Build user message ────────────────────────────────────────────────────

    private String buildUserMessage(String userPrompt, Deque<String[]> history) {
        StringBuilder sb = new StringBuilder();

        if (!history.isEmpty()) {
            sb.append("Lịch sử gần đây:\n");
            List<String[]> pairs = new ArrayList<>(history);
            Collections.reverse(pairs);
            for (String[] pair : pairs) {
                sb.append("KH: ").append(pair[0]).append("\n");
                sb.append("Bot: ").append(pair[1]).append("\n");
            }
            sb.append("\n");
        }

        String intent        = detectIntent(userPrompt);
        String intentContext = buildIntentContext(intent, userPrompt);

        if (intentContext != null) {
            sb.append("⚠️ THÔNG TIN CHÍNH XÁC TỪ HỆ THỐNG — PHẢI TRẢ LỜI ĐÚNG:\n");
            sb.append(intentContext).append("\n");
        } else {
            List<Product> keywordMatches  = findByKeyword(userPrompt);
            String englishQuery           = embeddingService.translateToEnglish(userPrompt);
            List<Map<String, Object>> vectorMatches = vectorStoreService.searchRelevant(englishQuery, 5);

            Set<String> addedNames    = new HashSet<>();
            StringBuilder productList = new StringBuilder();

            for (Product p : keywordMatches) {
                productList.append(buildProductDetail(p));
                addedNames.add(p.getName());
            }
            for (Map<String, Object> p : vectorMatches) {
                String name = (String) p.get("name");
                if (!addedNames.contains(name)) {
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

    // ── findByKeyword — dùng FuzzyProductMatcher ─────────────────────────────

    private static final Set<String> STOP_WORDS = Set.of(
            "cái", "con", "bộ", "của", "và", "hoặc", "có", "không", "thì",
            "là", "giá", "bao", "nhiêu", "vậy", "ạ", "ơi", "nhé", "nha",
            "shop", "cho", "em", "anh", "chị", "mua", "tôi", "muốn", "cần",
            "hỏi", "xem", "được", "này", "còn", "hàng", "hết", "size",
            "chất", "liệu", "form", "dáng", "màu", "sắc", "thông", "tin",
            "mo", "ta", "đanh", "gia", "giam", "khuyen", "mai", "sale"
    );

    private List<Product> findByKeyword(String userPrompt) {
        String lower = userPrompt.toLowerCase();
        String[] tokens = lower.split("[\\s\\-/|,\"]+");

        List<String> keywords = Arrays.stream(tokens)
                .filter(t -> t.length() > 2 && !STOP_WORDS.contains(t))
                .collect(Collectors.toList());

        if (keywords.isEmpty()) return List.of();

        return productCacheService.getAllProducts().stream()
                .filter(p -> {
                    String name      = p.getName().toLowerCase();
                    String[] nameParts = name.split("[\\s\\-/|,]+");
                    return keywords.stream().anyMatch(keyword ->
                            name.contains(keyword)
                                    || Arrays.stream(nameParts).anyMatch(part ->
                                    part.length() > 2 && fuzzyMatcher.fuzzyContains(
                                            keyword, part, FuzzyProductMatcher.KEYWORD_THRESHOLD))
                    );
                })
                .limit(5)
                .collect(Collectors.toList());
    }

    // ── Product detail builders ───────────────────────────────────────────────

    private String buildProductDetail(Product p) {
        String sizes = (p.getSizeDetails() == null || p.getSizeDetails().isEmpty())
                ? "hết hàng"
                : p.getSizeDetails().stream()
                .filter(sd -> sd.getQuantity() > 0)
                .map(sd -> sd.getSize().getNameSize().toString())
                .collect(Collectors.joining(", "));
        String discount = p.getDiscountAmount() > 0
                ? "giảm giá " + (int) p.getDiscountAmount() + "%" : "không giảm giá";
        String stock = p.getQuantity() > 0
                ? "còn hàng (" + p.getQuantity() + " sản phẩm)" : "hết hàng";
        String category = "";
        try { category = p.getCategory() != null ? p.getCategory().getName() : ""; }
        catch (Exception e) { category = ""; }

        return String.format(
                "⭐ %s\n   Giá: %,.0fđ | Danh mục: %s\n   Chất liệu: %s | Form: %s\n" +
                        "   Mô tả: %s\n   Rating: %.1f⭐ | %s | %s | Size: %s\n",
                p.getName(), p.getCostPrice(), category,
                p.getMaterial()    != null ? p.getMaterial()    : "N/A",
                p.getForm()        != null ? p.getForm()        : "N/A",
                p.getDescription() != null ? p.getDescription() : "N/A",
                p.getRating(), discount, stock, sizes);
    }

    private String buildProductDetailFromMap(Map<String, Object> p) {
        double discount = (double) p.getOrDefault("discount_amount", 0.0);
        long   quantity = (long)   p.getOrDefault("quantity", 0L);
        double rating   = (double) p.getOrDefault("rating", 0.0);
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
                quantity > 0 ? "còn hàng (" + quantity + " sản phẩm)" : "hết hàng",
                p.getOrDefault("sizes", "N/A"));
    }

    // ── Intent detection ──────────────────────────────────────────────────────

    private String detectIntent(String prompt) {
        String lower = prompt.toLowerCase();
        if (lower.contains("mắc nhất") || lower.contains("đắt nhất") || lower.contains("giá cao nhất"))
            return "MOST_EXPENSIVE";
        if (lower.contains("rẻ nhất") || lower.contains("giá thấp nhất") || lower.contains("giá rẻ nhất"))
            return "CHEAPEST";
        if ((lower.contains("so sánh") || lower.contains("compare"))
                && (lower.contains("ngẫu nhiên") || lower.contains("random")))
            return "COMPARE_RANDOM";
        if (lower.contains("còn hàng") || lower.contains("hết hàng")
                || lower.contains("còn size") || lower.contains("tồn kho"))
            return "STOCK_QUERY";
        if (lower.contains("giảm giá") || lower.contains("sale")
                || lower.contains("khuyến mãi") || lower.contains("discount"))
            return "DISCOUNT_QUERY";
        if (lower.contains("đánh giá") || lower.contains("rating")
                || lower.contains("review") || lower.contains("chất lượng"))
            return "RATING_QUERY";
        return "NORMAL";
    }

    private String buildIntentContext(String intent, String userPrompt) {
        List<Product> all = productCacheService.getAllProducts();
        return switch (intent) {
            case "MOST_EXPENSIVE" -> {
                Product p = all.stream().max(Comparator.comparingDouble(Product::getCostPrice)).orElse(null);
                yield p == null ? "Không có sản phẩm.\n" : "Sản phẩm MẮC NHẤT:\n" + buildProductDetail(p);
            }
            case "CHEAPEST" -> {
                Product p = all.stream().min(Comparator.comparingDouble(Product::getCostPrice)).orElse(null);
                yield p == null ? "Không có sản phẩm.\n" : "Sản phẩm RẺ NHẤT:\n" + buildProductDetail(p);
            }
            case "COMPARE_RANDOM" -> {
                List<Product> shuffled = new ArrayList<>(all);
                Collections.shuffle(shuffled);
                List<Product> two = shuffled.stream().limit(2).collect(Collectors.toList());
                yield "So sánh 2 sản phẩm ngẫu nhiên:\n"
                        + buildProductDetail(two.get(0)) + buildProductDetail(two.get(1));
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
                    ctx.append(String.format("⭐ %s: %s | Size còn: %s\n", p.getName(),
                            p.getQuantity() > 0 ? "CÒN HÀNG (" + p.getQuantity() + ")" : "HẾT HÀNG",
                            sizes.isEmpty() ? "hết" : sizes));
                });
                yield ctx.toString();
            }
            case "DISCOUNT_QUERY" -> {
                List<Product> matched = findByKeyword(userPrompt);
                if (!matched.isEmpty()) {
                    StringBuilder ctx = new StringBuilder("Thông tin giảm giá:\n");
                    matched.forEach(p -> ctx.append(String.format("⭐ %s: %s\n", p.getName(),
                            p.getDiscountAmount() > 0
                                    ? "đang giảm " + (int) p.getDiscountAmount() + "%"
                                    : "không giảm giá")));
                    yield ctx.toString();
                }
                List<Product> onSale = all.stream().filter(p -> p.getDiscountAmount() > 0)
                        .collect(Collectors.toList());
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
                StringBuilder ctx = new StringBuilder("Top 5 sản phẩm được đánh giá cao nhất:\n");
                topRated.forEach(p -> ctx.append(String.format("⭐ %s | %.1f sao | %,.0fđ\n",
                        p.getName(), p.getRating(), p.getCostPrice())));
                yield ctx.toString();
            }
            default -> null;
        };
    }

    // ── Session helpers ───────────────────────────────────────────────────────

    private void savePair(Deque<String[]> history, String userMsg, String botMsg) {
        history.addFirst(new String[]{userMsg, botMsg});
        while (history.size() > MAX_PAIRS) history.removeLast();
    }

    // ── Suggested products & compare ─────────────────────────────────────────

    private List<Map<String, Object>> findSuggestedProducts(String botReply) {
        List<Product> allProducts = productCacheService.getAllProducts();
        if (allProducts.isEmpty()) return List.of();
        String lower = botReply.toLowerCase();
        return allProducts.stream()
                .filter(p -> {
                    String name = p.getName().toLowerCase();
                    return lower.contains(name)
                            || lower.contains(name.replace(" ", ""))
                            || lower.contains(name.replace("-", ""));
                })
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", p.getId());
                    m.put("name", p.getName());
                    return m;
                })
                .distinct().limit(5).collect(Collectors.toList());
    }

    private List<Long> detectCompareRequest(String userPrompt, String botReply) {
        String text = (userPrompt + " " + botReply).toLowerCase();
        boolean isCompare = text.contains("so sánh") || text.contains(" vs ")
                || text.contains("versus") || text.contains("đối chiếu")
                || text.contains("khác nhau") || text.contains("nên mua cái nào")
                || text.contains("so với") || text.contains("so kè");
        if (!isCompare) return null;

        Set<Long> ids = new HashSet<>();
        for (Product p : productCacheService.getAllProducts()) {
            String name = p.getName().toLowerCase();
            if (text.contains(name) || text.contains(name.replace(" ", "")))
                ids.add((long) p.getId());
        }
        return (ids.size() >= 2 && ids.size() <= 4) ? new ArrayList<>(ids) : null;
    }

    // ── Token helper ──────────────────────────────────────────────────────────

    private String extractToken(String header) {
        if (header == null || !header.startsWith("Bearer ")) return null;
        return header.substring(7).trim();
    }

    // ── Endpoints phụ ────────────────────────────────────────────────────────

    @GetMapping("/ping-cart")
    public ResponseEntity<Map<String, Object>> pingCart() {
        boolean connected = cartClient.ping();
        return ResponseEntity.ok(Map.of(
                "cartServiceConnected", connected,
                "message", connected
                        ? "✅ Kết nối cart-service thành công!"
                        : "❌ Không kết nối được cart-service"));
    }

    @GetMapping("/cart/{accountId}")
    public ResponseEntity<Map<String, Object>> getCart(HttpServletRequest request,
                                                       @PathVariable int accountId) {
        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of("error", "Vui lòng đăng nhập để xem giỏ hàng"));
        try {
            CartResponse cart = cartClient.getCartByAccountId(accountId, token);
            return ResponseEntity.ok(Map.of("cart", cart != null ? cart : "Giỏ hàng trống"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cart/confirm-add")
    public ResponseEntity<Map<String, Object>> confirmAddToCart(
            HttpServletRequest request, @RequestBody Map<String, Object> body) {
        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of("message", "Vui lòng đăng nhập ạ 🔐",
                    "suggestedProducts", List.of()));
        int productId    = (int) body.get("productId");
        int sizeDetailId = (int) body.get("sizeDetailId");
        int quantity     = (int) body.get("quantity");
        return ResponseEntity.ok(
                cartActionService.executeAddToCart(productId, sizeDetailId, quantity, token));
    }

    @PostMapping("/cart/confirm-remove")
    public ResponseEntity<Map<String, Object>> confirmRemoveFromCart(
            HttpServletRequest request, @RequestBody Map<String, Object> body) {
        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of("message", "Vui lòng đăng nhập ạ 🔐",
                    "suggestedProducts", List.of()));
        int cartDetailId = (int) body.get("cartDetailId");
        return ResponseEntity.ok(cartClient.deleteCartDetail(cartDetailId, token));
    }


    // ── GET /chat/order/addresses — lấy danh sách địa chỉ của user ────────────
    @GetMapping("/order/addresses")
    public ResponseEntity<Map<String, Object>> getOrderAddresses(HttpServletRequest request) {
        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of("error", "Vui lòng đăng nhập ạ 🔐"));

        // Decode userId từ JWT (dùng lại logic của CartActionService)
        try {
            org.springframework.security.oauth2.jwt.Jwt jwt =
                    jwtDecoder.decode(token);
            Number idClaim = jwt.getClaim("id");
            if (idClaim == null)
                return ResponseEntity.ok(Map.of("error", "Không lấy được thông tin user"));

            int userId = idClaim.intValue();
            java.util.List<Map<String, Object>> addresses =
                    orderClient.getAddresses(userId, token);

            if (addresses == null || addresses.isEmpty())
                return ResponseEntity.ok(Map.of(
                        "addresses", java.util.List.of(),
                        "message",   "Bạn chưa có địa chỉ nào được lưu"));

            return ResponseEntity.ok(Map.of("addresses", addresses));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", "Lỗi lấy địa chỉ: " + e.getMessage()));
        }
    }

    // ── POST /chat/order/confirm — tạo order y chang Checkout.handleConfirm ───
    @PostMapping("/order/confirm")
    public ResponseEntity<Map<String, Object>> confirmOrder(
            HttpServletRequest request,
            @RequestBody OrderConfirmRequest req) {

        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập ạ 🔐"));

        try {
            // 1. Decode userId
            org.springframework.security.oauth2.jwt.Jwt jwt = jwtDecoder.decode(token);
            Number idClaim = jwt.getClaim("id");
            if (idClaim == null) return ResponseEntity.ok(Map.of(
                    "success", false, "message", "Không lấy được thông tin user"));
            int userId = idClaim.intValue();

            // 2. Lấy thông tin customer
            Map<String, Object> customer = orderClient.getCustomer(userId, token);
            if (customer == null) return ResponseEntity.ok(Map.of(
                    "success", false, "message", "Không lấy được thông tin khách hàng ạ 😔"));

            String name  = (String) customer.getOrDefault("fullName",    "");
            String phone = (String) customer.getOrDefault("phoneNumber", "");
            String email = (String) customer.getOrDefault("email",       "");

            // 3. Lấy địa chỉ theo addressId
            java.util.List<Map<String, Object>> addresses =
                    orderClient.getAddresses(userId, token);
            if (addresses == null || addresses.isEmpty()) return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Anh/chị chưa có địa chỉ nào, vui lòng vào trang Checkout để thêm ạ!"));

            Map<String, Object> selectedAddr = addresses.stream()
                    .filter(a -> {
                        Object id = a.get("id");
                        return id != null && ((Number) id).intValue() == req.addressId;
                    })
                    .findFirst().orElse(null);

            if (selectedAddr == null) return ResponseEntity.ok(Map.of(
                    "success", false, "message", "Không tìm thấy địa chỉ đã chọn ạ 😔"));

            String deliveryAddress = (String) selectedAddr.getOrDefault("delivery_address", "");
            String province        = (String) selectedAddr.getOrDefault("province",         "");
            String fullAddress     = deliveryAddress + ", " + province;

            // 4. Tính tổng tiền (costPrice * quantity + phí ship 30k)
            double totalAmount = req.price * req.quantity + 30000;

            // 5. Tạo customer-trading
            Map<String, Object> tradingBody = new HashMap<>();
            tradingBody.put("receiverName",    name);
            tradingBody.put("receiverPhone",   phone);
            tradingBody.put("receiverEmail",   email);
            tradingBody.put("receiverAddress", fullAddress);
            tradingBody.put("totalAmount",     totalAmount);

            Map<String, Object> trading = orderClient.createCustomerTrading(tradingBody, token);
            if (trading == null) return ResponseEntity.ok(Map.of(
                    "success", false, "message", "Tạo đơn hàng thất bại ạ 😔"));

            int customerTradingId = ((Number) trading.get("id")).intValue();

            // 6. Tạo order
            String paymentMethodEnum = "bank".equals(req.paymentMethod)
                    ? "BANK_TRANSFER" : "CASH";

            Map<String, Object> orderBody = new HashMap<>();
            orderBody.put("customerTradingId", customerTradingId);
            orderBody.put("note",              req.note != null ? req.note : "");
            orderBody.put("account_id",        userId);
            orderBody.put("paymentMethod",     paymentMethodEnum);

            Map<String, Object> order = orderClient.createOrder(orderBody, token);
            if (order == null) return ResponseEntity.ok(Map.of(
                    "success", false, "message", "Tạo đơn hàng thất bại ạ 😔"));

            int orderId = ((Number) order.get("id")).intValue();

            // 7. Tạo order-detail
            Map<String, Object> detailBody = new HashMap<>();
            detailBody.put("productName",  req.productName);
            detailBody.put("quantity",     req.quantity);
            detailBody.put("unitPrice",    req.price);
            detailBody.put("totalPrice",   req.price * req.quantity);
            detailBody.put("orderId",      orderId);
            detailBody.put("productId",    req.productId);
            detailBody.put("sizeDetailId", req.sizeDetailId);

            orderClient.createOrderDetail(detailBody, token);

            // 8. Nếu bank → tạo invoice → trả invoiceCode để FE navigate /payment
            if ("bank".equals(req.paymentMethod)) {
                Map<String, Object> invoiceBody = new HashMap<>();
                invoiceBody.put("orderId",        orderId);
                invoiceBody.put("paymentMethod",  "BANK_TRANSFER");
                invoiceBody.put("paymentStatus",  "UNPAID");

                Map<String, Object> invoice = orderClient.createInvoice(invoiceBody, token);
                if (invoice == null) return ResponseEntity.ok(Map.of(
                        "success", false, "message", "Tạo hóa đơn thất bại ạ 😔"));

                // FE dùng paymentInfo này để navigate /payment (giống Checkout)
                return ResponseEntity.ok(Map.of(
                        "success",     true,
                        "paymentMethod", "bank",
                        "paymentInfo", Map.of(
                                "orderId",      orderId,
                                "amount",       totalAmount,
                                "invoiceId",    ((Number) invoice.get("id")).intValue(),
                                "invoiceCode",  invoice.getOrDefault("invoiceCode", "")
                        ),
                        "message", "Đặt hàng thành công! Đang chuyển đến trang thanh toán 🎉"));
            }

            // 9. Cash → done
            return ResponseEntity.ok(Map.of(
                    "success",       true,
                    "paymentMethod", "cash",
                    "orderId",       orderId,
                    "message",       "Đặt hàng thành công! Cảm ơn anh/chị đã mua hàng 🎉"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Có lỗi xảy ra ạ 😔 " + e.getMessage()));
        }
    }

    // ── Inner class ───────────────────────────────────────────────────────────

    public static class PromptRequest {
        private String prompt;
        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }
    }

    // ── OrderConfirmRequest ───────────────────────────────────────────────────
    public static class OrderConfirmRequest {
        public int    productId;
        public String productName;
        public int    sizeDetailId;
        public int    quantity;
        public double price;
        public int    addressId;
        public String paymentMethod; // "cash" | "bank"
        public String note;
    }

}