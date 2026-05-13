package fit.iuh.adminservice.mapper;

import fit.iuh.adminservice.dto.response.CustomerTradingResponse;
import fit.iuh.adminservice.entities.CustomerTrading;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerTradingMapper {
    CustomerTradingResponse toCustomerTradingMapper(CustomerTrading customerTrading);
}
