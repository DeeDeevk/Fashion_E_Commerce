package com.example.wishlist_service.service;// src/main/java/fit/iuh/kh3tshopbe/service/WishlistDetailService.java



import com.example.wishlist_service.dto.response.WishListDetailResponse;
import com.example.wishlist_service.entities.Product;
import com.example.wishlist_service.entities.WishList;
import com.example.wishlist_service.entities.WishListDetail;
import com.example.wishlist_service.repository.ProductRepository;
import com.example.wishlist_service.repository.WishListDetailRepository;
import com.example.wishlist_service.repository.WishListRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WishListDetailService {

    WishListDetailRepository detailRepository;
    WishListRepository wishlistRepository;
    ProductRepository productRepository;

    // XÓA SẢN PHẨM KHỎI WISHLIST
    @Transactional
    public void removeItem(Integer wishlistId, Integer productId, String username) {
        WishList wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));

        if (!wishlist.getAccount().getUsername().equals(username)) {
            throw new RuntimeException("Không có quyền xóa");
        }

        if (!detailRepository.existsByWishlist_IdAndProduct_Id(wishlistId, productId)) {
            throw new RuntimeException("Sản phẩm không có trong wishlist");
        }

        detailRepository.deleteByWishlist_IdAndProduct_Id(wishlistId, productId);
    }
    public List<WishListDetailResponse> getItemsByWishlistId(Integer wishlistId, String username) {
        WishList wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));

        if (!wishlist.getAccount().getUsername().equals(username)) {
            throw new RuntimeException("Không có quyền truy cập wishlist này");
        }

        return detailRepository.findByWishlist_Id(wishlistId).stream()
                .map(this::toResponse)
                .toList();
    }
    // WishListDetailService.java

    @Transactional
    public void addItem(Integer wishlistId, Integer productId, String username, String note) {
        WishList wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist không tồn tại"));
        System.out.println("==== CHECK PERMISSION ====");
        System.out.println("wishlistId = " + wishlist.getId());
        System.out.println("token username = " + username);
        System.out.println("owner username = " + wishlist.getAccount().getUsername());
        System.out.println("MATCH = " + wishlist.getAccount().getUsername().equals(username));
        System.out.println("=========================");
        if (!wishlist.getAccount().getUsername().equals(username)) {
            throw new RuntimeException("Bạn không có quyền thêm vào wishlist này");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Kiểm tra đã tồn tại chưa → tránh trùng
        boolean exists = detailRepository.existsByWishlist_IdAndProduct_Id(wishlistId, productId);
        if (exists) {
            throw new RuntimeException("Sản phẩm đã có trong wishlist");
        }

        WishListDetail detail = new WishListDetail();
        detail.setWishlist(wishlist);
        detail.setProduct(product);
        detail.setCreated_at(new Date());
        detail.setNote(note);

        detailRepository.save(detail);
    }
    private WishListDetailResponse toResponse(WishListDetail d) {
        Product p = d.getProduct();
        return WishListDetailResponse.builder()
                .id(d.getId())
                .note(d.getNote())
                .created_at(d.getCreated_at())
                .wishlistId(d.getWishlist().getId())
                .productId(p.getId())
                .productName(p.getName())
                .productImage(p.getImageUrlFront())
                .productPrice(p.getPrice())
                .discountAmount((int) p.getDiscountAmount())
                .build();
    }

}