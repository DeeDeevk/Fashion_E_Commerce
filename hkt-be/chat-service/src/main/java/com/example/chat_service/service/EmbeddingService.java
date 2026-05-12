package com.example.chat_service.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// EmbeddingService.java — thêm method translate
@Service
public class EmbeddingService {

    @Value("${ollama.model}")
    private String ollamaModel;

    private final WebClient ollamaClient;
    private final WebClient groqClient;

    public EmbeddingService(
            @Qualifier("ollamaWebClient") WebClient ollamaClient,
            @Qualifier("groqWebClient") WebClient groqClient) {
        this.ollamaClient = ollamaClient;
        this.groqClient = groqClient;
    }

    // ✅ Dịch câu hỏi tiếng Việt → tiếng Anh trước khi embed
    public String translateToEnglish(String vietnameseText) {
        Map<String, Object> body = Map.of(
                "model", "llama-3.3-70b-versatile",
                "max_tokens", 100,
                "temperature", 0,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "Translate Vietnamese to English. Return ONLY the translated text, no explanation."),
                        Map.of("role", "user", "content", vietnameseText)
                )
        );

        try {
            Map<String, Object> response = groqClient.post()
                    .uri("/chat/completions")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) response.get("choices");
            String translated = (String) ((Map<String, Object>)
                    choices.get(0).get("message")).get("content");

            System.out.println("Translated: " + vietnameseText + " → " + translated);
            return translated.trim();

        } catch (Exception e) {
            System.err.println("Translate failed, dùng text gốc: " + e.getMessage());
            return vietnameseText; // fallback về text gốc
        }
    }

    public List<Float> embed(String text) {
        Map<String, Object> body = Map.of(
                "model", ollamaModel,
                "prompt", text
        );

        Map<String, Object> response = ollamaClient.post()
                .uri("/api/embeddings")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<Double> embedding = (List<Double>) response.get("embedding");
        return embedding.stream()
                .map(Double::floatValue)
                .collect(Collectors.toList());
    }
}