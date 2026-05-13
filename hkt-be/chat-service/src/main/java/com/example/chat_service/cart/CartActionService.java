package com.example.chat_service.cart;

import com.example.chat_service.client.CartClient;
import com.example.chat_service.dto.CartDetailRequest;
import com.example.chat_service.dto.CartDetailResponse;
import com.example.chat_service.dto.CartResponse;
import com.example.chat_service.entities.Product;
import com.example.chat_service.entities.SizeDetail;
import com.example.chat_service.enums.SizeName;
import com.example.chat_service.service.FuzzyProductMatcher;
import com.example.chat_service.service.ProductCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartActionService {

    private final CartClient          cartClient;
    private final ProductCacheService productCacheService;
    private final JwtDecoder          jwtDecoder;
    private final FuzzyProductMatcher fuzzyMatcher;   // ← inject

    // ── Decode accountId từ JWT ───────────────────────────────────────────────

    public int extractAccountId(String token) {
        Jwt jwt = jwtDecoder.decode(token);
        Number id = jwt.getClaim("id");
        return id != null ? id.intValue() : 0;
    }

    // ── ADD TO CART ───────────────────────────────────────────────────────────

    public Map<String, Object> buildAddToCartAction(
            CartActionParser.ParsedCartAction parsed, String token) {

        // 1. Ưu tiên dùng resolvedProductName (đã fuzzy từ CartActionParser)
        //    Fallback về productKeyword nếu chưa resolve được
        String searchTerm = (parsed.isResolved())
                ? parsed.resolvedProductName
                : parsed.productKeyword;

        Product product = findBestProduct(searchTerm);

        if (product == null) {
            return Map.of(
                    "message", "Em không tìm thấy sản phẩm \""
                            + parsed.productKeyword + "\" trong shop ạ 😅"
                            + " Anh/chị có thể mô tả rõ hơn không?",
                    "suggestedProducts", List.of());
        }

        // 2. Tìm SizeDetail
        SizeName sizeName;
        try { sizeName = SizeName.valueOf(parsed.size); }
        catch (IllegalArgumentException e) { sizeName = SizeName.M; }

        final SizeName finalSizeName = sizeName;
        SizeDetail sizeDetail = null;
        if (product.getSizeDetails() != null) {
            sizeDetail = product.getSizeDetails().stream()
                    .filter(sd -> sd.getSize() != null
                            && sd.getSize().getNameSize() == finalSizeName
                            && sd.getQuantity() > 0)
                    .findFirst().orElse(null);
        }

        if (sizeDetail == null) {
            String availableSizes = product.getSizeDetails() == null ? "hết hàng" :
                    product.getSizeDetails().stream()
                            .filter(sd -> sd.getQuantity() > 0)
                            .map(sd -> sd.getSize().getNameSize().toString())
                            .collect(Collectors.joining(", "));
            return Map.of(
                    "message", String.format(
                            "Dạ %s size %s hiện không còn hàng ạ 😔 " +
                                    "Các size còn hàng: %s. Anh/chị muốn chọn size khác không?",
                            product.getName(), parsed.size,
                            availableSizes.isEmpty() ? "hết tất cả" : availableSizes),
                    "suggestedProducts", List.of());
        }

        // 3. Trả về action để frontend xác nhận
        Map<String, Object> cartAction = new HashMap<>();
        cartAction.put("type",         "ADD_TO_CART");
        cartAction.put("productId",    product.getId());
        cartAction.put("productName",  product.getName());
        cartAction.put("sizeDetailId", sizeDetail.getId());
        cartAction.put("size",         parsed.size);
        cartAction.put("quantity",     parsed.quantity);
        cartAction.put("price",        product.getCostPrice());
        cartAction.put("confirmed",    false);

        Map<String, Object> response = new HashMap<>();
        response.put("message", String.format(
                "Em tìm thấy %s size %s, giá %,.0fđ 🛍️ " +
                        "Anh/chị muốn thêm %d sản phẩm vào giỏ không?",
                product.getName(), parsed.size, product.getCostPrice(), parsed.quantity));
        response.put("cartAction",        cartAction);
        response.put("suggestedProducts", List.of());
        return response;
    }

    // ── Execute ADD (sau khi user bấm xác nhận) ───────────────────────────────

    public Map<String, Object> executeAddToCart(
            int productId, int sizeDetailId, int quantity, String token) {
        try {
            int accountId = extractAccountId(token);
            CartResponse cart = cartClient.getCartByAccountId(accountId, token);
            if (cart == null) return Map.of(
                    "message", "Không tìm thấy giỏ hàng ạ 😔",
                    "suggestedProducts", List.of());

            CartDetailRequest request = CartDetailRequest.builder()
                    .productId(productId).cartId(cart.getCartId())
                    .sizeDetailId(sizeDetailId).quantity(quantity).build();

            CartDetailResponse result = cartClient.addToCart(request, token);
            Thread.sleep(300);
            if (result == null) return Map.of(
                    "message", "Thêm vào giỏ hàng thất bại ạ 😔",
                    "suggestedProducts", List.of());

            CartResponse updatedCart = cartClient.getCartByAccountId(accountId, token);
            if (updatedCart == null) return Map.of(
                    "message", "Đã thêm vào giỏ nhưng chưa đọc được dữ liệu mới 😅",
                    "suggestedProducts", List.of());

            return Map.of(
                    "message", String.format(
                            "Đã thêm vào giỏ hàng thành công 🎉\n" +
                                    "Hiện giỏ có %d sản phẩm | Tổng tiền: %,.0fđ 🛒",
                            updatedCart.getTotalQuantity(), updatedCart.getTotalPrice()),
                    "cartAction",  Map.of("type", "ADD_TO_CART", "confirmed", true),
                    "cartSummary", Map.of("totalQuantity", updatedCart.getTotalQuantity(),
                            "totalPrice",    updatedCart.getTotalPrice()),
                    "suggestedProducts", List.of());

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("message", "Có lỗi xảy ra 😔 " + e.getMessage(),
                    "suggestedProducts", List.of());
        }
    }

    // ── REMOVE FROM CART ──────────────────────────────────────────────────────

    public Map<String, Object> buildRemoveFromCartAction(
            CartActionParser.ParsedCartAction parsed, String token) {
        try {
            int accountId = extractAccountId(token);
            CartResponse cart = cartClient.getCartByAccountId(accountId, token);
            if (cart == null) return Map.of("message", "Không tìm thấy giỏ hàng ạ 😔",
                    "suggestedProducts", List.of());

            List<CartDetailResponse> details =
                    cartClient.getCartDetails(cart.getCartId(), token);
            if (details == null || details.isEmpty()) return Map.of(
                    "message", "Giỏ hàng của anh/chị đang trống ạ 🛒",
                    "suggestedProducts", List.of());

            // Dùng resolvedProductName nếu có, fallback về keyword
            String searchTerm = parsed.isResolved()
                    ? parsed.resolvedProductName
                    : parsed.productKeyword;

            Product product = findBestProduct(searchTerm);
            if (product == null) return Map.of(
                    "message", "Em không tìm thấy sản phẩm này trong shop ạ 😅",
                    "suggestedProducts", List.of());

            CartDetailResponse targetItem = details.stream()
                    .filter(d -> d.getProductId() == product.getId())
                    .findFirst().orElse(null);

            if (targetItem == null) return Map.of(
                    "message", String.format(
                            "Em không thấy %s trong giỏ hàng của anh/chị ạ 😔",
                            product.getName()),
                    "suggestedProducts", List.of());

            Map<String, Object> cartAction = new HashMap<>();
            cartAction.put("type",         "REMOVE_FROM_CART");
            cartAction.put("cartDetailId", targetItem.getCartDetailId());
            cartAction.put("productName",  product.getName());
            cartAction.put("confirmed",    false);

            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format(
                    "Anh/chị muốn xóa %s khỏi giỏ hàng không? 🗑️", product.getName()));
            response.put("cartAction",        cartAction);
            response.put("suggestedProducts", List.of());
            return response;

        } catch (Exception e) {
            return Map.of("message", "Có lỗi xảy ra ạ 😔 " + e.getMessage(),
                    "suggestedProducts", List.of());
        }
    }

    // ── VIEW CART ─────────────────────────────────────────────────────────────

    public Map<String, Object> viewCart(String token) {
        try {
            int accountId = extractAccountId(token);
            CartResponse cart = cartClient.getCartByAccountId(accountId, token);
            if (cart == null) return Map.of("message", "Không tìm thấy giỏ hàng ạ 😔",
                    "suggestedProducts", List.of());
            return Map.of(
                    "message", String.format(
                            "Giỏ hàng của anh/chị hiện có %d sản phẩm, tổng tiền %,.0fđ ạ 🛒",
                            cart.getTotalQuantity(), cart.getTotalPrice()),
                    "cartAction",        Map.of("type", "VIEW_CART", "confirmed", true),
                    "suggestedProducts", List.of());
        } catch (Exception e) {
            return Map.of("message", "Có lỗi xảy ra ạ 😔 " + e.getMessage(),
                    "suggestedProducts", List.of());
        }
    }

    // ── findBestProduct — fuzzy match, thay thế exact contains cũ ────────────

    /**
     * Tìm Product khớp nhất với searchTerm bằng FuzzyProductMatcher.
     *
     * Nếu searchTerm là resolvedProductName (đã normalize từ Qdrant) thì
     * thường exact match luôn — fuzzy chỉ cần thiết khi fallback về keyword.
     */
    private Product findBestProduct(String searchTerm) {
        List<Product> all = productCacheService.getAllProducts();
        if (all.isEmpty() || searchTerm == null || searchTerm.isBlank()) return null;

        List<String> names = all.stream()
                .map(Product::getName)
                .collect(Collectors.toList());

        FuzzyProductMatcher.MatchResult best = fuzzyMatcher.findBest(searchTerm, names);

        System.out.printf("[CartActionService] findBestProduct('%s') → '%s' (%.3f)%n",
                searchTerm, best.name, best.score);

        if (!best.isAccepted()) return null;

        return all.stream()
                .filter(p -> p.getName().equals(best.name))
                .findFirst().orElse(null);
    }
}