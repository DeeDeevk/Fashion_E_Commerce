package com.example.cart_service.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "size")
@AllArgsConstructor @NoArgsConstructor
@Data
public class Size {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "name_size")
    private String nameSize;
}
