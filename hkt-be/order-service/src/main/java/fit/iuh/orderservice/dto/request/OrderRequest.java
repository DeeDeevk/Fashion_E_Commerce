package fit.iuh.orderservice.dto.request;

import fit.iuh.orderservice.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private String note;
    private int customerTradingId;
    private int account_id;
    private PaymentMethod paymentMethod;
}
