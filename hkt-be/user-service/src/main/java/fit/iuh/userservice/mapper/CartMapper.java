package fit.iuh.userservice.mapper;

import fit.iuh.userservice.dto.response.CartResponse;
import fit.iuh.userservice.entities.Cart;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartMapper {
    CartResponse toCartResponse(Cart cart);
}
