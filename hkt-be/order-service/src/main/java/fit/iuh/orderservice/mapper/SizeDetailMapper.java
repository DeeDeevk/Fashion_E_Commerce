package fit.iuh.orderservice.mapper;

import fit.iuh.orderservice.dto.response.SizeDetailResponse;
import fit.iuh.orderservice.entities.SizeDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SizeDetailMapper {
    SizeDetailResponse toSizeDetailMapper(SizeDetail sizeDetail);
}
