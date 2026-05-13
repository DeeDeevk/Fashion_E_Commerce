package fit.iuh.product_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SizeDetailResponse implements Serializable {
    private int id;
    private int quantity;
    private int sizeId;
}
