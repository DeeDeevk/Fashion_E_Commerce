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
        public String size        = ""; // XS/S/M/L/XL/XXL
        public int    quantity    = 0;
        public boolean fromContext = false; // true nếu productName trống (user dùng đại từ)

        @Override
        public String toString() {
            return String.format("ExtractedEntities{productName='%s', size='%s', qty=%d, fromContext=%b}",
                    productName, size, quantity, fromContext);
        }
    }

    // ── System prompt — rất ngắn gọn để Groq trả nhanh ──────────────────────

    private static final String SYSTEM_PROMPT = """
    Bạn là parser JSON chuyên nghiệp. Nhiệm vụ: extract thông tin từ câu tiếng Việt của người dùng một cách chính xác.

    Output PHẢI là JSON thuần (không markdown, không ```json, không giải thích thêm):
    {"productName":"...","size":"...","quantity":N}

    Quy tắc extract nghiêm ngặt:
    - productName: CHỈ tên sản phẩm thuần túy. Bỏ hết các từ hành động ("thêm", "xóa", "mua", "đặt", "giỏ hàng", "cart", "cho tôi", "giúp em", "nhé", "nha", "ạ", "đi", "với", "vào giỏ", "khỏi giỏ", "cái này", "sản phẩm đó", "nó", "vậy đó"...). 
      Nếu chỉ có đại từ ("nó", "cái đó", "cái này", "thứ đó") → productName = ""

    - size: Chỉ extract nếu user nói rõ (XS, S, M, L, XL, XXL, size lớn, size nhỏ, size vừa...). 
      Nếu không nhắc đến size → size phải là chuỗi rỗng ""

    - quantity: Chỉ extract số lượng cụ thể ("2 cái", "ba chiếc", "một", "vài"). 
      Nếu không đề cập số lượng → quantity = 0

    TUYỆT ĐỐI KHÔNG tự động điền mặc định "M" hoặc 1.

    Ví dụ:
    input: "thêm 2 cái quần jogger size L vào giỏ"
    output: {"productName":"quần jogger","size":"L","quantity":2}

    input: "xóa nó đi"
    output: {"productName":"","size":"","quantity":0}

    input: "mua áo polo trắng size XL cho tôi nhé"
    output: {"productName":"áo polo trắng","size":"XL","quantity":1}

    input: "thêm áo thun vào giỏ"
    output: {"productName":"áo thun","size":"","quantity":0}

    input: "thêm quần jeans size L"
    output: {"productName":"quần jeans","size":"L","quantity":0}
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
            Object sizeObj = map.get("size");
            result.size = resolveSize(sizeObj != null ? sizeObj.toString() : "");

            // quantity
            Object qtyObj = map.get("quantity");
            if (qtyObj instanceof Number) {
                result.quantity = ((Number) qtyObj).intValue();
            } else if (qtyObj != null) {
                try {
                    result.quantity = Integer.parseInt(qtyObj.toString());
                } catch (NumberFormatException ignored) {
                    result.quantity = 0;
                }
            } else {
                result.quantity = 0;
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
        if (raw == null || raw.isBlank()) {
            return "";
        }
        String s = raw.toUpperCase().replaceAll("SIZE\\s*", "").trim();
        return switch (s) {
            case "XS", "EXTRA SMALL" -> "XS";
            case "S",  "SMALL"       -> "S";
            case "L",  "LARGE"       -> "L";
            case "XL", "EXTRA LARGE" -> "XL";
            case "XXL","DOUBLE XL"   -> "XXL";
            default                  -> ""; // M, MEDIUM, hoặc anything unknown
        };
    }

    private ExtractedEntities fallback() {
        ExtractedEntities e = new ExtractedEntities();
        e.fromContext = true;
        e.size = "";
        e.quantity = 0;
        return e;
    }
}