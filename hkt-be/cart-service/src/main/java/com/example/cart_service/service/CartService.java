package com.example.cart_service.service;

import com.example.cart_service.dto.request.CartRequest;
import com.example.cart_service.dto.request.CartUpdateRequest;
import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.entities.Cart;
import com.example.cart_service.entities.CartDetail;
import com.example.cart_service.mapper.CartMapper;
import com.example.cart_service.repository.CartDetailRepository;
import com.example.cart_service.repository.CartRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor

public class CartService {
    CartRepository cartRepository;
    CartDetailRepository cartDetailRepository;
    CartMapper cartMapper;

    public Cart saveCart(Cart cart){
        return cartRepository.save(cart);
    }

    @Transactional
    public CartResponse getCartByAccountId(int accountId) {

        Cart cart = cartRepository.findByAccountId(accountId)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found for account: " + accountId));

        // lấy cart details
        List<CartDetail> details = cartDetailRepository.findByCartId(cart.getId());

        // tính realtime
        int totalQuantity = details.stream()
                .mapToInt(CartDetail::getQuantity)
                .sum();

        double totalAmount = details.stream()
                .mapToDouble(CartDetail::getSubtotal)
                .sum();

        // update lại cart
        cart.setTotalQuantity(totalQuantity);
        cart.setTotalAmount(totalAmount);

        cartRepository.save(cart);

        return cartMapper.toCartResponse(cart);
    }
    public CartResponse updateCart(int cartId, CartRequest cartRequest) {
        Cart cart = cartRepository.findById(cartId).orElse(null);
        cart.setTotalQuantity(cart.getTotalQuantity()    + cartRequest.getQuantity());
        cart.setTotalAmount(cart.getTotalAmount() + cartRequest.getTotalAmount());
        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }
    public CartResponse updateCartIncrease(int cartId, CartUpdateRequest cartPriceRequest) {
        Cart cart = cartRepository.findById(cartId).orElse(null);
        cart.setTotalQuantity(cart.getTotalQuantity() + 1);
        cart.setTotalAmount(cart.getTotalAmount() + cartPriceRequest.getPrice());
        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }

    public CartResponse updateCartDecrease(int cartId, CartUpdateRequest cartPriceRequest) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        int newQuantity = Math.max(0, cart.getTotalQuantity() - 1);

        double newAmount = Math.max(
                0,
                cart.getTotalAmount() - cartPriceRequest.getPrice()
        );

        cart.setTotalQuantity(newQuantity);
        cart.setTotalAmount(newAmount);

        cartRepository.save(cart);

        return cartMapper.toCartResponse(cart);
    }

    public CartResponse updateCartDelete(int cartId, CartUpdateRequest cartPriceRequest) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        int newQuantity = Math.max(
                0,
                cart.getTotalQuantity() - cartPriceRequest.getQuantity()
        );

        double newAmount = Math.max(
                0,
                cart.getTotalAmount() - cartPriceRequest.getPrice()
        );

        cart.setTotalQuantity(newQuantity);
        cart.setTotalAmount(newAmount);

        cartRepository.save(cart);

        return cartMapper.toCartResponse(cart);
    }
}
