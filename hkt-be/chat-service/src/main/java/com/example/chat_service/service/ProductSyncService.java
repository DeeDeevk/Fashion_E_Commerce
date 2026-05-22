package com.example.chat_service.service;

import com.example.chat_service.entities.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductSyncService {

    private final VectorStoreService vectorStoreService;
    private final ProductCacheService productCacheService;

    // Gọi khi CREATE hoặc UPDATE product
    public void syncOne(Product product) {
        productCacheService.refreshCache();
        vectorStoreService.upsertProduct(product);
        System.out.println("Synced product to Qdrant: " + product.getId());
    }

    // Gọi từ cart service khi add to cart — đảm bảo quantity mới nhất
    public void syncOneById(long productId) {
        productCacheService.refreshCache();
        productCacheService.getAllProducts().stream()
                .filter(p -> p.getId() == productId)
                .findFirst()
                .ifPresentOrElse(
                        p -> {
                            vectorStoreService.upsertProduct(p);
                            System.out.println("Synced product to Qdrant: " + productId);
                        },
                        () -> System.err.println("Product not found in cache: " + productId)
                );
    }
}