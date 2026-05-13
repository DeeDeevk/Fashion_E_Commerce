package fit.iuh.orderservice.mapper;

import fit.iuh.orderservice.dto.request.CustomerRequest;
import fit.iuh.orderservice.dto.response.CustomerResponse;
import fit.iuh.orderservice.entities.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValueCheckStrategy;

@Mapper(componentModel = "spring",
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface CustomerMapper {
    Customer toCustomer(CustomerRequest customerRequest);
    void updateCustomerFromRequest(CustomerRequest customerRequest, @MappingTarget Customer customer);

    @Mapping(source = "account.id", target = "accountId")
    CustomerResponse toCustomerResponse(Customer customer);
}
