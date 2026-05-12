package com.example.chat_service.service;

import com.example.chat_service.entities.Product;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductSyncService {

    private final VectorStoreService vectorStoreService;
    private final ProductCacheService productCacheService;

    // Chạy 1 lần khi khởi động + mỗi 30 phút sync lại
    @PostConstruct
    public void syncOnStartup() {
        syncAll();
    }

    @Scheduled(fixedDelay = 30 * 60 * 1000)
    @Transactional
    public void syncAll() {
        List<Product> products = productCacheService.getAllProducts();
        products.forEach(vectorStoreService::upsertProduct);
        System.out.println("Synced " + products.size() + " products to Qdrant");
    }

    // Gọi khi có sản phẩm mới / cập nhật (event-driven tốt hơn)
    public void syncOne(Product product) {
        vectorStoreService.upsertProduct(product);
    }
}
