package fit.iuh.product_service.consumer;

import fit.iuh.product_service.config.RabbitMQConfig;
import fit.iuh.product_service.service.OrderConfirmedEvent;
import fit.iuh.product_service.service.ProductCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final ProductCacheService productCacheService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        log.info("📦 Nhận event order.confirmed: orderCode={}, {} items",
                event.getOrderCode(),
                event.getItems().size());

        // Log từng sản phẩm trong đơn
        event.getItems().forEach(item ->
                log.info("  → productId={}, name={}, qty={}",
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity())
        );

        // Invalidate cache → lần GET tiếp theo sẽ load lại từ DB
        productCacheService.refreshCache();
        log.info("✅ Cache đã được refresh sau order {}", event.getOrderCode());
    }
}