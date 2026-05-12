package com.example.chat_service.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    // Bean cho Groq API (external)
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

    @Bean("ollamaWebClient")
    public WebClient ollamaWebClient(
            @Value("${ollama.url}") String ollamaUrl) {
        return WebClient.builder()
                .baseUrl(ollamaUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean("cartWebClient")
    public WebClient cartWebClient(
            @Qualifier("loadBalancedBuilder") WebClient.Builder loadBalancedBuilder) {
        return loadBalancedBuilder
                .baseUrl("lb://cart-service")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // Bean cho internal service (Eureka load balanced)
    @Bean("loadBalancedBuilder")
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }
}