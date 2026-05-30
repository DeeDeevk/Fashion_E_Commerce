package fit.iuh.adminservice.repository;

import fit.iuh.adminservice.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByDiscountAmountGreaterThan(Double amount);

    @Query("SELECT COUNT(p) FROM Product p")
    long getTotalProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity <= :threshold")
    long getLowStockProducts(@Param("threshold") int threshold);

    @Query("SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.sizeDetails sd " +
            "LEFT JOIN FETCH sd.size " +
            "LEFT JOIN FETCH p.category")
    List<Product> findAllWithDetails();

    @Query(value = "SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.sizeDetails sd " +
            "LEFT JOIN FETCH sd.size " +
            "LEFT JOIN FETCH p.category " +
            "WHERE (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:category IS NULL OR p.category.name = :category) " +
            "AND (:status IS NULL OR CAST(p.status AS string) = :status)",
            countQuery = "SELECT COUNT(DISTINCT p) FROM Product p " +  // ← thêm countQuery
                    "LEFT JOIN p.category " +
                    "WHERE (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                    "AND (:category IS NULL OR p.category.name = :category) " +
                    "AND (:status IS NULL OR CAST(p.status AS string) = :status)")
    Page<Product> findAllPagedWithFilter(
            @Param("search") String search,
            @Param("category") String category,
            @Param("status") String status,
            Pageable pageable);
}