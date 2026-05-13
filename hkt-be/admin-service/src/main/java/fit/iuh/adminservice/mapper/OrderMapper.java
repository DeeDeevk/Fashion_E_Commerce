package fit.iuh.adminservice.mapper;

import fit.iuh.adminservice.dto.response.OrderResponse;
import fit.iuh.adminservice.entities.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring", uses = {OrderDetailMapper.class})
public interface OrderMapper {
    @Mapping(source = "paymentMethod", target = "paymentMethod")
    @Mapping(source = "orderDetails", target = "orderDetails")
    OrderResponse toOrderMapper(Order order);
}
