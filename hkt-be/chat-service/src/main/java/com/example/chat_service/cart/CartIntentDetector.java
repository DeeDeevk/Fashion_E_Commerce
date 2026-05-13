package com.example.chat_service.cart;

import org.springframework.stereotype.Component;

@Component
public class CartIntentDetector {

    public enum CartIntent {
        ADD_TO_CART,
        REMOVE_FROM_CART,
        VIEW_CART,
        NONE
    }

    public CartIntent detect(String prompt) {
        String lower = prompt.toLowerCase();

        if (hasAddKeyword(lower))    return CartIntent.ADD_TO_CART;
        if (hasRemoveKeyword(lower)) return CartIntent.REMOVE_FROM_CART;
        if (hasViewKeyword(lower))   return CartIntent.VIEW_CART;

        return CartIntent.NONE;
    }

    private boolean hasAddKeyword(String text) {
        return text.contains("thêm vào giỏ")
                || text.contains("bỏ vào giỏ")
                || text.contains("cho vào giỏ")
                || text.contains("đặt")
                || text.contains("mua")
                || text.contains("order")
                || text.contains("add to cart");
    }

    private boolean hasRemoveKeyword(String text) {
        return text.contains("xóa")
                || text.contains("bỏ ra")
                || text.contains("xoá")
                || text.contains("remove")
                || text.contains("bỏ khỏi giỏ")
                || text.contains("xóa khỏi giỏ");
    }

    private boolean hasViewKeyword(String text) {
        return text.contains("xem giỏ")
                || text.contains("giỏ hàng của tôi")
                || text.contains("giỏ hàng của em")
                || text.contains("trong giỏ")
                || text.contains("cart của tôi");
    }
}