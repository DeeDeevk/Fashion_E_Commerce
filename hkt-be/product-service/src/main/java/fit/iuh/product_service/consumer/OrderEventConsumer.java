package fit.iuh.product_service.consumer;

import fit.iuh.product_service.config.RabbitMQConfig;
import fit.iuh.product_service.entities.Product;
import fit.iuh.product_service.repository.ProductRepository;
import fit.iuh.product_service.service.OrderConfirmedEvent;
import fit.iuh.product_service.service.ProductCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final ProductCacheService productCacheService;
    private final ProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        log.info("Received order.confirmed: orderCode={}, {} items",
                event.getOrderCode(), event.getItems().size());

        // validate trước — nếu bất kỳ sản phẩm nào thiếu hàng thì rollback toàn bộ
        for (OrderConfirmedEvent.OrderItemEvent item : event.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElse(null);
            if (product == null) {
                log.warn("Product not found: {}", item.getProductId());
                publishInsufficient(event.getOrderId(), event.getOrderCode(),
                        "Product not found: " + item.getProductId());
                return;
            }
            if (product.getQuantity() < item.getQuantity()) {
                log.warn("Insufficient stock for product {}: need {}, have {}",
                        product.getName(), item.getQuantity(), product.getQuantity());
                publishInsufficient(event.getOrderId(), event.getOrderCode(),
                        "Insufficient stock: " + product.getName()
                                + " (need " + item.getQuantity() + ", have " + product.getQuantity() + ")");
                return;
            }
        }

        // tất cả đủ hàng → trừ stock
        for (OrderConfirmedEvent.OrderItemEvent item : event.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElseThrow();
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);
            log.info("Stock deducted: productId={}, remaining={}",
                    product.getId(), product.getQuantity());
        }

        productCacheService.refreshCache();
        log.info("Stock deducted and cache refreshed for order {}", event.getOrderCode());
    }

    private void publishInsufficient(int orderId, String orderCode, String reason) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", orderId);
        payload.put("orderCode", orderCode);
        payload.put("reason", reason);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.STOCK_EXCHANGE,
                RabbitMQConfig.STOCK_ROUTING_KEY,
                payload
        );
        log.info("Published stock.insufficient for orderId={}", orderId);
    }
}