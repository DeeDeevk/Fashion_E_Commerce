package com.example.chat_service.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartResponse {
    private int cartId;          // ← map từ "id"
    private double totalPrice;   // ← map từ "totalAmount"
    private int totalQuantity;   // ← map từ "totalQuantity"
    private List<CartDetailResponse> cartDetails;
}