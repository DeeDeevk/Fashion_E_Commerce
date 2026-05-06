package fit.iuh.userservice.repository;


import fit.iuh.userservice.entities.Account;
import fit.iuh.userservice.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Cart findByAccount(Account account);

}
