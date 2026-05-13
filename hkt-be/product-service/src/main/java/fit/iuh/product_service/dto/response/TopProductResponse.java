package fit.iuh.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopProductResponse implements Serializable {
    String name;
    String category;
    int sales;
    double revenue;
    String trend;
    String img;
}
