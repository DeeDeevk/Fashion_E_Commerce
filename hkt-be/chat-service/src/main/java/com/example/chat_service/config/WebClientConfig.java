package com.example.chat_service.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    // ── Groq AI (external) ────────────────────────────────────────────────────
    @Bean("groqWebClient")
    public WebClient groqWebClient(
            @Value("${groq.api.url}") String groqApiUrl,
            @Value("${groq.api.key}") String groqApiKey) {
        return WebClient.builder()
                .baseUrl(groqApiUrl)
                .defaultHeader("Authorization", "Bearer " + groqApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // ── Jina AI (external) ────────────────────────────────────────────────────
    @Bean("jinaWebClient")
    public WebClient jinaWebClient(
            @Value("${jina.api.key}") String jinaApiKey) {
        return WebClient.builder()
                .baseUrl("https://api.jina.ai")
                .defaultHeader("Authorization", "Bearer " + jinaApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // ── Load-balanced builder (Eureka) ────────────────────────────────────────
    @Bean("loadBalancedBuilder")
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }

    // ── Cart Service (internal) ───────────────────────────────────────────────
    @Bean("cartWebClient")
    public WebClient cartWebClient(
            @Qualifier("loadBalancedBuilder") WebClient.Builder loadBalancedBuilder) {
        return loadBalancedBuilder
                .baseUrl("lb://cart-service")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // ── Order Service (internal) ──────────────────────────────────────────────
    @Bean("orderWebClient")
    public WebClient orderWebClient(
            @Qualifier("loadBalancedBuilder") WebClient.Builder loadBalancedBuilder) {
        return loadBalancedBuilder
                .baseUrl("lb://order-service")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}