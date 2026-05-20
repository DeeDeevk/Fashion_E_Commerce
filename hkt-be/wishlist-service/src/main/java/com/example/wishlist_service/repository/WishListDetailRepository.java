package com.example.wishlist_service.repository;


import com.example.wishlist_service.entities.WishListDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WishListDetailRepository extends JpaRepository<WishListDetail, Integer> {

    @Query("SELECT d FROM WishListDetail d JOIN FETCH d.product WHERE d.wishlist.id = :wishlistId")
    List<WishListDetail> findByWishlist_Id(@Param("wishlistId") Integer wishlistId);

    boolean existsByWishlist_IdAndProduct_Id(Integer wishlistId, Integer productId);

    void deleteByWishlist_IdAndProduct_Id(Integer wishlistId, Integer productId);
}