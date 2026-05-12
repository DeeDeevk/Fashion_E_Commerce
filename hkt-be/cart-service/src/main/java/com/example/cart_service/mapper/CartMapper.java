package com.example.cart_service.mapper;

import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.entities.Cart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CartDetailMapper.class})
public interface CartMapper {

    @Mapping(source = "cart_details", target = "cartDetails")
    CartResponse toCartResponse(Cart cart);
}