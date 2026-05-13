package fit.iuh.adminservice.repository;

import fit.iuh.adminservice.entities.Account;
import fit.iuh.adminservice.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByAccount(Account account);
}
