package fit.iuh.adminservice.event;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CacheEvictPublisher {
    private final RabbitTemplate rabbitTemplate;

    public static final String EXCHANGE = "cache.evict.exchange";
    public static final String ROUTING_KEY = "cache.evict.product";

    public void publicEvict(String cacheName) {
        rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, cacheName);
    }
}
