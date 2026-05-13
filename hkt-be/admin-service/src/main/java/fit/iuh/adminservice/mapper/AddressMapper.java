package fit.iuh.adminservice.mapper;

import fit.iuh.adminservice.dto.response.AddressResponse;
import fit.iuh.adminservice.entities.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toAddressResponse(Address address);
}
