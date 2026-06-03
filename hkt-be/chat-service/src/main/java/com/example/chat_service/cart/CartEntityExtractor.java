package com.example.chat_service.cart;

import com.example.chat_service.service.GroqService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Layer 2 — Entity Extraction.
 *
 * Dùng Groq để extract thông tin có cấu trúc từ câu tự nhiên tiếng Việt.
 * Output sạch hơn nhiều so với regex stripping vì LLM hiểu ngữ nghĩa.
 *
 * Ví dụ:
 *   input  = "xóa cái áo kẻ sọc trắng đen đó đi nha"
 *   output = { productName: "áo kẻ sọc trắng đen", size: "M", quantity: 1 }
 *
 *   input  = "thêm 2 quần jogger size L vào giỏ giúp em với"
 *   output = { productName: "quần jogger", size: "L", quantity: 2 }
 */
@Component
@RequiredArgsConstructor
public class CartEntityExtractor {

    private final GroqService groqService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Result ────────────────────────────────────────────────────────────────

    public static class ExtractedEntities {
        public String productName = "";  // tên sản phẩm thuần túy, không có action words
        public String size        = "M"; // XS/S/M/L/XL/XXL
        public int    quantity    = 1;
        public boolean fromContext = false; // true nếu productName trống (user dùng đại từ)

        @Override
        public String toString() {
            return String.format("ExtractedEntities{productName='%s', size='%s', qty=%d, fromContext=%b}",
                    productName, size, quantity, fromContext);
        }
    }

    // ── System prompt — rất ngắn gọn để Groq trả nhanh ──────────────────────

    private static final String SYSTEM_PROMPT = """
            Bạn là parser JSON. Nhiệm vụ: extract thông tin từ câu tiếng Việt của người dùng.
            
            Output PHẢI là JSON thuần (không có markdown, không có ```json, không giải thích):
            {"productName":"...","size":"...","quantity":N}
            
            Quy tắc extract:
            - productName: CHỈ tên sản phẩm. Bỏ hết: "thêm", "xóa", "mua", "giỏ hàng", "cart",
              "cho tôi", "giúp em", "nhé", "nha", "ạ", "đi", "với", "vào giỏ", "khỏi giỏ",
              "cái này", "sản phẩm đó", "nó", "vậy", số lượng, size.
              Nếu không có tên cụ thể (chỉ có đại từ như "nó","cái đó") → productName = ""
            - size: XS/S/M/L/XL/XXL. "size lớn"→L, "size nhỏ"→S, "size vừa"→M.
              Mặc định "M" nếu không nhắc.
            - quantity: số nguyên dương. "hai"→2, "một"→1, "vài"→2. Mặc định 1.
            
            Ví dụ:
            input: "thêm 2 cái quần jogger size L vào giỏ"
            output: {"productName":"quần jogger","size":"L","quantity":2}
            
            input: "xóa nó đi"
            output: {"productName":"","size":"M","quantity":1}
            
            input: "mua áo polo trắng size XL cho tôi nhé"
            output: {"productName":"áo polo trắng","size":"XL","quantity":1}
            """;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Extract entities từ câu user.
     * Fallback an toàn: nếu Groq fail → trả về empty ExtractedEntities
     * để layer tiếp theo (context / vector search) xử lý.
     */
    public ExtractedEntities extract(String userPrompt) {
        if (userPrompt == null || userPrompt.isBlank()) return fallback();

        try {
            String raw = groqService.generateText(SYSTEM_PROMPT, userPrompt);
            if (raw == null || raw.isBlank()) {
                System.err.println("[CartEntityExtractor] Groq returned null/blank");
                return fallback();
            }

            // Strip markdown nếu Groq vẫn trả ```json ... ``` dù đã dặn rồi
            String json = raw.replaceAll("(?s)```json\\s*|```", "").trim();
            // Lấy phần JSON đầu tiên nếu có text thừa
            int start = json.indexOf('{');
            int end   = json.lastIndexOf('}');
            if (start >= 0 && end > start) {
                json = json.substring(start, end + 1);
            }

            var map = objectMapper.readValue(json, java.util.Map.class);
            ExtractedEntities result = new ExtractedEntities();

            // productName
            Object name = map.get("productName");
            result.productName = (name != null) ? name.toString().trim() : "";
            result.fromContext  = result.productName.isBlank();

            // size
            Object size = map.get("size");
            result.size = resolveSize(size != null ? size.toString() : "");

            // quantity
            Object qty = map.get("quantity");
            if (qty instanceof Number) {
                result.quantity = Math.max(1, ((Number) qty).intValue());
            } else if (qty != null) {
                try { result.quantity = Math.max(1, Integer.parseInt(qty.toString())); }
                catch (NumberFormatException ignored) { result.quantity = 1; }
            }

            System.out.printf("[CartEntityExtractor] '%s' → %s%n", userPrompt, result);
            return result;

        } catch (Exception e) {
            System.err.printf("[CartEntityExtractor] Parse failed for '%s': %s%n",
                    userPrompt, e.getMessage());
            return fallback();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Normalize size string về XS/S/M/L/XL/XXL.
     * Groq đôi khi trả "size L", "l", "Large", v.v.
     */
    private String resolveSize(String raw) {
        if (raw == null || raw.isBlank()) return "M";
        String s = raw.toUpperCase().replaceAll("SIZE\\s*", "").trim();
        return switch (s) {
            case "XS", "EXTRA SMALL" -> "XS";
            case "S",  "SMALL"       -> "S";
            case "L",  "LARGE"       -> "L";
            case "XL", "EXTRA LARGE" -> "XL";
            case "XXL","DOUBLE XL"   -> "XXL";
            default                  -> "M"; // M, MEDIUM, hoặc anything unknown
        };
    }

    private ExtractedEntities fallback() {
        ExtractedEntities e = new ExtractedEntities();
        e.fromContext = true; // coi như không extract được gì
        return e;
    }
}