package com.example.wishlist_service.repository;



import com.example.wishlist_service.entities.WishList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface WishListRepository extends JpaRepository<WishList, Integer> {

    @Query("SELECT DISTINCT w FROM WishList w LEFT JOIN FETCH w.details WHERE w.account.username = :username")
    List<WishList> findByAccount_Username(@Param("username") String username);
    @Query("SELECT d.product.id FROM WishListDetail d WHERE d.wishlist.account.username = :username")
    Set<Integer> findProductIdsByUsername(@Param("username") String username);
    boolean existsByAccount_UsernameAndDetails_Product_Id(String username, Integer productId);
}

