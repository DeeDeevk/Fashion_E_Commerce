package com.example.cart_service.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "cart")
@AllArgsConstructor @NoArgsConstructor
@Data @ToString
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private int id;

    @Column(name = "total_quantity")
    private int totalQuantity;

    @Column(name = "total_amount")
    private double totalAmount;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date created_at;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updated_at;

    @Column(name = "customer_login")
    private int accountId;

    // ✅ Giữ: CartDetail vẫn thuộc domain này
    @OneToMany(mappedBy = "cart", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<CartDetail> cart_details;
}