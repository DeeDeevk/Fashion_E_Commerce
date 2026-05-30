package fit.iuh.product_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "order.exchange";
    public static final String QUEUE = "order.created.queue";
    public static final String ROUTING_KEY = "order.confirmed";

    public static final String PRODUCT_EXCHANGE = "product.exchange";
    public static final String PRODUCT_QUEUE = "product.sync.queue";
    public static final String PRODUCT_ROUTING_KEY = "product.upsert";

    // ✅ MỚI: compensation event khi stock không đủ
    public static final String STOCK_EXCHANGE = "stock.exchange";
    public static final String STOCK_QUEUE = "stock.insufficient.queue";
    public static final String STOCK_ROUTING_KEY = "stock.insufficient";

    public static final String CACHE_EVICT_EXCHANGE = "cache.evict.exchange";
    public static final String CACHE_EVICT_QUEUE = "product-service.cache.evict.queue";
    public static final String CACHE_EVICT_ROUTING_KEY = "cache.evict.product";

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderCreatedQueue).to(orderExchange).with(ROUTING_KEY);
    }

    @Bean
    public DirectExchange productExchange() {
        return new DirectExchange(PRODUCT_EXCHANGE);
    }

    @Bean
    public Queue productSyncQueue() {
        return QueueBuilder.durable(PRODUCT_QUEUE).build();
    }

    @Bean
    public Binding productSyncBinding(Queue productSyncQueue, DirectExchange productExchange) {
        return BindingBuilder.bind(productSyncQueue).to(productExchange).with(PRODUCT_ROUTING_KEY);
    }

    // ✅ MỚI: exchange + queue cho stock.insufficient
    @Bean
    public DirectExchange stockExchange() {
        return new DirectExchange(STOCK_EXCHANGE);
    }

    @Bean
    public Queue stockInsufficientQueue() {
        return QueueBuilder.durable(STOCK_QUEUE).build();
    }

    @Bean
    public Binding stockInsufficientBinding(Queue stockInsufficientQueue, DirectExchange stockExchange) {
        return BindingBuilder.bind(stockInsufficientQueue).to(stockExchange).with(STOCK_ROUTING_KEY);
    }

    @Bean
    public TopicExchange cacheEvictExchange() {
        return new TopicExchange(CACHE_EVICT_EXCHANGE);
    }

    @Bean
    public Queue cacheEvictQueue() {
        return QueueBuilder.durable(CACHE_EVICT_QUEUE).build();
    }

    @Bean
    public Binding cacheEvictBinding(Queue cacheEvictQueue, TopicExchange cacheEvictExchange) {
        return BindingBuilder.bind(cacheEvictQueue).to(cacheEvictExchange).with(CACHE_EVICT_ROUTING_KEY);
    }


    @Bean
    public MessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory cf) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(cf);
        factory.setMessageConverter(messageConverter());
        return factory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(messageConverter());
        return t;
    }
}