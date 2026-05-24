package com.example.cart_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDetailResponse {
    private int id;
    private int cartId;
    private int productId;
    private String productName;
    private String productImage;
    private String sizeName;
    private int quantity;
    private double priceAtTime;
    private double subtotal;
    private boolean selected;
    private int sizeDetailId;
    private Date createAt;
    private Date updateAt;

    // THÊM TRƯỜNG NÀY ĐỂ TRẢ VỀ SỐ LƯỢNG KHO THỰC TẾ CỦA SIZE ĐÓ
    private int stock;
}
