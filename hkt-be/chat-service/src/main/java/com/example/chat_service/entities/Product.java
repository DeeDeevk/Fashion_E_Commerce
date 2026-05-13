package com.example.chat_service.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Product.java trong chat-service
@Entity
@Table(name = "product")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private int id;

    @Column(name = "product_name")
    private String name;

    @Column(name = "cost_price")
    private double costPrice;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "brand")
    private String brand;

    @Column(name = "rating")
    private double rating;

    @Column(name = "discount_amount")
    private double discountAmount;

    // ✅ Thêm các field còn thiếu
    @Column(name = "description")
    private String description;

    @Column(name = "material")
    private String material;

    @Column(name = "form")
    private String form;

    @Column(name = "image_url_front")
    private String imageUrlFront;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<SizeDetail> sizeDetails;
}