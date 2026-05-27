package fit.iuh.orderservice.service;

import fit.iuh.orderservice.config.RabbitMQConfig;
import fit.iuh.orderservice.enums.StatusOrdering;
import fit.iuh.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockRollbackListener {

    private final OrderRepository orderRepository;

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.STOCK_QUEUE)
    public void handleStockInsufficient(Map<String, Object> payload) {
        int orderId = (Integer) payload.get("orderId");
        String reason = (String) payload.get("reason");
        log.warn("Received stock.insufficient for orderId={}, reason={}", orderId, reason);

        orderRepository.findById(orderId).ifPresentOrElse(order -> {
            order.setStatusOrder(StatusOrdering.PENDING);
            orderRepository.save(order);
            log.info("Order {} rolled back to PENDING", orderId);
        }, () -> log.error("Order not found for rollback: {}", orderId));
    }
}