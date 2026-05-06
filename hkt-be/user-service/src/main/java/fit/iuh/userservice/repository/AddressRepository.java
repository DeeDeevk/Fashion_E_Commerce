package fit.iuh.userservice.repository;

import fit.iuh.userservice.entities.Account;
import fit.iuh.userservice.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByAccount(Account account);
}
