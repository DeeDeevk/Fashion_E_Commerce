package com.example.chat_service.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "product")
@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
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



    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<SizeDetail> sizeDetails;
}