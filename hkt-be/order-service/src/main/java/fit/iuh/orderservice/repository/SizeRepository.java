package fit.iuh.orderservice.repository;

import fit.iuh.orderservice.entities.Size;
import fit.iuh.orderservice.enums.SizeName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SizeRepository extends JpaRepository<Size, Integer> {
    Optional<Size> findByNameSize(SizeName nameSize);
}