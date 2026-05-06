package fit.iuh.product_service.repository;


import fit.iuh.product_service.entities.Product;
import fit.iuh.product_service.entities.Size;
import fit.iuh.product_service.entities.SizeDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SizeDetailRepository extends JpaRepository<SizeDetail, Integer> {
    SizeDetail findSizeDetailByProductAndSize(Product product, Size size);

}