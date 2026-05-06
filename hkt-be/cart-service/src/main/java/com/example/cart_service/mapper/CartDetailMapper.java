package com.example.cart_service.mapper;

import com.example.cart_service.dto.response.CartDetailResponse;
import com.example.cart_service.entities.CartDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartDetailMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "sizeDetail.size.nameSize", target = "sizeName")
    @Mapping(source = "product.imageUrlFront", target = "productImage")
    @Mapping(source = "price_at_time", target = "priceAtTime")
    @Mapping(source = "selected",                  target = "selected")
    @Mapping(source = "cart.id",                   target = "cartId")
    CartDetailResponse toCartDetailResponse(CartDetail cartDetail);


}
