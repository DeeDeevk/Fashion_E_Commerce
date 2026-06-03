package com.example.chat_service.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Client gọi order-service qua Eureka load-balancer.
 * Tất cả endpoint mirror đúng những gì Checkout.jsx đang gọi trực tiếp.
 */
@Component
public class OrderClient {

    private final WebClient webClient;

    public OrderClient(@Qualifier("orderWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    // ── /customers/{userId} ───────────────────────────────────────────────────
    /**
     * Lấy thông tin khách hàng (name, phone, email).
     * Response: { fullName, phoneNumber, email, ... }
     */
    public Map<String, Object> getCustomer(int userId, String token) {
        try {
            return webClient.get()
                    .uri("/customers/" + userId)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (WebClientResponseException e) {
            System.err.println("[OrderClient] getCustomer error: " + e.getStatusCode());
            return null;
        } catch (Exception e) {
            System.err.println("[OrderClient] getCustomer error: " + e.getMessage());
            return null;
        }
    }

    // ── /addresses/{userId} ───────────────────────────────────────────────────
    /**
     * Lấy danh sách địa chỉ đã lưu của user.
     * Response: List của { id, delivery_address, province, city, ward, delivery_note }
     */
    public List<Map<String, Object>> getAddresses(int userId, String token) {
        try {
            System.out.println("[OrderClient] Calling order-service /addresses/" + userId);

            List<Map<String, Object>> result = webClient.get()
                    .uri("/addresses/" + userId)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block(Duration.ofSeconds(8));   // ← Thêm timeout

            System.out.println("[OrderClient] Success: " + (result != null ? result.size() : 0) + " addresses");
            return result;
        } catch (Exception e) {
            System.err.println("[OrderClient] getAddresses FAILED for userId=" + userId);
            e.printStackTrace();   // ← Quan trọng
            return null;
        }
    }

    // ── /customer-trading/create ──────────────────────────────────────────────
    /**
     * Tạo customer trading (header đơn hàng).
     * Body: { receiverName, receiverPhone, receiverEmail, receiverAddress, totalAmount }
     * Response: { id, ... }
     */
    public Map<String, Object> createCustomerTrading(Map<String, Object> body, String token) {
        try {
            return webClient.post()
                    .uri("/customer-trading/create")
                    .header("Authorization", "Bearer " + token)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (WebClientResponseException e) {
            System.err.println("[OrderClient] createCustomerTrading error: "
                    + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            System.err.println("[OrderClient] createCustomerTrading error: " + e.getMessage());
            return null;
        }
    }

    // ── /orders/create ────────────────────────────────────────────────────────
    /**
     * Tạo order.
     * Body: { customerTradingId, note, account_id, paymentMethod }
     * Response: { id, ... }
     */
    public Map<String, Object> createOrder(Map<String, Object> body, String token) {
        try {
            return webClient.post()
                    .uri("/orders/create")
                    .header("Authorization", "Bearer " + token)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (WebClientResponseException e) {
            System.err.println("[OrderClient] createOrder error: "
                    + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            System.err.println("[OrderClient] createOrder error: " + e.getMessage());
            return null;
        }
    }

    // ── /order-details/create ─────────────────────────────────────────────────
    /**
     * Tạo order detail (1 dòng sản phẩm).
     * Body: { productName, quantity, unitPrice, totalPrice, orderId, productId, sizeDetailId }
     */
    public Map<String, Object> createOrderDetail(Map<String, Object> body, String token) {
        try {
            return webClient.post()
                    .uri("/order-details/create")
                    .header("Authorization", "Bearer " + token)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (WebClientResponseException e) {
            System.err.println("[OrderClient] createOrderDetail error: "
                    + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            System.err.println("[OrderClient] createOrderDetail error: " + e.getMessage());
            return null;
        }
    }

    // ── /invoices ─────────────────────────────────────────────────────────────
    /**
     * Tạo invoice (chỉ cho BANK_TRANSFER).
     * Body: { orderId, paymentMethod, paymentStatus }
     * Response: { id, invoiceCode, ... }
     */
    public Map<String, Object> createInvoice(Map<String, Object> body, String token) {
        try {
            return webClient.post()
                    .uri("/invoices")
                    .header("Authorization", "Bearer " + token)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (WebClientResponseException e) {
            System.err.println("[OrderClient] createInvoice error: "
                    + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            System.err.println("[OrderClient] createInvoice error: " + e.getMessage());
            return null;
        }
    }
}