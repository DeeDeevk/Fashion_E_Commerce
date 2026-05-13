package fit.iuh.adminservice.dto.request;

import fit.iuh.adminservice.enums.StatusOrdering;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateOrderStatusRequest {
    private StatusOrdering statusOrder;
}

