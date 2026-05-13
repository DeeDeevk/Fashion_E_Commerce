package fit.iuh.orderservice.mapper;

import fit.iuh.orderservice.dto.response.CartDetailResponse;
import fit.iuh.orderservice.entities.CartDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartDetailMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "sizeDetail.size.nameSize", target = "sizeName")
    @Mapping(source = "product.imageUrlFront", target = "productImage")
    @Mapping(source = "price_at_time", target = "priceAtTime")
    CartDetailResponse toCartDetailResponse(CartDetail cartDetail);


}
