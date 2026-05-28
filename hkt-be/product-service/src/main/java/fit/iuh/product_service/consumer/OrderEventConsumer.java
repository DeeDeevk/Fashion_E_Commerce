package fit.iuh.product_service.consumer;

import fit.iuh.product_service.config.RabbitMQConfig;
import fit.iuh.product_service.entities.Product;
import fit.iuh.product_service.entities.SizeDetail;
import fit.iuh.product_service.repository.ProductRepository;
import fit.iuh.product_service.repository.SizeDetailRepository;
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
    private final SizeDetailRepository sizeDetailRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        log.info("Received order.confirmed: orderCode={}, {} items",
                event.getOrderCode(), event.getItems().size());

        for (OrderConfirmedEvent.OrderItemEvent item : event.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) {
                publishInsufficient(event.getOrderId(), event.getOrderCode(),
                        "Product not found: " + item.getProductId());
                return;
            }
            if (product.getQuantity() < item.getQuantity()) {
                publishInsufficient(event.getOrderId(), event.getOrderCode(),
                        "Insufficient stock: " + product.getName()
                                + " (need " + item.getQuantity() + ", have " + product.getQuantity() + ")");
                return;
            }

            if (item.getSizeDetailId() != null) {
                SizeDetail sizeDetail = sizeDetailRepository.findById(item.getSizeDetailId()).orElse(null);
                if (sizeDetail == null) {
                    publishInsufficient(event.getOrderId(), event.getOrderCode(),
                            "Size not found: sizeDetailId=" + item.getSizeDetailId());
                    return;
                }
                if (sizeDetail.getQuantity() < item.getQuantity()) {
                    publishInsufficient(event.getOrderId(), event.getOrderCode(),
                            "Insufficient size stock: " + product.getName()
                                    + " size " + sizeDetail.getSize().getNameSize()
                                    + " (need " + item.getQuantity() + ", have " + sizeDetail.getQuantity() + ")");
                    return;
                }
            }
        }

        for (OrderConfirmedEvent.OrderItemEvent item : event.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElseThrow();
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            if (item.getSizeDetailId() != null) {
                SizeDetail sizeDetail = sizeDetailRepository.findById(item.getSizeDetailId()).orElseThrow();
                sizeDetail.setQuantity(sizeDetail.getQuantity() - item.getQuantity());
                sizeDetailRepository.save(sizeDetail);
                log.info("SizeDetail deducted: sizeDetailId={}, remaining={}",
                        sizeDetail.getId(), sizeDetail.getQuantity());
            }

            log.info("Stock deducted: productId={}, remaining={}",
                    product.getId(), product.getQuantity());
        }

        productCacheService.refreshCache();

        // publish thành công về order-service
        Map<String, Object> confirmedPayload = new HashMap<>();
        confirmedPayload.put("orderId", event.getOrderId());
        confirmedPayload.put("orderCode", event.getOrderCode());
        rabbitTemplate.convertAndSend("order.exchange", "order.stock.confirmed", confirmedPayload);
        log.info("Published order.stock.confirmed for orderId={}", event.getOrderId());
    }

    private void publishInsufficient(int orderId, String orderCode, String reason) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", orderId);
        payload.put("orderCode", orderCode);
        payload.put("reason", reason);
        rabbitTemplate.convertAndSend(RabbitMQConfig.STOCK_EXCHANGE, RabbitMQConfig.STOCK_ROUTING_KEY, payload);
        log.info("Published stock.insufficient for orderId={}, reason={}", orderId, reason);
    }
}