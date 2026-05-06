package com.example.cart_service.service;

import com.example.cart_service.dto.request.CartRequest;
import com.example.cart_service.dto.request.CartUpdateRequest;
import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.entities.Cart;
import com.example.cart_service.mapper.CartMapper;
import com.example.cart_service.repository.CartDetailRepository;
import com.example.cart_service.repository.CartRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

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

    public CartResponse getCartByAccountId(int accountId) {
        Cart cart = cartRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Cart not found for account: " + accountId));
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
        Cart cart = cartRepository.findById(cartId).orElse(null);
        cart.setTotalQuantity(cart.getTotalQuantity() - 1);
        if(cart.getTotalQuantity() > 0){
            cart.setTotalAmount(cart.getTotalAmount() - cartPriceRequest.getPrice());
        }else {
            cart.setTotalQuantity(0);
        }
        cart.setTotalAmount(cart.getTotalAmount() - cartPriceRequest.getPrice());
        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }

    public CartResponse updateCartDelete(int cartId, CartUpdateRequest cartPriceRequest) {
        Cart cart = cartRepository.findById(cartId).orElse(null);
        cart.setTotalQuantity(cart.getTotalQuantity() - cartPriceRequest.getQuantity());
        if(cart.getTotalQuantity() > 0) {
            cart.setTotalAmount(cart.getTotalAmount() - cartPriceRequest.getPrice());
        }else {
            cart.setTotalQuantity(0);
        }
        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }
}
