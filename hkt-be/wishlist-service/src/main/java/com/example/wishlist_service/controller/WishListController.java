package com.example.wishlist_service.controller;// src/main/java/fit/iuh/kh3tshopbe/controller/WishListController.java



import com.example.wishlist_service.dto.response.ApiResponse;
import com.example.wishlist_service.dto.response.WishListResponse;
import com.example.wishlist_service.entities.WishList;
import com.example.wishlist_service.repository.WishListRepository;
import com.example.wishlist_service.service.WishListService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/wishlists")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WishListController {

    WishListService wishlistService;
    private final WishListRepository wishListRepository;
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    // 1. GET: Danh sách wishlist
    @GetMapping
    public ApiResponse<List<WishListResponse>> getMyWishlists() {
        String username = getCurrentUsername();
        if (username == null) {
            return ApiResponse.<List<WishListResponse>>builder()
                    .code(401)
                    .message("Unauthorized")
                    .build();
        }
        List<WishListResponse> wishlists = wishlistService.getWishlistsByCurrentUser(username);
        return ApiResponse.<List<WishListResponse>>builder()
                .result(wishlists)
                .build();
    }

    //2.  POST: Tạo mới wishlist
    @PostMapping
    public ApiResponse<WishListResponse> createWishlist(@RequestBody WishList wishlist) {
        String username = getCurrentUsername();
        System.out.println("USERNAME = " + username);
        System.out.println("WISHLIST = " + wishlist);
        if (username == null) {
            return ApiResponse.<WishListResponse>builder()
                    .code(401)
                    .message("Unauthorized")
                    .build();
        }
        if (wishlist.getName() == null || wishlist.getName().trim().isEmpty()) {
            return ApiResponse.<WishListResponse>builder()
                    .code(400)
                    .message("Tên wishlist không được để trống")
                    .build();
        }

        WishListResponse created = wishlistService.createWishlist(wishlist, username);
        return ApiResponse.<WishListResponse>builder()
                .result(created)
                .build();
    }

    //3.  PUT: Sửa wishlish
    @PutMapping("/{id}")
    public ApiResponse<WishListResponse> updateWishlist(
            @PathVariable Integer id,
            @RequestBody WishList wishlist) {
        String username = getCurrentUsername();
        if (username == null) {
            return ApiResponse.<WishListResponse>builder()
                    .code(401)
                    .message("Unauthorized")
                    .build();
        }
        WishListResponse updated = wishlistService.updateWishlist(id, wishlist, username);
        return ApiResponse.<WishListResponse>builder()
                .result(updated)
                .build();
    }

    //4.  DELETE: Xóa wishlist
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteWishlist(@PathVariable Integer id) {
        String username = getCurrentUsername();
        if (username == null) {
            return ApiResponse.<Void>builder()
                    .code(401)
                    .message("Unauthorized")
                    .build();
        }
        wishlistService.deleteWishlist(id, username);
        return ApiResponse.<Void>builder()
                .message("Xóa wishlist thành công")
                .build();
    }

    //5. kiem tra sp co trong wishlist

    @GetMapping("/products/{productId}/in-wishlist")
    public ApiResponse<Boolean> isProductInWishlist(
            @PathVariable Integer productId,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ApiResponse.<Boolean>builder()
                    .result(false)
                    .build();
        }
        String username = authentication.getName();
        // Dùng repository đã được inject từ @RequiredArgsConstructor
        boolean exists = wishListRepository.existsByAccount_UsernameAndDetails_Product_Id(username, productId);
        return ApiResponse.<Boolean>builder()
                .result(exists)
                .build();
    }
    @GetMapping("/products/in-wishlist-batch")
    public ApiResponse<Map<Integer, Boolean>> checkBatch(
            @RequestParam List<Integer> productIds,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            // Trả về tất cả false nếu chưa login
            Map<Integer, Boolean> empty = productIds.stream()
                    .collect(Collectors.toMap(id -> id, id -> false));
            return ApiResponse.<Map<Integer, Boolean>>builder()
                    .result(empty)
                    .build();
        }

        Map<Integer, Boolean> result = wishlistService.checkBatch(productIds, authentication.getName());
        return ApiResponse.<Map<Integer, Boolean>>builder()
                .result(result)
                .build();
    }
}