package fit.iuh.product_service.repository;


import fit.iuh.product_service.entities.Size;
import fit.iuh.product_service.enums.SizeName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SizeRepository extends JpaRepository<Size, Integer> {
    Optional<Size> findByNameSize(SizeName nameSize);
}