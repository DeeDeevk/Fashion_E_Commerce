package fit.iuh.orderservice.repository;

import fit.iuh.orderservice.entities.Account;
import fit.iuh.orderservice.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Cart findByAccount(Account account);

}
