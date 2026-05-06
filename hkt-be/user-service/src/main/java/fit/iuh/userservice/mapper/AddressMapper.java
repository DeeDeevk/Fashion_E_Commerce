package fit.iuh.userservice.mapper;

import fit.iuh.userservice.dto.response.AddressResponse;
import fit.iuh.userservice.entities.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toAddressResponse(Address address);
}
