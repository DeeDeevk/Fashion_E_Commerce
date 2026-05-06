package fit.iuh.userservice.repository;

import fit.iuh.userservice.entities.Account;
import fit.iuh.userservice.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    boolean existsByUsername(String username);

    Optional<Account> findByUsername(String username);

    Optional<Account> findByCustomer_Email(String email);

    List<Account> findByRole(Role role);


}
