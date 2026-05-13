package fit.iuh.adminservice.dto.request;

import fit.iuh.adminservice.enums.PaymentMethod;
import fit.iuh.adminservice.enums.StatusPayment;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvoiceRequest {

    @NotNull(message = "Order ID là bắt buộc")
    private int orderId;

    @NotNull(message = "Phương thức thanh toán là bắt buộc")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Trạng thái thanh toán là bắt buộc")
    private StatusPayment paymentStatus;
}