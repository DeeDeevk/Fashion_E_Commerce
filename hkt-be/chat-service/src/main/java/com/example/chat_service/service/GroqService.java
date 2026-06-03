package com.example.chat_service.service;

import com.example.chat_service.cart.CartEntityExtractor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Service
public class GroqService {

    @Value("${groq.model}")
    private String model;

    private final WebClient    webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String ENTITY_EXTRACT_PROMPT = """
            Bạn là parser JSON. Nhiệm vụ: extract thông tin từ câu tiếng Việt của người dùng.
            
            Output PHẢI là JSON thuần (không có markdown, không có ```json, không giải thích):
            {"productName":"...","size":"...","quantity":N}
            
            Quy tắc extract:
            - productName: CHỈ tên sản phẩm thuần túy.
              Bỏ hết: "thêm", "xóa", "mua", "giỏ hàng", "cart", "cho tôi", "giúp em",
              "nhé", "nha", "ạ", "đi", "với", "vào giỏ", "khỏi giỏ",
              "cái này", "sản phẩm đó", "nó", "vậy", số lượng, size.
              Nếu không có tên cụ thể (chỉ có đại từ như "nó","cái đó","size L") → productName = ""
            - size: XS/S/M/L/XL/XXL.
              "size lớn"→L, "size nhỏ"→S, "size vừa"→M. Mặc định "M".
            - quantity: số nguyên dương. "hai"→2, "một"→1, "vài"→2. Mặc định 1.
            
            Ví dụ:
            input: "thêm 2 cái quần jogger size L vào giỏ"
            output: {"productName":"quần jogger","size":"L","quantity":2}
            
            input: "size L"
            output: {"productName":"","size":"L","quantity":1}
            
            input: "mua áo polo trắng size XL cho tôi nhé"
            output: {"productName":"áo polo trắng","size":"XL","quantity":1}
            
            input: "xóa nó đi"
            output: {"productName":"","size":"M","quantity":1}
            """;

    public GroqService(@Qualifier("groqWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    // ── 1. Single-turn — giữ nguyên cho CartEntityExtractor ──────────────────

    public String generateText(String systemPrompt, String userPrompt) {
        List<Map<String, Object>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user",   "content", userPrompt)
        );
        return callGroq(messages, 512);
    }

    // ── 2. Multi-turn — gọi với history thật sự từ AgentSession ──────────────

    /**
     * Gọi Groq với lịch sử hội thoại thật sự dưới dạng List<Message>.
     *
     * Khác generateText(): không ghép history vào string mà truyền đúng
     * định dạng multi-turn của OpenAI-compatible API.
     *
     * @param systemPrompt  system prompt
     * @param history       Deque từ AgentSession — index 0 = mới nhất (cần reverse)
     * @param userMessage   tin nhắn hiện tại đã augment với RAG context
     */
    public String chat(String systemPrompt,
                       Deque<String[]> history,
                       String userMessage) {

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // history.addFirst() → index 0 mới nhất → cần reverse để API nhận đúng thứ tự cũ→mới
        List<String[]> ordered = new ArrayList<>(history);
        Collections.reverse(ordered);
        for (String[] pair : ordered) {
            messages.add(Map.of("role", "user",      "content", pair[0]));
            messages.add(Map.of("role", "assistant", "content", pair[1]));
        }

        messages.add(Map.of("role", "user", "content", userMessage));

        return callGroq(messages, 512);
    }

    // ── 3. Entity extraction — dùng trong slot filling của AgentOrchestrator ──

    /**
     * Extract productName / size / quantity từ câu ngắn của user.
     *
     * Tái sử dụng logic từ CartEntityExtractor nhưng gọi trực tiếp từ đây
     * để AgentOrchestrator không cần phụ thuộc vào CartEntityExtractor.
     */
    public CartEntityExtractor.ExtractedEntities extractEntities(String userPrompt) {
        if (userPrompt == null || userPrompt.isBlank()) return fallbackEntities();

        try {
            String raw = generateText(ENTITY_EXTRACT_PROMPT, userPrompt);
            if (raw == null || raw.isBlank()) return fallbackEntities();

            // Strip markdown fence nếu model vẫn trả dù đã dặn
            String json = raw.replaceAll("(?s)```json\\s*|```", "").trim();
            int start = json.indexOf('{');
            int end   = json.lastIndexOf('}');
            if (start < 0 || end <= start) return fallbackEntities();
            json = json.substring(start, end + 1);

            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(json, Map.class);

            CartEntityExtractor.ExtractedEntities result =
                    new CartEntityExtractor.ExtractedEntities();

            Object name = map.get("productName");
            result.productName  = (name != null) ? name.toString().trim() : "";
            result.fromContext  = result.productName.isBlank();

            Object size = map.get("size");
            result.size = resolveSize(size != null ? size.toString() : "");

            Object qty = map.get("quantity");
            if (qty instanceof Number n) {
                result.quantity = Math.max(1, n.intValue());
            } else if (qty != null) {
                try   { result.quantity = Math.max(1, Integer.parseInt(qty.toString())); }
                catch (NumberFormatException ignored) { result.quantity = 1; }
            }

            System.out.printf("[GroqService.extractEntities] '%s' → %s%n",
                    userPrompt, result);
            return result;

        } catch (Exception e) {
            System.err.printf("[GroqService.extractEntities] Failed for '%s': %s%n",
                    userPrompt, e.getMessage());
            return fallbackEntities();
        }
    }

    // ── Internal: gọi Groq API ────────────────────────────────────────────────

    private String callGroq(List<Map<String, Object>> messages, int maxTokens) {
        Map<String, Object> body = Map.of(
                "model",       model,
                "max_tokens",  maxTokens,
                "temperature", 0.7,
                "messages",    messages
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || !response.containsKey("choices")) return null;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) return null;

            @SuppressWarnings("unchecked")
            Map<String, Object> message =
                    (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (WebClientResponseException e) {
            System.err.println("Groq API error: " + e.getStatusCode()
                    + " | " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            System.err.println("Error calling Groq API: " + e.getMessage());
            return null;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String resolveSize(String raw) {
        if (raw == null || raw.isBlank()) return "M";
        String s = raw.toUpperCase().replaceAll("SIZE\\s*", "").trim();
        return switch (s) {
            case "XS", "EXTRA SMALL" -> "XS";
            case "S",  "SMALL"       -> "S";
            case "L",  "LARGE"       -> "L";
            case "XL", "EXTRA LARGE" -> "XL";
            case "XXL","DOUBLE XL"   -> "XXL";
            default                  -> "M";
        };
    }

    private CartEntityExtractor.ExtractedEntities fallbackEntities() {
        CartEntityExtractor.ExtractedEntities e =
                new CartEntityExtractor.ExtractedEntities();
        e.fromContext = true;
        return e;
    }
}