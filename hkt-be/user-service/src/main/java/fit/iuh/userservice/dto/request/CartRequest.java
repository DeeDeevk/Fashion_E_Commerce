package fit.iuh.userservice.dto.request;

import lombok.Data;

@Data
public class CartRequest {
    private int quantity;
    private double totalAmount;
}
