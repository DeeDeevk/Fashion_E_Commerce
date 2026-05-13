package fit.iuh.adminservice.repository;

import fit.iuh.adminservice.entities.Size;
import fit.iuh.adminservice.enums.SizeName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SizeRepository extends JpaRepository<Size, Integer> {
    Optional<Size> findByNameSize(SizeName nameSize);
}