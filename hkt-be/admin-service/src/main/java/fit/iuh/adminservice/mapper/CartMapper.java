package fit.iuh.adminservice.mapper;

import fit.iuh.adminservice.dto.response.CartResponse;
import fit.iuh.adminservice.entities.Cart;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartMapper {
    CartResponse toCartResponse(Cart cart);
}
