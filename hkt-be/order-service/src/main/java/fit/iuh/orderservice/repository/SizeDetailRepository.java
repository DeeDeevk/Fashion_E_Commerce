package fit.iuh.orderservice.repository;

import fit.iuh.orderservice.entities.Product;
import fit.iuh.orderservice.entities.Size;
import fit.iuh.orderservice.entities.SizeDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SizeDetailRepository extends JpaRepository<SizeDetail, Integer> {
    SizeDetail findSizeDetailByProductAndSize(Product product, Size size);

}