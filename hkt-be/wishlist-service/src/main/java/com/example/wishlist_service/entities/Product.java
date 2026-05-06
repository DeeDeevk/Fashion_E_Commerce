package com.example.wishlist_service.entities;// entities/Product.java — chỉ giữ các field wishlist-service cần

import com.example.wishlist_service.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "product")
@AllArgsConstructor @NoArgsConstructor
@Data @Builder @ToString
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer id;

    @Column(name = "product_name")
    private String name;

    @Column(name = "price")
    private double price;

    @Column(name = "image_url_front")
    private String imageUrlFront;

    @Column(name = "discount_amount")
    private double discountAmount;

    @Enumerated(EnumType.STRING)
    private Status status;

    @OneToMany(mappedBy = "product")
    @ToString.Exclude
    private List<WishListDetail> details;
}