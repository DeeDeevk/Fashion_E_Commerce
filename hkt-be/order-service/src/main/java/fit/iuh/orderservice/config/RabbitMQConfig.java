package fit.iuh.orderservice.config; // đổi package cho product-service

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Tên Exchange, Queue, Routing Key — đặt constant để tránh typo
    public static final String EXCHANGE    = "order.exchange";
    public static final String QUEUE       = "order.created.queue";
    public static final String ROUTING_KEY = "order.confirmed";

    // 1. Khai báo Exchange (kiểu Direct)
    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(EXCHANGE);
    }

    // 2. Khai báo Queue (durable = tồn tại kể cả khi restart RabbitMQ)
    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    // 3. Binding Queue với Exchange qua Routing Key
    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedQueue,
                                       DirectExchange orderExchange) {
        return BindingBuilder
                .bind(orderCreatedQueue)
                .to(orderExchange)
                .with(ROUTING_KEY);
    }

    // 4. Dùng JSON thay vì Java serialization
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // 5. RabbitTemplate dùng JSON converter
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}