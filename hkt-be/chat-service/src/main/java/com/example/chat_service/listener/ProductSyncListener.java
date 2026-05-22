package com.example.chat_service.listener;

import com.example.chat_service.config.RabbitMQConfig;
import com.example.chat_service.service.ProductSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductSyncListener {

    private final ProductSyncService productSyncService;

    @RabbitListener(queues = RabbitMQConfig.PRODUCT_QUEUE)
    public void onProductUpsert(Long productId) {
        System.out.println("Received product sync event: " + productId);
        productSyncService.syncOneById(productId);
    }
}