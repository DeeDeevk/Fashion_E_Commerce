package fit.iuh.adminservice.repository;

import fit.iuh.adminservice.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Customer findByEmail(String email);
    boolean existsByEmail(String email);
    Customer findById(int id);
}
