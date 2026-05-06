package com.example.cart_service.entities;

import com.example.cart_service.enums.Status;
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
    private int id;

    @Column(name = "product_name")
    private String name;

    @Column(name = "price")
    private double price;

    @Column(name = "image_url_front")
    private String imageUrlFront;

    @Column(name = "discount_amount")
    private double discountAmount;

    // Giữ thêm các field CartDetailMapper cần
    @Column(name = "quantity")
    private int quantity;

    @Column(name = "brand")
    private String brand;

    @Enumerated(EnumType.STRING)
    private Status status;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<CartDetail> cartDetails;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<SizeDetail> sizeDetails;
}