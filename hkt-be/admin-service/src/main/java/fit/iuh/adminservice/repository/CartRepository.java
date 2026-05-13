package fit.iuh.adminservice.repository;

import fit.iuh.adminservice.entities.Account;
import fit.iuh.adminservice.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Cart findByAccount(Account account);

}
