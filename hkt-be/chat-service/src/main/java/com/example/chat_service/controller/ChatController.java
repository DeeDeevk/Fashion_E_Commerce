package com.example.chat_service.controller;

import com.example.chat_service.agent.AgentOrchestrator;
import com.example.chat_service.cart.CartActionService;
import com.example.chat_service.client.CartClient;
import com.example.chat_service.client.OrderClient;
import com.example.chat_service.dto.CartResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Thin HTTP layer — KHÔNG chứa business logic.
 *
 * Việc của Controller:
 *   1. Parse Authorization header → token
 *   2. Tạo userId từ token
 *   3. Delegate sang AgentOrchestrator
 *   4. Wrap ResponseEntity
 *
 * Tất cả business logic (RAG, slot filling, cart, co-reference, ...)
 * đã chuyển hết vào AgentOrchestrator.
 */
@RestController
@RequestMapping("/chat")
public class ChatController {

    private final AgentOrchestrator orchestrator;
    private final CartClient        cartClient;
    private final CartActionService cartActionService;
    private final OrderClient       orderClient;
    private final JwtDecoder        jwtDecoder;

    public ChatController(AgentOrchestrator orchestrator,
                          CartClient cartClient,
                          CartActionService cartActionService,
                          OrderClient orderClient,
                          JwtDecoder jwtDecoder) {
        this.orchestrator      = orchestrator;
        this.cartClient        = cartClient;
        this.cartActionService = cartActionService;
        this.orderClient       = orderClient;
        this.jwtDecoder        = jwtDecoder;
    }

    // ── POST /chat/ask ────────────────────────────────────────────────────────

    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> ask(
            HttpServletRequest request,
            @RequestBody PromptRequest body) {

        String token  = extractToken(request.getHeader("Authorization"));
        String prompt = body.getPrompt() == null ? "" : body.getPrompt().trim();

        if (prompt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "message",           "Dạ anh/chị nhắn gì cho em với ạ! 😊",
                    "suggestedProducts", List.of()));
        }

        // userId: dùng hashCode token để tránh lưu JWT raw làm key
        // guest session chia sẻ giữa các anonymous user — chấp nhận được với in-memory
        String userId = token != null
                ? "user_" + token.hashCode()
                : "guest";

        return ResponseEntity.ok(orchestrator.handle(userId, prompt, token));
    }

    // ── Cart endpoints (giữ nguyên như cũ) ───────────────────────────────────

    @GetMapping("/ping-cart")
    public ResponseEntity<Map<String, Object>> pingCart() {
        boolean ok = cartClient.ping();
        return ResponseEntity.ok(Map.of(
                "cartServiceConnected", ok,
                "message", ok
                        ? "✅ Kết nối cart-service thành công!"
                        : "❌ Không kết nối được cart-service"));
    }

    @GetMapping("/cart/{accountId}")
    public ResponseEntity<Map<String, Object>> getCart(
            HttpServletRequest request,
            @PathVariable int accountId) {
        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of("error", "Vui lòng đăng nhập để xem giỏ hàng"));
        try {
            CartResponse cart = cartClient.getCartByAccountId(accountId, token);
            return ResponseEntity.ok(Map.of("cart", cart != null ? cart : "Giỏ hàng trống"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cart/confirm-add")
    public ResponseEntity<Map<String, Object>> confirmAdd(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of(
                    "message",           "Vui lòng đăng nhập ạ 🔐",
                    "suggestedProducts", List.of()));

        int productId    = (int) body.get("productId");
        int sizeDetailId = (int) body.get("sizeDetailId");
        int quantity     = (int) body.get("quantity");
        return ResponseEntity.ok(
                cartActionService.executeAddToCart(productId, sizeDetailId, quantity, token));
    }

    @PostMapping("/cart/confirm-remove")
    public ResponseEntity<Map<String, Object>> confirmRemove(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of(
                    "message",           "Vui lòng đăng nhập ạ 🔐",
                    "suggestedProducts", List.of()));

        int cartDetailId = (int) body.get("cartDetailId");
        return ResponseEntity.ok(cartClient.deleteCartDetail(cartDetailId, token));
    }

    // ── Order endpoints (giữ nguyên như cũ) ──────────────────────────────────

    @GetMapping("/order/addresses")
    public ResponseEntity<Map<String, Object>> getAddresses(HttpServletRequest request) {
        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of("error", "Vui lòng đăng nhập ạ 🔐"));
        try {
            org.springframework.security.oauth2.jwt.Jwt jwt = jwtDecoder.decode(token);
            Number id = jwt.getClaim("id");
            if (id == null)
                return ResponseEntity.ok(Map.of("error", "Không lấy được thông tin user"));

            List<Map<String, Object>> addresses =
                    orderClient.getAddresses(id.intValue(), token);
            if (addresses == null || addresses.isEmpty())
                return ResponseEntity.ok(Map.of(
                        "addresses", List.of(),
                        "message",   "Bạn chưa có địa chỉ nào được lưu"));
            return ResponseEntity.ok(Map.of("addresses", addresses));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", "Lỗi lấy địa chỉ: " + e.getMessage()));
        }
    }

    @PostMapping("/order/confirm")
    public ResponseEntity<Map<String, Object>> confirmOrder(
            HttpServletRequest request,
            @RequestBody OrderConfirmRequest req) {

        String token = extractToken(request.getHeader("Authorization"));
        if (token == null)
            return ResponseEntity.ok(Map.of(
                    "success", false, "message", "Vui lòng đăng nhập ạ 🔐"));

        try {
            org.springframework.security.oauth2.jwt.Jwt jwt = jwtDecoder.decode(token);
            Number idClaim = jwt.getClaim("id");
            if (idClaim == null)
                return ResponseEntity.ok(Map.of(
                        "success", false, "message", "Không lấy được thông tin user"));
            int userId = idClaim.intValue();

            Map<String, Object> customer = orderClient.getCustomer(userId, token);
            if (customer == null)
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Không lấy được thông tin khách hàng ạ 😔"));

            String name  = (String) customer.getOrDefault("fullName",    "");
            String phone = (String) customer.getOrDefault("phoneNumber", "");
            String email = (String) customer.getOrDefault("email",       "");

            List<Map<String, Object>> addresses =
                    orderClient.getAddresses(userId, token);
            if (addresses == null || addresses.isEmpty())
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Anh/chị chưa có địa chỉ nào, vui lòng vào Checkout để thêm ạ!"));

            Map<String, Object> selectedAddr = addresses.stream()
                    .filter(a -> a.get("id") != null
                            && ((Number) a.get("id")).intValue() == req.addressId)
                    .findFirst().orElse(null);
            if (selectedAddr == null)
                return ResponseEntity.ok(Map.of(
                        "success", false, "message", "Không tìm thấy địa chỉ đã chọn ạ 😔"));

            String fullAddress = selectedAddr.getOrDefault("delivery_address", "")
                    + ", " + selectedAddr.getOrDefault("province", "");

            double total = req.price * req.quantity + 30_000;

            // Customer trading
            Map<String, Object> tradingBody = new HashMap<>();
            tradingBody.put("receiverName",    name);
            tradingBody.put("receiverPhone",   phone);
            tradingBody.put("receiverEmail",   email);
            tradingBody.put("receiverAddress", fullAddress);
            tradingBody.put("totalAmount",     total);
            Map<String, Object> trading = orderClient.createCustomerTrading(tradingBody, token);
            if (trading == null)
                return ResponseEntity.ok(Map.of("success", false, "message", "Tạo đơn hàng thất bại ạ 😔"));

            int tradingId = ((Number) trading.get("id")).intValue();

            // Order
            Map<String, Object> orderBody = new HashMap<>();
            orderBody.put("customerTradingId", tradingId);
            orderBody.put("note",              req.note != null ? req.note : "");
            orderBody.put("account_id",        userId);
            orderBody.put("paymentMethod",
                    "bank".equals(req.paymentMethod) ? "BANK_TRANSFER" : "CASH");
            Map<String, Object> order = orderClient.createOrder(orderBody, token);
            if (order == null)
                return ResponseEntity.ok(Map.of("success", false, "message", "Tạo đơn hàng thất bại ạ 😔"));

            int orderId = ((Number) order.get("id")).intValue();

            // Order detail
            Map<String, Object> detailBody = new HashMap<>();
            detailBody.put("productName",  req.productName);
            detailBody.put("quantity",     req.quantity);
            detailBody.put("unitPrice",    req.price);
            detailBody.put("totalPrice",   req.price * req.quantity);
            detailBody.put("orderId",      orderId);
            detailBody.put("productId",    req.productId);
            detailBody.put("sizeDetailId", req.sizeDetailId);
            orderClient.createOrderDetail(detailBody, token);

            // Bank → invoice
            if ("bank".equals(req.paymentMethod)) {
                Map<String, Object> invoiceBody = new HashMap<>();
                invoiceBody.put("orderId",       orderId);
                invoiceBody.put("paymentMethod", "BANK_TRANSFER");
                invoiceBody.put("paymentStatus", "UNPAID");
                Map<String, Object> invoice = orderClient.createInvoice(invoiceBody, token);
                if (invoice == null)
                    return ResponseEntity.ok(Map.of("success", false, "message", "Tạo hóa đơn thất bại ạ 😔"));
                return ResponseEntity.ok(Map.of(
                        "success",       true,
                        "paymentMethod", "bank",
                        "paymentInfo", Map.of(
                                "orderId",     orderId,
                                "amount",      total,
                                "invoiceId",   ((Number) invoice.get("id")).intValue(),
                                "invoiceCode", invoice.getOrDefault("invoiceCode", "")
                        ),
                        "message", "Đặt hàng thành công! Đang chuyển đến trang thanh toán 🎉"));
            }

            return ResponseEntity.ok(Map.of(
                    "success",       true,
                    "paymentMethod", "cash",
                    "orderId",       orderId,
                    "message",       "Đặt hàng thành công! Cảm ơn anh/chị đã mua hàng 🎉"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Có lỗi xảy ra ạ 😔 " + e.getMessage()));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String extractToken(String header) {
        if (header == null || !header.startsWith("Bearer ")) return null;
        return header.substring(7).trim();
    }

    // ── Inner classes ─────────────────────────────────────────────────────────

    public static class PromptRequest {
        private String prompt;
        public String getPrompt()              { return prompt; }
        public void   setPrompt(String prompt) { this.prompt = prompt; }
    }

    public static class OrderConfirmRequest {
        public int    productId;
        public String productName;
        public int    sizeDetailId;
        public int    quantity;
        public double price;
        public int    addressId;
        public String paymentMethod; // "cash" | "bank"
        public String note;
    }
}