package com.example.chat_service.agent;

import com.example.chat_service.cart.CartIntentDetector;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * Toàn bộ trạng thái hội thoại của một user.
 *
 * Thay thế 2 Map rời trong ChatController cũ:
 *   Map<String, Deque<String[]>> chatHistory
 *   Map<String, String>          lastMentionedProduct
 *
 * Thêm pending slots (MỚI) để hỗ trợ clarification loop:
 *   Khi pendingIntent != NONE → system đang chờ user cung cấp thêm thông tin.
 *   Khi user trả lời → AgentOrchestrator merge slot, nếu đủ → clearPending() rồi thực thi.
 */
public class AgentSession {

    // ── Chat history ──────────────────────────────────────────────────────────
    // Mỗi phần tử = [userMsg, botMsg], addFirst → index 0 luôn là mới nhất
    public final Deque<String[]> history = new ArrayDeque<>();
    public static final int MAX_PAIRS = 6;

    // ── Co-reference resolution ───────────────────────────────────────────────
    // Sản phẩm cuối cùng được nhắc đến trong session — dùng để resolve "nó", "cái đó"
    public String lastMentionedProduct = null;

    // ── Pending slot filling (MỚI) ────────────────────────────────────────────

    /** Intent đang chờ hoàn thiện. NONE = không có gì pending → xử lý bình thường */
    public CartIntentDetector.CartIntent pendingIntent =
            CartIntentDetector.CartIntent.NONE;

    /** Tên sản phẩm đã xác định được (null = chưa biết) */
    public String  pendingProduct  = null;

    /** Size đã xác định (null = chưa hỏi/chưa trả lời) */
    public String  pendingSize     = null;

    /** Số lượng đã xác định (null = chưa hỏi/chưa trả lời) */
    public Integer pendingQuantity = null;

    /**
     * Bước slot nào đang chờ user trả lời.
     * Dùng để tránh hỏi lại cùng một slot nhiều lần liên tiếp.
     */
    public PendingStep nextStep = PendingStep.NONE;

    public enum PendingStep {
        NONE,
        AWAIT_PRODUCT,   // đang chờ user nói tên sản phẩm
        AWAIT_SIZE,      // đang chờ user nói size
        AWAIT_QUANTITY   // đang chờ user nói số lượng (hiện tại default 1, ít khi hỏi)
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public boolean hasPendingIntent() {
        return pendingIntent != CartIntentDetector.CartIntent.NONE;
    }

    /**
     * Gọi sau khi thực thi xong action hoặc user huỷ.
     * KHÔNG xoá history và lastMentionedProduct.
     */
    public void clearPending() {
        pendingIntent   = CartIntentDetector.CartIntent.NONE;
        pendingProduct  = null;
        pendingSize     = null;
        pendingQuantity = null;
        nextStep        = PendingStep.NONE;
    }

    /**
     * Đủ thông tin để thực thi ADD_TO_CART / BUY_NOW chưa.
     * REMOVE_FROM_CART không cần size/qty nên check riêng ở Orchestrator.
     */
    public boolean isCartActionReady() {
        return pendingProduct  != null && !pendingProduct.isBlank()
                && pendingSize != null
                && pendingQuantity != null;
    }

    /** Lưu cặp hội thoại, giữ tối đa MAX_PAIRS */
    public void savePair(String userMsg, String botMsg) {
        history.addFirst(new String[]{userMsg, botMsg});
        while (history.size() > MAX_PAIRS) history.removeLast();
    }

    @Override
    public String toString() {
        return String.format(
                "AgentSession{intent=%s, product='%s', size=%s, qty=%s, step=%s}",
                pendingIntent, pendingProduct, pendingSize, pendingQuantity, nextStep);
    }
}