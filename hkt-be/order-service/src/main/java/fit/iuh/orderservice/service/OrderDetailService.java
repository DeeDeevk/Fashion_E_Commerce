package fit.iuh.orderservice.service;

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
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor

public class OrderDetailService {
    OrderDetailRepository orderDetailRepository;
    ProductRepository productRepository;
    OrderRepository orderRepository;
    OrderDetailMapper orderDetailMapper;

    public OrderDetailResponse createOrderDetail(OrderDetailRequest orderDetailRequest) {
        Product product = productRepository.findById(orderDetailRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Order order = orderRepository.findById(orderDetailRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

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

        return orderDetailMapper.toOrderDetailResponse(saved);

    }
}
