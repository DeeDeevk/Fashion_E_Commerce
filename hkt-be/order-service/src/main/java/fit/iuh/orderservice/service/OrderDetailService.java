package fit.iuh.orderservice.service;

import fit.iuh.orderservice.config.RabbitMQConfig;
import fit.iuh.orderservice.dto.request.OrderDetailRequest;
import fit.iuh.orderservice.dto.response.OrderDetailResponse;
import fit.iuh.orderservice.entities.Order;
import fit.iuh.orderservice.entities.OrderDetail;
import fit.iuh.orderservice.entities.Product;
import fit.iuh.orderservice.mapper.OrderDetailMapper;
import fit.iuh.orderservice.repository.OrderDetailRepository;
import fit.iuh.orderservice.repository.OrderRepository;
import fit.iuh.orderservice.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor

public class OrderDetailService {
    OrderDetailRepository orderDetailRepository;
    ProductRepository productRepository;
    OrderRepository orderRepository;
    OrderDetailMapper orderDetailMapper;
    RabbitTemplate rabbitTemplate;

    public OrderDetailResponse createOrderDetail(OrderDetailRequest orderDetailRequest) {
        Product product = productRepository.findById(orderDetailRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        System.out.println("📥 REQUEST productId = " + orderDetailRequest.getProductId());
        System.out.println("📥 REQUEST productName = " + orderDetailRequest.getProductName());
        System.out.println("📥 REQUEST orderId = " + orderDetailRequest.getOrderId());
        System.out.println("📥 REQUEST quantity = " + orderDetailRequest.getQuantity());
        Order order = orderRepository.findById(orderDetailRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (product.getQuantity() < orderDetailRequest.getQuantity()) {
            throw new RuntimeException("Không đủ tồn kho cho sản phẩm: " + product.getName()
                    + " (còn " + product.getQuantity() + ")");
        }

        OrderDetail orderDetail = new OrderDetail();
        orderDetail.setProduct(product);
        orderDetail.setOrder(order);
        orderDetail.setProductName(orderDetailRequest.getProductName());
        orderDetail.setQuantity(orderDetailRequest.getQuantity());
        orderDetail.setCreated_at(new Date());
        orderDetail.setUpdated_at(new Date());
        orderDetail.setTotalPrice(orderDetailRequest.getTotalPrice());
        orderDetail.setUnitPrice(orderDetailRequest.getUnitPrice());

        OrderDetail saved = orderDetailRepository.save(orderDetail);
        productRepository.save(product);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                new OrderConfirmedEventService(
                        order.getId(),
                        order.getOrderCode(),
                        order.getAccount().getId(),
                        List.of(new OrderConfirmedEventService.OrderItemEvent(
                                product.getId(),
                                orderDetailRequest.getProductName(),
                                orderDetailRequest.getQuantity(),
                                orderDetailRequest.getUnitPrice()
                        ))
                )
        );

        return orderDetailMapper.toOrderDetailResponse(saved);

    }


    // Lấy sold quantity của TẤT CẢ sản phẩm → trả về Map<productId, soldQty>
    public Map<Integer, Long> getSoldQuantityAll() {
        List<Object[]> rows = orderDetailRepository.findSoldQuantityByProductId();
        Map<Integer, Long> result = new HashMap<>();
        for (Object[] row : rows) {
            Integer productId = (Integer) row[0];
            Long qty = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            result.put(productId, qty);
        }
        return result;
    }

    // Lấy sold quantity của MỘT sản phẩm
    public Long getSoldQuantityByProductId(Integer productId) {
        Long qty = orderDetailRepository.findSoldQuantityByProductId(productId);
        return qty != null ? qty : 0L;
    }

    // Lấy top trending
    public List<Map<String, Object>> getTopTrending(String type) {
        Date now = new Date();
        Date start;
        Date prevStart;
        Date prevEnd;

        switch (type.toLowerCase()) {
            case "week":
                start    = Date.from(now.toInstant().minus(7,   ChronoUnit.DAYS));
                prevEnd  = start;
                prevStart = Date.from(prevEnd.toInstant().minus(7, ChronoUnit.DAYS));
                break;
            case "month":
                start    = Date.from(now.toInstant().minus(30,  ChronoUnit.DAYS));
                prevEnd  = start;
                prevStart = Date.from(prevEnd.toInstant().minus(30, ChronoUnit.DAYS));
                break;
            case "year":
                start    = Date.from(now.toInstant().minus(365, ChronoUnit.DAYS));
                prevEnd  = start;
                prevStart = Date.from(prevEnd.toInstant().minus(365, ChronoUnit.DAYS));
                break;
            default:
                throw new RuntimeException("Invalid type: must be week / month / year");
        }

        Pageable top10 = PageRequest.of(0, 10);
        List<Object[]> topData  = orderDetailRepository.getTopTrending(start, now, top10);
        List<Object[]> prevData = orderDetailRepository.getSalesInPeriod(prevStart, prevEnd, top10);

        // Map productId → kỳ trước
        Map<Integer, Integer> prevSalesMap = new HashMap<>();
        for (Object[] row : prevData) {
            prevSalesMap.put((Integer) row[0], ((Long) row[1]).intValue());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : topData) {
            Integer productId = (Integer) row[0];
            int     sales     = ((Long)   row[1]).intValue();
            double  revenue   = ((Number) row[2]).doubleValue();
            int     prevSales = prevSalesMap.getOrDefault(productId, 0);

            String trend;
            if (prevSales == 0) {
                trend = "+100%";
            } else {
                double change = ((double)(sales - prevSales) / prevSales) * 100;
                trend = String.format("%+.0f%%", change);
            }

            Map<String, Object> item = new HashMap<>();
            item.put("productId", productId);
            item.put("sales",     sales);
            item.put("revenue",   revenue);
            item.put("trend",     trend);
            result.add(item);
        }
        return result;
    }


}