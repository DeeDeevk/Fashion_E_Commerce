package com.example.cart_service.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "size_detail")
@AllArgsConstructor @NoArgsConstructor
@Data
public class SizeDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id")
    private Size size;

    @Column(name = "quantity")
    private int quantity;
}