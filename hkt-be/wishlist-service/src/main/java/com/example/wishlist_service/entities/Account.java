package com.example.wishlist_service.entities;// entities/Account.java


import com.example.wishlist_service.enums.Role;
import com.example.wishlist_service.enums.StatusLogin;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "account")
@AllArgsConstructor @NoArgsConstructor
@Data @Builder @ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Account {
    @Id
    @Column(name = "login_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @Column(name = "username")
    String username;

    @Column(name = "password")
    String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    Role role;

    @Column(name = "create_at")
    Date createAt;

    @Column(name = "update_at")
    Date updateAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_login")
    StatusLogin statusLogin;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<WishList> wishLists;
}