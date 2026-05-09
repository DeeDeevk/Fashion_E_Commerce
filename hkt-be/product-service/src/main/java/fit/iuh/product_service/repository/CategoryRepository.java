package fit.iuh.product_service.repository;

import fit.iuh.product_service.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    Optional<Category> findByName(String name);

    @Query(value = """
        SELECT c.name AS categoryName,
               COUNT(p.id) AS productCount,
               SUM(i.total_amount) AS revenue
        FROM invoices i
        JOIN orders o ON i.order_id = o.id
        JOIN order_details od ON o.id = od.order_id
        JOIN products p ON od.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE i.payment_status = 'PAID'
        GROUP BY c.id, c.name
        ORDER BY SUM(i.total_amount) DESC
        """, nativeQuery = true)
    List<Object[]> getRevenueByCategory();
}