package com.example.chat_service.client;

import com.example.chat_service.dto.CartDetailRequest;
import com.example.chat_service.dto.CartDetailResponse;
import com.example.chat_service.dto.CartResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class CartClient {

    private final WebClient cartWebClient;

    public CartClient(@Qualifier("cartWebClient") WebClient cartWebClient) {
        this.cartWebClient = cartWebClient;
    }

    /** Lấy cart theo accountId — forward token của user */
    public CartResponse getCartByAccountId(int accountId, String token) {
        try {
            Map<String, Object> response = cartWebClient.get()
                    .uri("/carts/account/{id}", accountId)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            Object result = response != null ? response.get("result") : null;
            if (result == null) return null;
            return mapToCartResponse(result);
        } catch (Exception e) {
            System.err.println("getCartByAccountId failed: " + e.getMessage());
            return null;
        }
    }

    /** Thêm sản phẩm vào giỏ — forward token của user */
    public CartDetailResponse addToCart(CartDetailRequest request, String token) {
        try {
            return cartWebClient.post()
                    .uri("/cart-details/add-to-cart")
                    .header("Authorization", "Bearer " + token)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(CartDetailResponse.class)
                    .block();
        } catch (Exception e) {
            System.err.println("addToCart failed: " + e.getMessage());
            return null;
        }
    }

    /** Lấy danh sách cart-details theo cartId — forward token */
    public List<CartDetailResponse> getCartDetails(int cartId, String token) {
        try {
            return cartWebClient.get()
                    .uri("/cart-details/cart/{cartId}", cartId)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<CartDetailResponse>>() {})
                    .block();
        } catch (Exception e) {
            System.err.println("getCartDetails failed: " + e.getMessage());
            return List.of();
        }
    }

    /** Ping — 401 = kết nối được nhưng thiếu auth → vẫn tính là connected */
    public boolean ping() {
        try {
            cartWebClient.get()
                    .uri("/carts/account/1")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return true;
        } catch (Exception e) {
            // 401 = server trả lời được → kết nối OK
            if (e.getMessage() != null && e.getMessage().contains("401")) return true;
            System.err.println("Cart-service ping failed: " + e.getMessage());
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    private CartResponse mapToCartResponse(Object obj) {

        if (!(obj instanceof Map<?, ?> rawMap)) {
            return null;
        }

        Map<String, Object> map = (Map<String, Object>) rawMap;

        CartResponse cart = new CartResponse();

        // ── Cart info ─────────────────────────────────────
        cart.setCartId(
                ((Number) map.getOrDefault("id", 0)).intValue()
        );

        cart.setTotalPrice(
                ((Number) map.getOrDefault("totalAmount", 0.0)).doubleValue()
        );

        cart.setTotalQuantity(
                ((Number) map.getOrDefault("totalQuantity", 0)).intValue()
        );

        // ── Cart details ──────────────────────────────────
        Object detailsObj = map.get("cartDetails");

        if (detailsObj instanceof List<?> detailsList) {

            List<CartDetailResponse> details = detailsList.stream()
                    .filter(item -> item instanceof Map<?, ?>)
                    .map(item -> {

                        Map<String, Object> d =
                                (Map<String, Object>) item;

                        CartDetailResponse detail =
                                new CartDetailResponse();

                        detail.setCartDetailId(
                                ((Number) d.getOrDefault("id", 0)).intValue()
                        );

                        detail.setCartId(
                                ((Number) d.getOrDefault("cartId", 0)).intValue()
                        );

                        detail.setProductId(
                                ((Number) d.getOrDefault("productId", 0)).intValue()
                        );

                        detail.setProductName(
                                (String) d.getOrDefault("productName", "")
                        );

                        detail.setProductImage(
                                (String) d.getOrDefault("productImage", "")
                        );

                        detail.setQuantity(
                                ((Number) d.getOrDefault("quantity", 0)).intValue()
                        );

                        detail.setPriceAtTime(
                                ((Number) d.getOrDefault("priceAtTime", 0.0)).doubleValue()
                        );

                        detail.setSubtotal(
                                ((Number) d.getOrDefault("subtotal", 0.0)).doubleValue()
                        );

                        detail.setSelected(
                                (Boolean) d.getOrDefault("selected", false)
                        );

                        detail.setSizeName(
                                (String) d.getOrDefault("sizeName", "")
                        );

                        detail.setSizeDetailId(
                                ((Number) d.getOrDefault("sizeDetailId", 0)).intValue()
                        );

                        return detail;

                    })
                    .toList();

            cart.setCartDetails(details);
        }

        return cart;
    }

    public Map<String, Object> deleteCartDetail(int cartDetailId, String token) {
        try {
            cartWebClient.delete()
                    .uri("/cart-details/delete/{id}", cartDetailId)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            return Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng thành công! 🗑️",
                    "cartAction", Map.of("type", "REMOVE_FROM_CART", "confirmed", true),
                    "suggestedProducts", List.of());
        } catch (Exception e) {
            return Map.of("message", "Xóa thất bại ạ 😔 " + e.getMessage(),
                    "suggestedProducts", List.of());
        }
    }
}