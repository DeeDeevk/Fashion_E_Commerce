package fit.iuh.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SizeDetailResponse {
    private int id;
    private int quantity;
    private int sizeId;
    private String sizeName;
}
