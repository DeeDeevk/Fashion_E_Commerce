package com.example.chat_service.cart;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Detect cart intent từ câu user.
 *
 * QUAN TRỌNG: Detector này được gọi SAU co-reference resolution.
 * Nghĩa là input có thể là:
 *   "thêm Washed Jorts vào giỏ"  (từ "thêm món đó vào giỏ")
 *   "mua Nike Tee luôn"           (từ "mua nó luôn")
 *   "xóa Polo Shirt đi"           (từ "xóa cái đó đi")
 *
 * Các keyword phải detect được cả dạng TRƯỚC và SAU co-ref.
 */
@Component
public class CartIntentDetector {

    public enum CartIntent {
        ADD_TO_CART,
        REMOVE_FROM_CART,
        VIEW_CART,
        BUY_NOW,
        NONE
    }

    // Stop words không phải tên sản phẩm — dùng trong hasMeaningfulProduct()
    private static final Set<String> STOP_BUY = Set.of(
            "thôi","đi","ngay","luôn","rồi","nào","gì","được","không","vậy",
            "ạ","nhé","nha","à","ơi","với","cho","tôi","em","anh","chị",
            "đó","này","kia","cái","món","thứ","item","sản","phẩm","con","bộ"
    );

    public CartIntent detect(String prompt) {
        String lower = prompt.toLowerCase();
        // BUY_NOW check TRƯỚC ADD_TO_CART vì cùng dùng từ "mua"
        if (hasBuyNowKeyword(lower)) return CartIntent.BUY_NOW;
        if (hasAddKeyword(lower))    return CartIntent.ADD_TO_CART;
        if (hasRemoveKeyword(lower)) return CartIntent.REMOVE_FROM_CART;
        if (hasViewKeyword(lower))   return CartIntent.VIEW_CART;
        return CartIntent.NONE;
    }

    // ── BUY_NOW ───────────────────────────────────────────────────────────────

    private boolean hasBuyNowKeyword(String text) {
        boolean hasBuyWord = text.contains("mua")
                || text.contains("đặt mua")
                || text.contains("đặt hàng")
                || text.contains("order")
                || text.contains("checkout")
                || text.contains("thanh toán");

        if (!hasBuyWord) return false;

        // 1. Explicit buy-now phrases (trước và sau co-ref)
        boolean hasBuyNowPhrase =
                text.contains("mua ngay")
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
                        // Co-ref đã resolve → "mua [product] luôn/ngay/đi"
                        || text.matches(".*mua\\s+\\S.*\\bluôn\\b.*")
                        || text.matches(".*mua\\s+\\S.*\\bngay\\b.*")
                        || text.matches(".*mua\\s+\\S.*\\bđi\\b.*")
                        // Original co-ref phrases
                        || text.contains("mua cái này")   || text.contains("mua cái đó")
                        || text.contains("mua cái kia")   || text.contains("mua nó")
                        || text.contains("mua sản phẩm này") || text.contains("mua sản phẩm đó")
                        || text.contains("mua món này")   || text.contains("mua món đó")
                        || text.contains("mua thứ này")   || text.contains("mua thứ đó")
                        || text.contains("đặt cái này")   || text.contains("đặt cái đó");

        // 2. Có size cụ thể đi kèm
        boolean hasSize = text.matches(".*\\bsize\\s+(xs|s|m|l|xl|xxl)\\b.*")
                || text.matches(".*(^|\\s)(xs|s|m|l|xl|xxl)(\\s|$).*");

        // 3. Có số lượng cụ thể
        boolean hasQuantity = text.matches(".*\\d+\\s*(cái|chiếc|sản phẩm|sp).*");

        // 4. "mua [tên sản phẩm có nghĩa]" — catch "mua áo polo", "mua necklace"
        //    Bỏ stop words, nếu còn token có nghĩa → là BUY_NOW
        boolean hasMeaningfulProduct = false;
        Matcher m = Pattern.compile("\\bmua\\s+(.+)").matcher(text);
        if (m.find()) {
            long meaningful = Arrays.stream(m.group(1).trim().split("\\s+"))
                    .filter(t -> t.length() > 1
                            && !STOP_BUY.contains(t)
                            && !t.matches("\\d+"))
                    .count();
            hasMeaningfulProduct = meaningful > 0;
        }

        return hasBuyNowPhrase || hasSize || hasQuantity || hasMeaningfulProduct;
    }

    // ── ADD_TO_CART ───────────────────────────────────────────────────────────

    private boolean hasAddKeyword(String text) {
        return text.contains("thêm vào giỏ")
                || text.contains("bỏ vào giỏ")
                || text.contains("cho vào giỏ")
                || text.contains("add to cart")
                || text.contains("thêm vào cart")
                // Fix co-reference: "thêm [Product] vào giỏ" → "thêm vào giỏ" bị split
                || text.contains("vào giỏ")
                || text.contains("vào giỏ hàng");
    }

    // ── REMOVE_FROM_CART ──────────────────────────────────────────────────────

    private boolean hasRemoveKeyword(String text) {
        return text.contains("xóa")
                || text.contains("xoá")
                || text.contains("remove")
                || text.contains("bỏ khỏi giỏ")
                || text.contains("xóa khỏi giỏ")
                || text.contains("ra khỏi giỏ")
                // Fix co-reference: "bỏ [Product] ra" / "bỏ [Product] khỏi giỏ"
                || (text.contains("bỏ ") && (text.contains(" ra") || text.contains("khỏi")));
    }

    // ── VIEW_CART ─────────────────────────────────────────────────────────────

    private boolean hasViewKeyword(String text) {
        return text.contains("xem giỏ")
                || text.contains("giỏ hàng của tôi")
                || text.contains("giỏ hàng của em")
                || text.contains("trong giỏ")
                || text.contains("cart của tôi")
                || text.contains("giỏ hàng hiện tại");
    }
}