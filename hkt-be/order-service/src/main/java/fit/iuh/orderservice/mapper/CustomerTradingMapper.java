package fit.iuh.orderservice.mapper;

import fit.iuh.orderservice.dto.response.CustomerTradingResponse;
import fit.iuh.orderservice.entities.CustomerTrading;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerTradingMapper {
    CustomerTradingResponse toCustomerTradingMapper(CustomerTrading customerTrading);
}
