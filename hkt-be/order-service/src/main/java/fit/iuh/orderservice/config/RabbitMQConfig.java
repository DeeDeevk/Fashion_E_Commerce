package fit.iuh.orderservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE    = "order.exchange";
    public static final String QUEUE       = "order.created.queue";
    public static final String ROUTING_KEY = "order.confirmed";

    // ✅ MỚI: lắng nghe compensation từ product-service
    public static final String STOCK_EXCHANGE    = "stock.exchange";
    public static final String STOCK_QUEUE       = "stock.insufficient.queue";
    public static final String STOCK_ROUTING_KEY = "stock.insufficient";

    @Bean public DirectExchange orderExchange() { return new DirectExchange(EXCHANGE); }
    @Bean public Queue orderCreatedQueue() { return QueueBuilder.durable(QUEUE).build(); }
    @Bean public Binding orderCreatedBinding(Queue orderCreatedQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderCreatedQueue).to(orderExchange).with(ROUTING_KEY);
    }

    // ✅ MỚI: bind vào stock exchange để nhận rollback event
    @Bean public DirectExchange stockExchange() { return new DirectExchange(STOCK_EXCHANGE); }
    @Bean public Queue stockInsufficientQueue() { return QueueBuilder.durable(STOCK_QUEUE).build(); }
    @Bean public Binding stockInsufficientBinding(Queue stockInsufficientQueue, DirectExchange stockExchange) {
        return BindingBuilder.bind(stockInsufficientQueue).to(stockExchange).with(STOCK_ROUTING_KEY);
    }

    @Bean public Jackson2JsonMessageConverter messageConverter() { return new Jackson2JsonMessageConverter(); }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(messageConverter());
        return t;
    }
}