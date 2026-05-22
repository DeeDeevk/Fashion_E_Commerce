package com.example.chat_service.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmbeddingService {

    private final WebClient jinaClient;
    private final WebClient groqClient;

    public EmbeddingService(
            @Qualifier("jinaWebClient") WebClient jinaClient,
            @Qualifier("groqWebClient") WebClient groqClient) {
        this.jinaClient = jinaClient;
        this.groqClient = groqClient;
    }

    // Dùng khi upsert sản phẩm vào Qdrant
    public List<Float> embedPassage(String text) {
        return callJina(text, "retrieval.passage");
    }

    // Dùng khi search (user hỏi)
    public List<Float> embedQuery(String text) {
        return callJina(text, "retrieval.query");
    }

    // Backward-compatible: mặc định dùng passage (upsert)
    public List<Float> embed(String text) {
        return embedPassage(text);
    }

    private List<Float> callJina(String text, String task) {
        Map<String, Object> body = Map.of(
                "model", "jina-embeddings-v5-text-small",
                "task", task,
                "normalized", true,
                "input", List.of(text)
        );

        Map<String, Object> response = jinaClient.post()
                .uri("/v1/embeddings")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        List<Double> embedding = (List<Double>) data.get(0).get("embedding");

        return embedding.stream()
                .map(Double::floatValue)
                .collect(Collectors.toList());
    }

    // Dịch tiếng Việt → tiếng Anh trước khi embed query
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
            return vietnameseText;
        }
    }
}