package fit.iuh.orderservice.dto.response;

import fit.iuh.orderservice.enums.PaymentMethod;
import fit.iuh.orderservice.enums.StatusOrdering;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    private int id;
    private String orderCode;
    private String note;
    private Date orderDate;
    private StatusOrdering statusOrder;
    private CustomerTradingResponse customerTrading;
    private AccountResponse account;
    private PaymentMethod paymentMethod;
    private List<OrderDetailResponse> orderDetails;
}
