package fit.iuh.orderservice.repository;

import fit.iuh.orderservice.entities.Cart;
import fit.iuh.orderservice.entities.CartDetail;
import fit.iuh.orderservice.entities.Product;
import fit.iuh.orderservice.entities.SizeDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartDetailRepository extends JpaRepository<CartDetail, Integer> {
    List<CartDetail> findByCart(Cart cart);
    CartDetail findByCartAndProduct(Cart cart, Product product);
    CartDetail findByCartAndProductAndSizeDetail(Cart cart, Product product, SizeDetail sizeDetail);
    List<CartDetail> findByIsSelectedAndCart(boolean isSelected, Cart cart);
}
