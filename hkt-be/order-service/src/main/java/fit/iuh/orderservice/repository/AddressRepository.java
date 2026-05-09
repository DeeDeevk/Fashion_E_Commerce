package fit.iuh.orderservice.repository;

import fit.iuh.orderservice.entities.Account;
import fit.iuh.orderservice.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByAccount(Account account);
}
