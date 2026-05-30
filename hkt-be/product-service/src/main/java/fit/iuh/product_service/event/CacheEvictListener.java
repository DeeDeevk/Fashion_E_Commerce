package fit.iuh.product_service.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.cache.CacheManager;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CacheEvictListener {
    private final CacheManager cacheManager;

    @RabbitListener(
            queues = "product-service.cache.evict.queue",
            containerFactory = "rabbitListenerContainerFactory"
    )
    @RabbitListener(queues = "product-service.cache.evict.queue")
    public void handleCacheEvict(Message message) {

        // Đọc raw bytes → convert sang String thủ công, tránh bị JacksonConverter parse nhầm
        String cacheNames = new String(message.getBody());
        log.info("[CacheEvict] Received: {}", cacheNames);

        for (String entry : cacheNames.split(",")) {
            entry = entry.trim();

            if (entry.contains(":")) {
                String[] parts = entry.split(":", 2);
                String cacheName = parts[0];
                int key = Integer.parseInt(parts[1]);

                var cache = cacheManager.getCache(cacheName);
                if (cache != null) {
                    cache.evict(key);
                    log.info("[CacheEvict] Evicted key={} from cache='{}'", key, cacheName);
                }
            } else {
                var cache = cacheManager.getCache(entry);
                if (cache != null) {
                    cache.clear();
                    log.info("[CacheEvict] Cleared cache='{}'", entry);
                }
            }
        }
    }
}
