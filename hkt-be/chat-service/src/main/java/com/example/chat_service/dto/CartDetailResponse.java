package com.example.chat_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CartDetailResponse {

    @JsonProperty("id")
    private int cartDetailId;

    private int cartId;

    private int productId;

    private String productName;

    private String productImage;

    private String sizeName;

    private int sizeDetailId;

    private int quantity;

    private double priceAtTime;

    private double subtotal;

    private boolean selected;
}