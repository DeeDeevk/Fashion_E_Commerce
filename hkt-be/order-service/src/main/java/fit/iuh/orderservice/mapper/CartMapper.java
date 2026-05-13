package fit.iuh.orderservice.mapper;

import fit.iuh.orderservice.dto.response.CartResponse;
import fit.iuh.orderservice.entities.Cart;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartMapper {
    CartResponse toCartResponse(Cart cart);
}
