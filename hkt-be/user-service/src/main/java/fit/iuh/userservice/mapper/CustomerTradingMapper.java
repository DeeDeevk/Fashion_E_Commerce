package fit.iuh.userservice.mapper;

import fit.iuh.userservice.dto.response.CustomerTradingResponse;
import fit.iuh.userservice.entities.CustomerTrading;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerTradingMapper {
    CustomerTradingResponse toCustomerTradingMapper(CustomerTrading customerTrading);
}
