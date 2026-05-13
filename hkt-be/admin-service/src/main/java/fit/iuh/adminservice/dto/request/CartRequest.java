package fit.iuh.adminservice.dto.request;

import lombok.Data;

@Data
public class CartRequest {
    private int quantity;
    private double totalAmount;
}
