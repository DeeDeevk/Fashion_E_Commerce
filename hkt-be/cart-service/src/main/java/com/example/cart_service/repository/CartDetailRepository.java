package com.example.cart_service.repository;


import com.example.cart_service.entities.Cart;
import com.example.cart_service.entities.CartDetail;
import com.example.cart_service.entities.Product;
import com.example.cart_service.entities.SizeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartDetailRepository extends JpaRepository<CartDetail, Integer> {


    CartDetail findByCartAndProductAndSizeDetail(Cart cart, Product product, SizeDetail sizeDetail);
    List<CartDetail> findByCart(Cart cart);
    List<CartDetail> findByIsSelectedAndCart(boolean isSelected, Cart cart);
    List<CartDetail> findByCartId(int cartId);
}