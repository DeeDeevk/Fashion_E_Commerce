package com.example.chat_service.controller;


import com.example.chat_service.service.GroqService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final GroqService groqService;
    private final ProductCacheService productCacheService;

    // Mỗi entry: [userMsg, botMsg] — giữ 5 cặp gần nhất
    private static final Map<String, Deque<String[]>> chatHistory = new ConcurrentHashMap<>();
    private static final int MAX_PAIRS = 5;

    // ── System prompt CỐ ĐỊNH, không thay đổi theo request → tiết kiệm token ──
    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý mua sắm dễ thương của KH3T Shop.
            Xưng "em", gọi khách là "anh/chị", dùng emoji.
            Trả lời ngắn gọn tối đa 3 câu.
            Thông tin shop:
            - Ship toàn quốc, đổi trả 7 ngày lỗi NSX
            - Hotline/Zalo: 0903.456.789 | MrK: 0794263939
            - Giờ làm: 8h30–22h00
            - Đặt hàng: chọn sản phẩm → chọn size → nhập thông tin → thanh toán (bank/ví/tiền mặt)
            """;

    public ChatController(GroqService groqService, ProductCacheService productCacheService) {
        this.groqService = groqService;
        this.productCacheService = productCacheService;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> askGroq(
            HttpServletRequest request,
            @RequestBody PromptRequest promptRequest
    ) {
        String token = extractToken(request.getHeader("Authorization"));
        String userPrompt = promptRequest.getPrompt().trim();

        if (userPrompt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Dạ anh/chị nhắn gì cho em với ạ! 😊",
                    "suggestedProducts", List.of()
            ));
        }

        String userId = token != null ? "user_" + token : "guest";
        Deque<String[]> history = chatHistory.computeIfAbsent(userId, k -> new ArrayDeque<>());

        // ── Tạo user prompt GỬI LÊN GROQ (gồm lịch sử + product tóm tắt) ──
        String userMessage = buildUserMessage(userPrompt, history);

        try {
            String reply = groqService.generateText(SYSTEM_PROMPT, userMessage);
            String botReply = (reply == null || reply.isBlank())
                    ? "Dạ để em kiểm tra lại giúp anh/chị nha! 🙏"
                    : reply.trim();

            // Lưu cặp hội thoại mới vào lịch sử
            savePair(history, userPrompt, botReply);

            List<Map<String, Object>> suggestedProducts = findSuggestedProducts(botReply);
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
                    "suggestedProducts", List.of()
            ));
        }
    }

    // ── Tạo nội dung user message gửi lên AI ──────────────────────────────────
    private String buildUserMessage(String userPrompt, Deque<String[]> history) {
        StringBuilder sb = new StringBuilder();

        // 1. Lịch sử 5 cặp gần nhất (ngắn gọn)
        if (!history.isEmpty()) {
            sb.append("Lịch sử gần đây:\n");
            // Deque đầu = mới nhất → đảo ngược để hiển thị cũ→mới
            List<String[]> pairs = new ArrayList<>(history);
            Collections.reverse(pairs);
            for (String[] pair : pairs) {
                sb.append("KH: ").append(pair[0]).append("\n");
                sb.append("Bot: ").append(pair[1]).append("\n");
            }
            sb.append("\n");
        }

        // 2. Danh sách sản phẩm rút gọn (chỉ tên | giá | size)
        sb.append(buildCompactProductList());
        sb.append("\n");

        // 3. Câu hỏi hiện tại
        sb.append("Khách hỏi: ").append(userPrompt);

        return sb.toString();
    }

    /**
     * Chỉ gửi: Tên | Giá | Size còn hàng
     * Bỏ mô tả dài, chất liệu, form, rating → giảm ~60–70% token product
     */
    private String buildCompactProductList() {
        List<Product> products = productCacheService.getAllProducts();
        if (products.isEmpty()) return "Shop đang cập nhật sản phẩm.\n";

        StringBuilder sb = new StringBuilder("Sản phẩm:\n");

        for (Product p : products) {

            String sizes = (p.getSizeDetails() == null || p.getSizeDetails().isEmpty())
                    ? "hết"
                    : p.getSizeDetails().stream()
                    .filter(sd -> sd.getQuantity() > 0)
                    .map(sd -> sd.getSize().getNameSize().toString()) // FIX
                    .collect(Collectors.joining(","));

            sb.append(String.format(
                    "- %s | %,.0fđ | size: %s\n",
                    p.getName(),
                    p.getCostPrice(),
                    sizes.isEmpty() ? "hết" : sizes
            ));
        }

        return sb.toString();
    }

    // ── Lưu cặp hội thoại, giữ tối đa MAX_PAIRS ──────────────────────────────
    private void savePair(Deque<String[]> history, String userMsg, String botMsg) {
        history.addFirst(new String[]{userMsg, botMsg});
        while (history.size() > MAX_PAIRS) {
            history.removeLast();
        }
    }

    // ── Tìm sản phẩm được nhắc trong câu trả lời bot ─────────────────────────
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
                .distinct()
                .limit(5)
                .collect(Collectors.toList());
    }

    // ── Phát hiện yêu cầu so sánh ────────────────────────────────────────────
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
            if (text.contains(name) || text.contains(name.replace(" ", ""))) {
                ids.add((long) p.getId());
            }
        }
        return (ids.size() >= 2 && ids.size() <= 4) ? new ArrayList<>(ids) : null;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private String extractToken(String header) {
        if (header == null || !header.startsWith("Bearer ")) return null;
        return header.substring(7).trim();
    }

    public static class PromptRequest {
        private String prompt;
        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }
    }
}