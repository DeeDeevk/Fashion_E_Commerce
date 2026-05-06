package com.example.cart_service.mapper;


import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.entities.Cart;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartMapper {
    CartResponse toCartResponse(Cart cart);
}