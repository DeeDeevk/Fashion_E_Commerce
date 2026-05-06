package fit.iuh.product_service.mapper;


import fit.iuh.product_service.dto.response.SizeDetailResponse;
import fit.iuh.product_service.entities.SizeDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SizeDetailMapper {
    SizeDetailResponse toSizeDetailMapper(SizeDetail sizeDetail);
}
