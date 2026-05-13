package fit.iuh.orderservice.mapper;

import fit.iuh.orderservice.dto.response.AddressResponse;
import fit.iuh.orderservice.entities.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toAddressResponse(Address address);
}
