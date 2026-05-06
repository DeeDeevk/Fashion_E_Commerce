package com.example.cart_service.controller;

import com.example.cart_service.dto.request.CartRequest;
import com.example.cart_service.dto.request.CartUpdateRequest;
import com.example.cart_service.dto.response.ApiResponse;
import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.entities.Cart;
import com.example.cart_service.service.CartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {
    CartService cartService;

    @GetMapping("/account/{accountId}")
    public ApiResponse<CartResponse> getCartByAccountId(@PathVariable int accountId) {
        CartResponse response = cartService.getCartByAccountId(accountId);
        return ApiResponse.<CartResponse>builder()
                .result(response)
                .build();
    }

    @PutMapping("/update/{cartId}")
    public ApiResponse<CartResponse> updateCart(@PathVariable int cartId, @RequestBody CartRequest cartRequest) {
        CartResponse updated = cartService.updateCart(cartId, cartRequest);
        return ApiResponse.<CartResponse>builder()
                .message("Cart updated")
                .result(updated)
                .build();
    }

    @PutMapping("/update/{cartId}/increase")
    public ApiResponse<CartResponse> updateCartIncrease(@PathVariable int cartId, @RequestBody CartUpdateRequest cartPriceRequest) {
        CartResponse cartResponse = cartService.updateCartIncrease(cartId, cartPriceRequest);
        return ApiResponse.<CartResponse>builder()
                .message("Cart updated")
                .result(cartResponse)
                .build();
    }

    @PutMapping("/update/{cartId}/decrease")
    public ApiResponse<CartResponse> updateCartDecrease(@PathVariable int cartId, @RequestBody CartUpdateRequest cartPriceRequest) {
        CartResponse cartResponse = cartService.updateCartDecrease(cartId, cartPriceRequest);
        return ApiResponse.<CartResponse>builder()
                .message("Cart updated")
                .result(cartResponse)
                .build();
    }

    @PutMapping("/update/{cartId}/delete")
    public ApiResponse<CartResponse> updateCartDelete(@PathVariable int cartId, @RequestBody CartUpdateRequest cartPriceRequest) {
        CartResponse cartResponse = cartService.updateCartDelete(cartId, cartPriceRequest);
        return ApiResponse.<CartResponse>builder()
                .message("Cart updated")
                .result(cartResponse)
                .build();
    }
}
