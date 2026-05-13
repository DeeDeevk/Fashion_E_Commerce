package fit.iuh.adminservice.repository;

import fit.iuh.adminservice.entities.Product;
import fit.iuh.adminservice.entities.Size;
import fit.iuh.adminservice.entities.SizeDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SizeDetailRepository extends JpaRepository<SizeDetail, Integer> {
    SizeDetail findSizeDetailByProductAndSize(Product product, Size size);

}