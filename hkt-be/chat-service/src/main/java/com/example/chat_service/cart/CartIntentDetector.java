package com.example.chat_service.cart;

import org.springframework.stereotype.Component;

@Component
public class CartIntentDetector {

    public enum CartIntent {
        ADD_TO_CART,
        REMOVE_FROM_CART,
        VIEW_CART,
        BUY_NOW,   // ← MỚI: mua ngay → checkout
        NONE
    }

    public CartIntent detect(String prompt) {
        String lower = prompt.toLowerCase();

        // BUY_NOW phải check TRƯỚC ADD_TO_CART vì cùng dùng từ "mua"
        // nhưng BUY_NOW có thêm context rõ hơn (size, số lượng, "ngay", "luôn"...)
        if (hasBuyNowKeyword(lower)) return CartIntent.BUY_NOW;
        if (hasAddKeyword(lower))    return CartIntent.ADD_TO_CART;
        if (hasRemoveKeyword(lower)) return CartIntent.REMOVE_FROM_CART;
        if (hasViewKeyword(lower))   return CartIntent.VIEW_CART;

        return CartIntent.NONE;
    }

    // ── BUY_NOW: mua ngay → hỏi payment → navigate checkout ─────────────────
    // Trigger khi user có ý định mua trực tiếp (không chỉ thêm giỏ)
    private boolean hasBuyNowKeyword(String text) {
        boolean hasBuyWord = text.contains("mua")
                || text.contains("đặt mua")
                || text.contains("đặt hàng")
                || text.contains("order")
                || text.contains("checkout")
                || text.contains("thanh toán");

        if (!hasBuyWord) return false;

        // Phân biệt với ADD_TO_CART: BUY_NOW cần có ít nhất 1 trong các dấu hiệu sau:
        // 1. Có size cụ thể đi kèm
        boolean hasSize = text.matches(".*\\bsize\\s+(xs|s|m|l|xl|xxl)\\b.*")
                || text.matches(".*\\b(xs|s|m|l|xl|xxl)\\b.*");

        // 2. Có số lượng cụ thể
        boolean hasQuantity = text.matches(".*\\d+\\s*(cái|chiếc|sản phẩm|sp|cái).*")
                || text.matches(".*số lượng\\s*\\d+.*");

        // 3. Có từ chỉ hành động mua ngay
        boolean hasBuyNowWord = text.contains("mua ngay")
                || text.contains("mua luôn")
                || text.contains("mua đi")
                || text.contains("cho tôi mua")
                || text.contains("cho em mua")
                || text.contains("tôi muốn mua")
                || text.contains("em muốn mua")
                || text.contains("muốn mua")
                || text.contains("muốn đặt")
                || text.contains("mình muốn mua")
                || text.contains("mình muốn đặt")
                || text.contains("mua cái này")
                || text.contains("mua cái đó")
                || text.contains("mua nó")
                || text.contains("mua sản phẩm này")
                || text.contains("mua sản phẩm đó")
                || text.contains("mua món này")
                || text.contains("mua món đó")
                || text.contains("mua thứ này")
                || text.contains("mua thứ đó")
                || text.contains("mua cái kia")
                || text.contains("đặt cái này")
                || text.contains("đặt cái đó");

        return hasBuyNowWord || hasSize || hasQuantity;
    }

    // ── ADD_TO_CART: chỉ thêm vào giỏ, không mua ngay ───────────────────────
    private boolean hasAddKeyword(String text) {
        return text.contains("thêm vào giỏ")
                || text.contains("bỏ vào giỏ")
                || text.contains("cho vào giỏ")
                || text.contains("add to cart")
                || text.contains("thêm vào cart");
        // Đã bỏ "mua", "đặt", "order" ra khỏi đây → chúng thuộc BUY_NOW
    }

    // ── REMOVE_FROM_CART ──────────────────────────────────────────────────────
    private boolean hasRemoveKeyword(String text) {
        return text.contains("xóa")
                || text.contains("bỏ ra")
                || text.contains("xoá")
                || text.contains("remove")
                || text.contains("bỏ khỏi giỏ")
                || text.contains("xóa khỏi giỏ");
    }

    // ── VIEW_CART ─────────────────────────────────────────────────────────────
    private boolean hasViewKeyword(String text) {
        return text.contains("xem giỏ")
                || text.contains("giỏ hàng của tôi")
                || text.contains("giỏ hàng của em")
                || text.contains("trong giỏ")
                || text.contains("cart của tôi");
    }
}
