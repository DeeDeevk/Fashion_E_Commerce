package fit.iuh.userservice.dto.request;

import fit.iuh.userservice.enums.StatusOrdering;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateOrderStatusRequest {
    private StatusOrdering statusOrder;
}

