package fit.iuh.product_service.repository;

import fit.iuh.product_service.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    // ✅ Filter + sort + phân trang (trừ bestselling)
    @Query(value = "SELECT * FROM product p WHERE " +
            "p.status = 'ACTIVE' AND " +
            "(:search IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:categoryId IS NULL OR p.category = :categoryId) AND " +
            "p.cost_price BETWEEN :minPrice AND :maxPrice " +
            "ORDER BY " +
            "CASE WHEN :sortBy = 'price-low'  THEN p.cost_price END ASC, " +
            "CASE WHEN :sortBy = 'price-high' THEN p.cost_price END DESC, " +
            "CASE WHEN :sortBy = 'newest'     THEN p.updated_at END DESC, " +
            "p.created_at DESC",
            countQuery = "SELECT COUNT(*) FROM product p WHERE " +
                    "p.status = 'ACTIVE' AND " +
                    "(:search IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
                    "(:categoryId IS NULL OR p.category = :categoryId) AND " +
                    "p.cost_price BETWEEN :minPrice AND :maxPrice",
            nativeQuery = true)
    Page<Product> findByFilters(
            @Param("search") String search,
            @Param("categoryId") Integer categoryId,
            @Param("minPrice") double minPrice,
            @Param("maxPrice") double maxPrice,
            @Param("sortBy") String sortBy,
            Pageable pageable
    );

    // ✅ Dùng riêng cho bestselling (fetch all rồi sort tay theo soldQuantity)
    @Query(value = "SELECT * FROM product p WHERE " +
            "p.status = 'ACTIVE' AND " +
            "(:search IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:categoryId IS NULL OR p.category = :categoryId) AND " +
            "p.cost_price BETWEEN :minPrice AND :maxPrice",
            nativeQuery = true)
    List<Product> findByFiltersNoPage(
            @Param("search") String search,
            @Param("categoryId") Integer categoryId,
            @Param("minPrice") double minPrice,
            @Param("maxPrice") double maxPrice
    );

    List<Product> findByDiscountAmountGreaterThan(Double amount);

    Page<Product> findAll(Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p")
    long getTotalProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity <= :threshold")
    long getLowStockProducts(@Param("threshold") int threshold);

    @Query("SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.sizeDetails sd " +
            "LEFT JOIN FETCH sd.size " +
            "LEFT JOIN FETCH p.category")
    List<Product> findAllWithDetails();
}