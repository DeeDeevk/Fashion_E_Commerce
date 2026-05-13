package fit.iuh.orderservice.controller;

import fit.iuh.orderservice.dto.request.OrderDetailRequest;
import fit.iuh.orderservice.dto.response.OrderDetailResponse;
import fit.iuh.orderservice.service.OrderDetailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order-details")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderDetailController {
    OrderDetailService orderDetailService;

    // Giữ nguyên
    @PostMapping("/create")
    public OrderDetailResponse createOrderDetail(@RequestBody OrderDetailRequest request) {
        return orderDetailService.createOrderDetail(request);
    }

    // ========== THÊM MỚI ==========

    // product-service gọi: GET /order-details/sold-quantity-all
    // Trả về: { "result": { "1": 10, "2": 5, ... } }
    @GetMapping("/sold-quantity-all")
    public Map<String, Object> getSoldQuantityAll() {
        Map<String, Object> response = new HashMap<>();
        response.put("result", orderDetailService.getSoldQuantityAll());
        return response;
    }

    // product-service gọi: GET /order-details/sold-quantity?productId=1
    // Trả về: { "result": 10 }
    @GetMapping("/sold-quantity")
    public Map<String, Object> getSoldQuantity(@RequestParam Integer productId) {
        Map<String, Object> response = new HashMap<>();
        response.put("result", orderDetailService.getSoldQuantityByProductId(productId));
        return response;
    }

    // product-service gọi: GET /order-details/top-trending?type=week
    // Trả về: [ { productId, sales, revenue, trend }, ... ]
    @GetMapping("/top-trending")
    public List<Map<String, Object>> getTopTrending(@RequestParam String type) {
        return orderDetailService.getTopTrending(type);
    }
}