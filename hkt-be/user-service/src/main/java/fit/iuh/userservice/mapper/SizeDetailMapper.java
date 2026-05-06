package fit.iuh.userservice.mapper;

import fit.iuh.userservice.dto.response.SizeDetailResponse;
import fit.iuh.userservice.entities.SizeDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SizeDetailMapper {
    SizeDetailResponse toSizeDetailMapper(SizeDetail sizeDetail);
}
