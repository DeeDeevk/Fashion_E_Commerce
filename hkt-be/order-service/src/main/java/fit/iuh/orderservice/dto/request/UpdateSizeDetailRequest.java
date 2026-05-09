package fit.iuh.orderservice.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateSizeDetailRequest {
    int quantity;
    private int productId;
    private int sizeId;
}
