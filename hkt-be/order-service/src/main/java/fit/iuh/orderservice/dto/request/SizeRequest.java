package fit.iuh.orderservice.dto.request;

import fit.iuh.orderservice.enums.SizeName;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SizeRequest {
    @Enumerated(EnumType.STRING)
    private SizeName nameSize;
}
