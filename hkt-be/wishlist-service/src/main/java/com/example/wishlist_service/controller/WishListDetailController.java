package com.example.wishlist_service.controller;


import com.example.wishlist_service.dto.request.AddItemRequest;
import com.example.wishlist_service.dto.response.ApiResponse;
import com.example.wishlist_service.dto.response.WishListDetailResponse;
import com.example.wishlist_service.service.WishListDetailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlists")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WishListDetailController {

    WishListDetailService detailService;

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    // 1. THÊM SẢN PHẨM VÀO WISHLIST
    @PostMapping("/{wishlistId}/items")
    public ApiResponse<Void> addItemToWishlist(
            @PathVariable Integer wishlistId,
            @RequestBody AddItemRequest request) {

        String username = getCurrentUsername();
        System.out.println("AUTH = " + SecurityContextHolder.getContext().getAuthentication());
        if (username == null) {
            return ApiResponse.<Void>builder().code(401).message("Unauthorized").build();
        }

        detailService.addItem(wishlistId, request.productId(), username, request.note());
        return ApiResponse.<Void>builder().message("Đã thêm vào wishlist").build();
    }

    // 2. XÓA SẢN PHẨM KHỎI WISHLIST
    @DeleteMapping("/{wishlistId}/items/{productId}")
    public ApiResponse<Void> removeItemFromWishlist(
            @PathVariable Integer wishlistId,
            @PathVariable Integer productId) {

        String username = getCurrentUsername();
        if (username == null) {
            return ApiResponse.<Void>builder()
                    .code(401)
                    .message("Unauthorized")
                    .build();
        }

        detailService.removeItem(wishlistId, productId, username);
        return ApiResponse.<Void>builder()
                .message("Xóa sản phẩm khỏi wishlist thành công")
                .build();
    }
    //3. Xem sp trong wishlist
    @GetMapping("/{wishlistId}/items")
    public ApiResponse<List<WishListDetailResponse>> getWishlistItems(
            @PathVariable Integer wishlistId) {

        String username = getCurrentUsername();
        if (username == null) {
            return ApiResponse.<List<WishListDetailResponse>>builder()
                    .code(401)
                    .message("Unauthorized")
                    .build();
        }
        List<WishListDetailResponse> items = detailService.getItemsByWishlistId(wishlistId, username);
        return ApiResponse.<List<WishListDetailResponse>>builder()
                .result(items)
                .build();
    }
}

