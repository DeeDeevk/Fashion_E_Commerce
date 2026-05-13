package com.example.chat_service.repository;

import com.example.chat_service.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.sizeDetails sd
        LEFT JOIN FETCH sd.size
        WHERE p.quantity > 0
    """)
    List<Product> findAllWithDetails();
}