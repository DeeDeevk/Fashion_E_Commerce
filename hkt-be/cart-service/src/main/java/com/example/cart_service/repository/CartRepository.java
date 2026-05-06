package com.example.cart_service.repository;

import com.example.cart_service.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByAccountId(int accountId);
}
