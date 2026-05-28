package fit.iuh.orderservice.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderConfirmedEventService {  // đổi tên từ OrderCreatedEvent
    private int orderId;
    private String orderCode;
    private int accountId;
    private List<OrderItemEvent> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemEvent {
        private int productId;
        private String productName;
        private int quantity;
        private double unitPrice;
        private Integer sizeDetailId;
    }
}