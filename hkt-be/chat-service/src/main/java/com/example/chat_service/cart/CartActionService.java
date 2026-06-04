package com.example.chat_service.cart;

import com.example.chat_service.client.CartClient;
import com.example.chat_service.dto.CartDetailRequest;
import com.example.chat_service.dto.CartDetailResponse;
import com.example.chat_service.dto.CartResponse;
import com.example.chat_service.entities.Product;
import com.example.chat_service.entities.SizeDetail;
import com.example.chat_service.enums.SizeName;
import com.example.chat_service.service.FuzzyProductMatcher;
import com.example.chat_service.service.GroqService;
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
    private final FuzzyProductMatcher fuzzyMatcher;
    private final GroqService         groqService;  // Fallback LLM

    private static final int MAX_QUANTITY = 40;

    // ── JWT ───────────────────────────────────────────────────────────────────

    public int extractAccountId(String token) {
        Jwt jwt = jwtDecoder.decode(token);
        Number id = jwt.getClaim("id");
        return id != null ? id.intValue() : 0;
    }

    // ── BUY NOW ───────────────────────────────────────────────────────────────

    public Map<String, Object> buildBuyNowAction(
            CartActionParser.ParsedCartAction parsed, String token) {

        // Nếu không resolve được tên → hỏi lại user (không dùng LLM thêm nữa,
        // tránh hallucination về sản phẩm)
        if (parsed.needsContext || !parsed.isResolved()) {
            return buildAskForProductResponse(parsed, "mua");
        }

        Product product = findBestProduct(parsed.resolvedProductName);
        if (product == null) return productNotFound(parsed.productKeyword);

        if (parsed.size == null || parsed.size.isBlank()) {
            return Map.of(
                    "message", "Anh/chị chưa cho em biết size muốn mua ạ 📏",
                    "suggestedProducts", List.of());
        }

        // Validate quantity
        int qty = Math.max(1, parsed.quantity);
        if (qty > MAX_QUANTITY) {
            return Map.of(
                    "message", String.format(
                            "Dạ em chỉ cho phép đặt tối đa %d sản phẩm mỗi lần ạ 😊 " +
                                    "Anh/chị muốn đặt %d %s không?",
                            MAX_QUANTITY, MAX_QUANTITY, product.getName()),
                    "suggestedProducts", List.of());
        }

        // Resolve size
        String sizeStr = normSize(parsed.size);
        SizeName sizeName = parseSizeName(sizeStr);
        SizeDetail sizeDetail = findSizeDetail(product, sizeName);

        if (sizeDetail == null) return sizeNotAvailable(product, sizeStr);
        if (sizeDetail.getQuantity() < qty) return stockInsufficient(product, sizeStr, sizeDetail.getQuantity());

        // Build response
        Map<String, Object> productInfo = new HashMap<>();
        productInfo.put("id",            product.getId());
        productInfo.put("name",          product.getName());
        productInfo.put("costPrice",     product.getCostPrice());
        productInfo.put("imageUrlFront", product.getImageUrlFront() != null ? product.getImageUrlFront() : "");

        Map<String, Object> buyAction = new HashMap<>();
        buyAction.put("type",        "BUY_NOW");
        buyAction.put("productId",   product.getId());
        buyAction.put("productName", product.getName());
        buyAction.put("sizeDetailId",sizeDetail.getId());
        buyAction.put("size",        sizeStr);
        buyAction.put("quantity",    qty);
        buyAction.put("price",       product.getCostPrice());
        buyAction.put("confirmed",   false);
        buyAction.put("productInfo", productInfo);

        Map<String, Object> response = new HashMap<>();
        response.put("message", String.format(
                "Em tìm thấy %s size %s, giá %,.0fđ, số lượng: %d 🛍️\n" +
                        "Anh/chị muốn thanh toán bằng cách nào ạ?",
                product.getName(), sizeStr, product.getCostPrice(), qty));
        response.put("buyAction",         buyAction);
        response.put("suggestedProducts", List.of());
        return response;
    }

    // ── ADD TO CART ───────────────────────────────────────────────────────────

    public Map<String, Object> buildAddToCartAction(
            CartActionParser.ParsedCartAction parsed, String token) {

        if (parsed.needsContext || !parsed.isResolved()) {
            return buildAskForProductResponse(parsed, "thêm vào giỏ");
        }

        Product product = findBestProduct(parsed.resolvedProductName);
        if (product == null) return productNotFound(parsed.productKeyword);

        if (parsed.size == null || parsed.size.isBlank()) {
            return Map.of(
                    "message", "Anh/chị chưa cho em biết size muốn thêm vào giỏ ạ 📏",
                    "suggestedProducts", List.of());
        }

        String sizeStr = normSize(parsed.size);
        SizeName sizeName = parseSizeName(sizeStr);
        SizeDetail sizeDetail = findSizeDetail(product, sizeName);

        if (sizeDetail == null) return sizeNotAvailable(product, sizeStr);

        Map<String, Object> cartAction = new HashMap<>();
        cartAction.put("type",        "ADD_TO_CART");
        cartAction.put("productId",   product.getId());
        cartAction.put("productName", product.getName());
        cartAction.put("sizeDetailId",sizeDetail.getId());
        cartAction.put("size",        sizeStr);
        cartAction.put("quantity",    Math.max(1, parsed.quantity));
        cartAction.put("price",       product.getCostPrice());
        cartAction.put("confirmed",   false);

        Map<String, Object> response = new HashMap<>();
        response.put("message", String.format(
                "Em tìm thấy %s size %s, giá %,.0fđ 🛍️ " +
                        "Anh/chị muốn thêm %d sản phẩm vào giỏ không?",
                product.getName(), sizeStr, product.getCostPrice(), parsed.quantity));
        response.put("cartAction",        cartAction);
        response.put("suggestedProducts", List.of());
        return response;
    }

    // ── REMOVE FROM CART ──────────────────────────────────────────────────────

    public Map<String, Object> buildRemoveFromCartAction(
            CartActionParser.ParsedCartAction parsed, String token) {
        try {
            if (parsed.needsContext || !parsed.isResolved()) {
                // Fallback đặc biệt cho REMOVE: liệt kê giỏ hàng hiện tại để user chọn
                return buildRemoveWithCartListing(parsed, token);
            }

            int accountId = extractAccountId(token);
            CartResponse cart = cartClient.getCartByAccountId(accountId, token);
            if (cart == null) return Map.of("message", "Không tìm thấy giỏ hàng ạ 😔",
                    "suggestedProducts", List.of());

            List<CartDetailResponse> details = cartClient.getCartDetails(cart.getCartId(), token);
            if (details == null || details.isEmpty())
                return Map.of("message", "Giỏ hàng của anh/chị đang trống ạ 🛒",
                        "suggestedProducts", List.of());

            Product product = findBestProduct(parsed.resolvedProductName);
            if (product == null) return productNotFound(parsed.productKeyword);

            // Match trong giỏ — fuzzy trên tên sản phẩm trong cart
            CartDetailResponse targetItem = findInCart(details, product.getId());

            if (targetItem == null) {
                // Sản phẩm có trong DB nhưng không có trong giỏ
                return Map.of(
                        "message", String.format(
                                "Em không thấy %s trong giỏ hàng của anh/chị ạ 😔\n" +
                                        "Anh/chị có muốn xem giỏ hàng không?",
                                product.getName()),
                        "suggestedProducts", List.of());
            }

            Map<String, Object> cartAction = new HashMap<>();
            cartAction.put("type",        "REMOVE_FROM_CART");
            cartAction.put("cartDetailId",targetItem.getCartDetailId());
            cartAction.put("productName", product.getName());
            cartAction.put("confirmed",   false);

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

    /**
     * Fallback cho REMOVE khi không biết tên sản phẩm:
     * List các sản phẩm trong giỏ và hỏi user muốn xóa cái nào.
     */
    private Map<String, Object> buildRemoveWithCartListing(
            CartActionParser.ParsedCartAction parsed, String token) {
        try {
            int accountId = extractAccountId(token);
            CartResponse cart = cartClient.getCartByAccountId(accountId, token);
            if (cart == null) return Map.of("message", "Không tìm thấy giỏ hàng ạ 😔",
                    "suggestedProducts", List.of());

            List<CartDetailResponse> details = cartClient.getCartDetails(cart.getCartId(), token);
            if (details == null || details.isEmpty())
                return Map.of("message", "Giỏ hàng của anh/chị đang trống ạ 🛒",
                        "suggestedProducts", List.of());

            // Nếu giỏ có keyword để đoán → thử fuzzy match ngay trong giỏ
            if (!parsed.productKeyword.isBlank()) {
                List<String> cartProductNames = details.stream()
                        .map(CartDetailResponse::getProductName)
                        .filter(n -> n != null && !n.isBlank())
                        .collect(Collectors.toList());

                if (!cartProductNames.isEmpty()) {
                    FuzzyProductMatcher.MatchResult best =
                            fuzzyMatcher.findBest(parsed.productKeyword, cartProductNames);
                    System.out.printf("[CartRemove] Fuzzy in cart: '%s' → '%s' (%.3f)%n",
                            parsed.productKeyword, best.name, best.score);

                    if (best.isAccepted()) {
                        CartDetailResponse matched = details.stream()
                                .filter(d -> best.name.equals(d.getProductName()))
                                .findFirst().orElse(null);
                        if (matched != null) {
                            Map<String, Object> cartAction = new HashMap<>();
                            cartAction.put("type",        "REMOVE_FROM_CART");
                            cartAction.put("cartDetailId",matched.getCartDetailId());
                            cartAction.put("productName", matched.getProductName());
                            cartAction.put("confirmed",   false);
                            return Map.of(
                                    "message", String.format(
                                            "Anh/chị muốn xóa %s khỏi giỏ hàng không? 🗑️",
                                            matched.getProductName()),
                                    "cartAction",        cartAction,
                                    "suggestedProducts", List.of());
                        }
                    }
                }
            }

            // Không đoán được → liệt kê giỏ để user chọn
            String listing = details.stream()
                    .map(d -> "• " + d.getProductName() + " (x" + d.getQuantity() + ")")
                    .collect(Collectors.joining("\n"));

            return Map.of(
                    "message", "Anh/chị muốn xóa sản phẩm nào ạ? 🛒\nGiỏ hàng hiện tại:\n" + listing,
                    "suggestedProducts", List.of());

        } catch (Exception e) {
            return Map.of("message", "Có lỗi xảy ra ạ 😔 " + e.getMessage(),
                    "suggestedProducts", List.of());
        }
    }

    // ── Execute ADD ───────────────────────────────────────────────────────────

    public Map<String, Object> executeAddToCart(
            int productId, int sizeDetailId, int quantity, String token) {
        try {
            int accountId = extractAccountId(token);
            CartResponse cart = cartClient.getCartByAccountId(accountId, token);
            if (cart == null) return Map.of("message", "Không tìm thấy giỏ hàng ạ 😔",
                    "suggestedProducts", List.of());

            CartDetailRequest req = CartDetailRequest.builder()
                    .productId(productId).cartId(cart.getCartId())
                    .sizeDetailId(sizeDetailId).quantity(quantity).build();

            CartDetailResponse result = cartClient.addToCart(req, token);
            Thread.sleep(300);
            if (result == null) return Map.of("message", "Thêm vào giỏ hàng thất bại ạ 😔",
                    "suggestedProducts", List.of());

            CartResponse updated = cartClient.getCartByAccountId(accountId, token);
            if (updated == null) return Map.of("message", "Đã thêm nhưng chưa đọc được dữ liệu mới 😅",
                    "suggestedProducts", List.of());

            return Map.of(
                    "message", String.format(
                            "Đã thêm vào giỏ hàng thành công 🎉\n" +
                                    "Hiện giỏ có %d sản phẩm | Tổng tiền: %,.0fđ 🛒",
                            updated.getTotalQuantity(), updated.getTotalPrice()),
                    "cartAction",  Map.of("type", "ADD_TO_CART", "confirmed", true),
                    "cartSummary", Map.of(
                            "totalQuantity", updated.getTotalQuantity(),
                            "totalPrice",    updated.getTotalPrice()),
                    "suggestedProducts", List.of());

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("message", "Có lỗi xảy ra 😔 " + e.getMessage(),
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

    // ── findBestProduct ───────────────────────────────────────────────────────

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

    // ── Shared helpers ────────────────────────────────────────────────────────

    private String normSize(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return raw.toUpperCase().trim();
    }

    private SizeName parseSizeName(String sizeStr) {
        try { return SizeName.valueOf(sizeStr); }
        catch (IllegalArgumentException e) { return SizeName.M; }
    }

    private SizeDetail findSizeDetail(Product product, SizeName sizeName) {
        if (product.getSizeDetails() == null) return null;
        return product.getSizeDetails().stream()
                .filter(sd -> sd.getSize() != null
                        && sd.getSize().getNameSize() == sizeName
                        && sd.getQuantity() > 0)
                .findFirst().orElse(null);
    }

    private CartDetailResponse findInCart(List<CartDetailResponse> details, int productId) {
        return details.stream()
                .filter(d -> d.getProductId() == productId)
                .findFirst().orElse(null);
    }

    private String availableSizesText(Product product) {
        if (product.getSizeDetails() == null) return "hết tất cả";
        String sizes = product.getSizeDetails().stream()
                .filter(sd -> sd.getQuantity() > 0)
                .map(sd -> sd.getSize().getNameSize().toString())
                .collect(Collectors.joining(", "));
        return sizes.isBlank() ? "hết tất cả" : sizes;
    }

    // ── Response builders ─────────────────────────────────────────────────────

    private Map<String, Object> productNotFound(String keyword) {
        String msg = (keyword == null || keyword.isBlank())
                ? "Em không xác định được sản phẩm anh/chị muốn ạ 😅 Anh/chị có thể mô tả rõ hơn không?"
                : String.format("Em không tìm thấy \"%s\" trong shop ạ 😅 Anh/chị có thể mô tả rõ hơn không?", keyword);
        return Map.of("message", msg, "suggestedProducts", List.of());
    }

    private Map<String, Object> sizeNotAvailable(Product product, String sizeStr) {
        return Map.of(
                "message", String.format(
                        "Dạ %s size %s hiện không còn hàng ạ 😔 Các size còn: %s. Anh/chị muốn chọn size khác không?",
                        product.getName(), sizeStr, availableSizesText(product)),
                "suggestedProducts", List.of());
    }

    private Map<String, Object> stockInsufficient(Product product, String sizeStr, int remaining) {
        return Map.of(
                "message", String.format(
                        "Dạ %s size %s chỉ còn %d sản phẩm thôi ạ 😔 Anh/chị muốn đặt %d cái không?",
                        product.getName(), sizeStr, remaining, remaining),
                "suggestedProducts", List.of());
    }

    /**
     * Khi không resolve được tên sản phẩm → hỏi lại user.
     * Nếu có keyword mờ → gợi ý top-3 sản phẩm gần nhất để user chọn.
     */
    private Map<String, Object> buildAskForProductResponse(
            CartActionParser.ParsedCartAction parsed, String action) {

        // Thử gợi ý top 3 nếu có keyword
        if (parsed.productKeyword != null && !parsed.productKeyword.isBlank()) {
            List<Product> all = productCacheService.getAllProducts();
            List<String> names = all.stream().map(Product::getName).collect(Collectors.toList());
            List<FuzzyProductMatcher.MatchResult> topK =
                    fuzzyMatcher.findTopK(parsed.productKeyword, names, 3);

            if (!topK.isEmpty()) {
                String suggestions = topK.stream()
                        .map(r -> "• " + r.name)
                        .collect(Collectors.joining("\n"));
                return Map.of(
                        "message", String.format(
                                "Em tìm thấy một số sản phẩm gần giống, anh/chị muốn %s cái nào ạ? 🤔\n%s",
                                action, suggestions),
                        "suggestedProducts", List.of());
            }
        }

        return Map.of(
                "message", String.format(
                        "Anh/chị muốn %s sản phẩm nào ạ? 🤔 " +
                                "Anh/chị có thể nói rõ tên sản phẩm giúp em được không?", action),
                "suggestedProducts", List.of());
    }
}