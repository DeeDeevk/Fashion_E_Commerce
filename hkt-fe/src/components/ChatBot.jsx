// src/components/ChatBot.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ─────────────────────────────────────────────
   Inline style constants  (đồng bộ Home/Contact)
───────────────────────────────────────────── */
const C = {
  bg:        "#faf9f7",
  bgWhite:   "#fff",
  border:    "#e8e4df",
  dark:      "#1a1a1a",
  darkHover: "#333",
  muted:     "#888",
  subtle:    "#f0ece6",
  serif:     "'Georgia', 'Times New Roman', serif",
  sans:      "sans-serif",
};

const btn = (active = true) => ({
  padding:         "10px 20px",
  background:      active ? C.dark : "transparent",
  color:           active ? C.bg : C.dark,
  border:          `1px solid ${C.dark}`,
  borderRadius:    0,
  cursor:          "pointer",
  fontFamily:      C.sans,
  fontSize:        "0.68rem",
  letterSpacing:   "0.18em",
  textTransform:   "uppercase",
  transition:      "background 0.2s, color 0.2s",
  display:         "inline-flex",
  alignItems:      "center",
  gap:             6,
  whiteSpace:      "nowrap",
});

const ghostBtn = {
  ...btn(false),
  width:    "100%",
  padding:  "11px 16px",
  justifyContent: "center",
};

/* ─────────────────────────────────────────────
   ChatBot component
───────────────────────────────────────────── */
const ChatBot = () => {
  const [chatOpen, setChatOpen]       = useState(false);
  const navigate                      = useNavigate();
  const [messages, setMessages]       = useState([
    {
      sender: "bot",
      text:   "Xin chào! Mình là trợ lý mua sắm đây. Bạn đang tìm sản phẩm nào hôm nay?",
    },
  ]);
  const messagesRef = useRef([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const [input,       setInput]       = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef                = useRef(null);

  /* ── hover state for buttons ── */
  const [hovered, setHovered] = useState({});
  const onEnter = (k) => setHovered((p) => ({ ...p, [k]: true }));
  const onLeave = (k) => setHovered((p) => ({ ...p, [k]: false }));

  /* ── Persist chat history ── */
  useEffect(() => {
    const saved = localStorage.getItem("kh3t_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 1 || (parsed.length === 1 && parsed[0].sender === "user")) {
          setMessages(parsed);
        }
      } catch (e) { console.error("Lỗi parse chat history:", e); }
    }
  }, []);

  useEffect(() => {
    const hasReal = messages.length > 1 || (messages.length === 1 && messages[0].sender === "user");
    if (hasReal) localStorage.setItem("kh3t_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("kh3t_chat_history");
      setMessages([{ sender: "bot", text: "Xin chào! Mình là trợ lý mua sắm đây. Bạn đang tìm sản phẩm nào hôm nay?" }]);
    };
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  /* ── Helpers ── */
  const formatVND = (amount) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  const getToken  = () => localStorage.getItem("accessToken");
  const getUserId = () => {
    try { const u = localStorage.getItem("user"); return u ? JSON.parse(u).id : null; }
    catch { return null; }
  };

  /* ── Send message ── */
  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setChatLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/chat/ask`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body:    JSON.stringify({ prompt: userMessage }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        (() => {
          const msgId = Date.now() + Math.random();
          return {
            sender:            "bot",
            msgId,
            text:              data.message || "Dạ em chưa hiểu lắm ạ!",
            suggestedProducts: data.suggestedProducts || [],
            compareIds:        data.compareIds  || null,
            cartAction:        data.cartAction  ? { ...data.cartAction,  msgId } : null,
            buyAction:         data.buyAction   ? { ...data.buyAction,   msgId } : null,
          };
        })(),
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Oops! Có lỗi kết nối rồi, thử lại sau ít phút nhé!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ── BUY_NOW Step 1 ── */
  const handleSelectPayment = async (msgIndex, paymentMethod) => {
    const token = getToken();
    if (!token) { toast.warning("Anh/chị vui lòng đăng nhập trước nhé! 🔐"); return; }
    const currentBuyAction = messagesRef.current[msgIndex]?.buyAction;
    setMessages((prev) =>
        prev.map((m, idx) =>
            idx === msgIndex && m.buyAction
                ? { ...m, buyAction: { ...m.buyAction, selectedPayment: paymentMethod, loadingAddress: true } }
                : m,
        ),
    );
    try {
      const res = await fetch(`${BASE_URL}/chat/order/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const t = await res.text(); throw new Error(`HTTP ${res.status}: ${t}`); }
      const data      = await res.json();
      if (data.error) throw new Error(data.error);
      const addresses = data.addresses || data.result || [];
      if (addresses.length === 0) {
        setMessages((prev) =>
            prev.map((m, idx) =>
                idx === msgIndex && m.buyAction
                    ? { ...m, buyAction: { ...m.buyAction, loadingAddress: false, confirmed: true } }
                    : m,
            ),
        );
        setMessages((prev) => [...prev, { sender: "bot", text: "Anh/chị chưa có địa chỉ nào được lưu 😔 Em sẽ chuyển sang trang Checkout để anh/chị nhập địa chỉ nhé!" }]);
        setTimeout(() => {
          navigate("/checkout", {
            state: { userId: getUserId(), product: currentBuyAction?.productInfo, quantity: currentBuyAction?.quantity, sizeDetailId: currentBuyAction?.sizeDetailId, defaultPayment: paymentMethod },
          });
        }, 1000);
        return;
      }
      setMessages((prev) =>
          prev.map((m, idx) =>
              idx === msgIndex && m.buyAction
                  ? { ...m, buyAction: { ...m.buyAction, loadingAddress: false, addresses, selectedPayment: paymentMethod } }
                  : m,
          ),
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
          prev.map((m, idx) =>
              idx === msgIndex && m.buyAction ? { ...m, buyAction: { ...m.buyAction, loadingAddress: false } } : m,
          ),
      );
      toast.error("Lỗi lấy danh sách địa chỉ 😔");
    }
  };

  /* ── BUY_NOW Step 2 ── */
  const handleConfirmOrder = async (msgIndex, addressId) => {
    const token     = getToken();
    if (!token) return;
    const buyAction = messagesRef.current[msgIndex]?.buyAction;
    if (!buyAction) { toast.error("Không tìm thấy thông tin đơn hàng 😔"); return; }
    setMessages((prev) =>
        prev.map((m, idx) =>
            idx === msgIndex && m.buyAction
                ? { ...m, buyAction: { ...m.buyAction, selectedAddressId: addressId, confirming: true } }
                : m,
        ),
    );
    try {
      const body = {
        productId: buyAction.productId, productName: buyAction.productName,
        sizeDetailId: buyAction.sizeDetailId, quantity: buyAction.quantity,
        price: buyAction.price, addressId, paymentMethod: buyAction.selectedPayment, note: "",
      };
      const res  = await fetch(`${BASE_URL}/chat/order/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:   JSON.stringify(body),
      });
      const data = await res.json();
      setMessages((prev) =>
          prev.map((m, idx) =>
              idx === msgIndex && m.buyAction
                  ? { ...m, buyAction: { ...m.buyAction, confirmed: true, confirming: false } }
                  : m,
          ),
      );
      if (!data.success) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.message || "Đặt hàng thất bại ạ 😔" }]);
        return;
      }
      toast.success("Đặt hàng thành công! 🎉");
      setMessages((prev) => [...prev, { sender: "bot", text: data.message }]);
      if (data.paymentMethod === "bank" && data.paymentInfo) {
        sessionStorage.setItem("paymentInfo", JSON.stringify(data.paymentInfo));
        setTimeout(() => navigate("/payment"), 1000);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
          prev.map((m, idx) =>
              idx === msgIndex && m.buyAction ? { ...m, buyAction: { ...m.buyAction, confirming: false } } : m,
          ),
      );
      setMessages((prev) => [...prev, { sender: "bot", text: "Có lỗi khi đặt hàng 😔 Anh/chị thử lại nhé!" }]);
    }
  };

  /* ── Cart action ── */
  const handleCartAction = async (cartAction) => {
    if (cartAction.loading || cartAction.confirmed) return;
    setMessages((prev) =>
        prev.map((m) =>
            m.cartAction?.msgId === cartAction.msgId ? { ...m, cartAction: { ...m.cartAction, loading: true } } : m,
        ),
    );
    try {
      const token    = getToken();
      let endpoint   = "";
      let body       = {};
      if (cartAction.type === "ADD_TO_CART") {
        endpoint = `${BASE_URL}/chat/cart/confirm-add`;
        body     = { productId: cartAction.productId, sizeDetailId: cartAction.sizeDetailId, quantity: cartAction.quantity };
      }
      if (cartAction.type === "REMOVE_FROM_CART") {
        endpoint = `${BASE_URL}/chat/cart/confirm-remove`;
        body     = { cartDetailId: cartAction.cartDetailId };
      }
      const res = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((prev) =>
          prev.map((m) =>
              m.cartAction?.msgId === cartAction.msgId
                  ? { ...m, cartAction: { ...m.cartAction, confirmed: true, loading: false } }
                  : m,
          ),
      );
      setMessages((prev) => [...prev, { sender: "bot", text: data.message || "Thao tác thành công 🎉" }]);
      toast.success(
          cartAction.type === "ADD_TO_CART"
              ? `Đã thêm ${cartAction.productName} vào giỏ hàng! 🛒`
              : `Đã xóa sản phẩm khỏi giỏ hàng! 🗑️`,
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
          prev.map((m) =>
              m.cartAction?.msgId === cartAction.msgId ? { ...m, cartAction: { ...m.cartAction, loading: false } } : m,
          ),
      );
      setMessages((prev) => [...prev, { sender: "bot", text: "Có lỗi khi xử lý giỏ hàng 😔" }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ──────────────────────────────────────────
     Render BUY action UI
  ────────────────────────────────────────── */
  const renderBuyAction = (buyAction, msgIndex) => {
    if (!buyAction) return null;

    if (buyAction.confirmed) {
      return (
          <div style={{
            marginTop: 8, padding: "8px 12px",
            border: `1px solid ${C.border}`, background: C.subtle,
            fontSize: "0.72rem", letterSpacing: "0.08em",
            textTransform: "uppercase", color: C.dark, textAlign: "center",
          }}>
            {buyAction.confirming ? "Đang xử lý đơn hàng..." : "Đơn hàng đã được xử lý"}
          </div>
      );
    }

    const summary = (
        <div style={{
          marginTop: 8, padding: "10px 14px",
          border: `1px solid ${C.border}`, background: C.bgWhite,
          fontSize: "0.78rem", lineHeight: 1.6, color: C.dark,
        }}>
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>
            Đơn hàng
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ fontFamily: C.serif, fontWeight: 400 }}>{buyAction.productName}</strong>
            {" "}· Size {buyAction.size} · SL: {buyAction.quantity}
          </p>
          <p style={{ margin: "4px 0 0", fontWeight: 600, fontSize: "0.88rem" }}>
            {formatVND(buyAction.price * buyAction.quantity + 30000)}
            <span style={{ fontSize: "0.7rem", fontWeight: 400, color: C.muted, marginLeft: 6 }}>(gồm ship 30k)</span>
          </p>
        </div>
    );

    /* Step 1: chọn payment */
    if (!buyAction.selectedPayment) {
      return (
          <>
            {summary}
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginTop: 10, marginBottom: 6 }}>
              Phương thức thanh toán
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["cash", "bank"].map((method) => {
                const key   = `pay-${method}-${msgIndex}`;
                const label = method === "cash" ? "Tiền mặt" : "Chuyển khoản";
                const isHov = hovered[key];
                return (
                    <button
                        key={method}
                        onClick={() => handleSelectPayment(msgIndex, method)}
                        onMouseEnter={() => onEnter(key)}
                        onMouseLeave={() => onLeave(key)}
                        style={{ ...ghostBtn, flex: 1, background: isHov ? C.dark : "transparent", color: isHov ? C.bg : C.dark }}
                    >
                      {label}
                    </button>
                );
              })}
            </div>
          </>
      );
    }

    /* Loading địa chỉ */
    if (buyAction.loadingAddress) {
      return (
          <>
            {summary}
            <p style={{ fontSize: "0.72rem", color: C.muted, textAlign: "center", marginTop: 10, letterSpacing: "0.1em" }}>
              Đang tải địa chỉ...
            </p>
          </>
      );
    }

    /* Step 2: chọn địa chỉ */
    if (buyAction.addresses && !buyAction.selectedAddressId) {
      const payLabel = buyAction.selectedPayment === "bank" ? "Chuyển khoản" : "Tiền mặt";
      return (
          <>
            {summary}
            <div style={{
              marginTop: 8, padding: "6px 10px",
              border: `1px solid ${C.border}`, background: C.subtle,
              fontSize: "0.65rem", letterSpacing: "0.15em",
              textTransform: "uppercase", color: C.dark,
            }}>
              Thanh toán: {payLabel}
            </div>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginTop: 10, marginBottom: 6 }}>
              Địa chỉ giao hàng
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
              {buyAction.addresses.map((addr) => {
                const key   = `addr-${addr.id}`;
                const isHov = hovered[key];
                return (
                    <button
                        key={addr.id}
                        onClick={() => handleConfirmOrder(msgIndex, addr.id)}
                        disabled={buyAction.confirming}
                        onMouseEnter={() => onEnter(key)}
                        onMouseLeave={() => onLeave(key)}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 12px",
                          background: isHov ? C.subtle : C.bgWhite,
                          border: `1px solid ${isHov ? C.dark : C.border}`,
                          cursor: "pointer", fontSize: "0.78rem", color: C.dark,
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                    >
                      <p style={{ margin: 0, fontFamily: C.serif, fontWeight: 400 }}>{addr.delivery_address}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: C.muted }}>{addr.province}</p>
                    </button>
                );
              })}
            </div>
          </>
      );
    }

    /* Confirming */
    if (buyAction.confirming) {
      return (
          <>
            {summary}
            <p style={{ fontSize: "0.72rem", color: C.muted, textAlign: "center", marginTop: 10, letterSpacing: "0.1em" }}>
              Đang đặt hàng...
            </p>
          </>
      );
    }

    return null;
  };

  /* ──────────────────────────────────────────
     Main render
  ────────────────────────────────────────── */
  return (
      <>
        <style>{`
        @keyframes chatBounce {
          0%,80%,100% { transform: translateY(0); }
          40%          { transform: translateY(-5px); }
        }
        .chat-dot { animation: chatBounce 1.2s infinite; }
        .chat-dot:nth-child(2) { animation-delay: 0.2s; }
        .chat-dot:nth-child(3) { animation-delay: 0.4s; }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: ${C.border}; }
      `}</style>

        {/* ── Toggle button ── */}
        <button
            onClick={() => {
              setChatOpen(!chatOpen);
              window.dispatchEvent(new Event(chatOpen ? "chatbotClosed" : "chatbotOpened"));
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.darkHover; e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.dark;      e.currentTarget.style.transform = "scale(1)"; }}
            style={{
              position:   "fixed", bottom: 24, right: 24, zIndex: 50,
              width: 56, height: 56, borderRadius: 0,
              background: C.dark, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.bg,
              boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
              transition: "background 0.25s, transform 0.25s",
            }}
            aria-label={chatOpen ? "Đóng chat" : "Mở chat"}
        >
          {chatOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
              </svg>
          ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2v3l-3-3H9a2 2 0 0 1-2-2v-1" />
                <path strokeLinecap="square" strokeLinejoin="miter" d="M3 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3 3v-3H5a2 2 0 0 1-2-2V6z" />
              </svg>
          )}
        </button>

        {/* ── Chat window ── */}
        {chatOpen && (
            <div style={{
              position:   "fixed", right: 24, bottom: 90, zIndex: 50,
              width:      380,
              background: C.bg,
              border:     `1px solid ${C.border}`,
              display:    "flex", flexDirection: "column",
              boxShadow:  "0 8px 40px rgba(0,0,0,0.12)",
              fontFamily: C.sans,
            }}>

              {/* Header */}
              <div style={{
                background: C.dark, color: C.bg,
                padding:    "14px 20px",
                display:    "flex", alignItems: "center", gap: 12,
                flexShrink: 0,
              }}>
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  overflow: "hidden", border: `1px solid #444`,
                }}>
                  <img
                      src="https://i.fbcd.co/products/resized/resized-750-500/820fc47f335cb00aa55022f9e6cb249e4749388f0cd980f7494de817125628ad.jpg"
                      alt="Trợ lý"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <p style={{ fontFamily: C.serif, fontSize: "0.9rem", fontWeight: 400, margin: 0, color: C.bg }}>
                    Trợ lý mua sắm
                  </p>
                  <p style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>
                    Luôn online · Hỗ trợ 24/7
                  </p>
                </div>
                <button
                    onClick={() => { setChatOpen(false); window.dispatchEvent(new Event("chatbotClosed")); }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                    style={{
                      marginLeft: "auto", background: "none", border: "none",
                      cursor: "pointer", color: "rgba(255,255,255,0.45)",
                      display: "flex", alignItems: "center", padding: 4,
                      transition: "color 0.2s",
                    }}
                    aria-label="Đóng"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div
                  className="chat-messages"
                  style={{
                    flex:       1, overflowY: "auto",
                    padding:    "20px 16px",
                    background: C.bg,
                    display:    "flex", flexDirection: "column", gap: 12,
                    minHeight:  320, maxHeight: 420,
                  }}
              >
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                      {msg.sender === "user" ? (
                          /* User bubble */
                          <div style={{
                            background:  C.dark, color: C.bg,
                            padding:     "10px 14px",
                            fontSize:    "0.82rem", lineHeight: 1.6,
                            maxWidth:    "80%",
                          }}>
                            {msg.text}
                          </div>
                      ) : (
                          /* Bot bubble */
                          <div style={{ maxWidth: "88%" }}>
                            <div style={{
                              background:  C.bgWhite,
                              border:      `1px solid ${C.border}`,
                              padding:     "10px 14px",
                              fontSize:    "0.82rem", lineHeight: 1.6,
                              color:       C.dark,
                              whiteSpace:  "pre-wrap",
                            }}>
                              {msg.text}
                            </div>

                            {/* Suggested products */}
                            {msg.suggestedProducts?.length > 0 && (
                                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                                  {msg.suggestedProducts.map((product) => {
                                    const k   = `prod-${product.id}-${i}`;
                                    const isH = hovered[k];
                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            onMouseEnter={() => onEnter(k)}
                                            onMouseLeave={() => onLeave(k)}
                                            style={{
                                              display: "flex", alignItems: "center", justifyContent: "space-between",
                                              padding: "10px 14px", cursor: "pointer",
                                              background:   isH ? C.subtle : C.bgWhite,
                                              border:       `1px solid ${isH ? C.dark : C.border}`,
                                              color:        C.dark,
                                              transition:   "border-color 0.2s, background 0.2s",
                                              textAlign:    "left",
                                            }}
                                        >
                                          <div>
                                            <p style={{ fontFamily: C.serif, fontSize: "0.82rem", fontWeight: 400, margin: 0 }}>
                                              {product.name}
                                            </p>
                                            <p style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "3px 0 0" }}>
                                              Xem chi tiết
                                            </p>
                                          </div>
                                          <svg width="14" height="14" fill="none" stroke={C.dark} viewBox="0 0 24 24" strokeWidth={1.5}>
                                            <path strokeLinecap="square" d="M9 18l6-6-6-6" />
                                          </svg>
                                        </button>
                                    );
                                  })}
                                </div>
                            )}

                            {/* BUY_NOW UI */}
                            {renderBuyAction(msg.buyAction, i)}

                            {/* Cart action */}
                            {msg.cartAction && !msg.cartAction.confirmed && (
                                <div style={{ marginTop: 8 }}>
                                  {msg.cartAction.loading ? (
                                      <div style={{ fontSize: "0.72rem", color: C.muted, textAlign: "center", letterSpacing: "0.1em" }}>
                                        Đang xử lý...
                                      </div>
                                  ) : (() => {
                                    const k   = `cart-${msg.cartAction.msgId}`;
                                    const isH = hovered[k];
                                    return (
                                        <button
                                            onClick={() => handleCartAction(msg.cartAction)}
                                            onMouseEnter={() => onEnter(k)}
                                            onMouseLeave={() => onLeave(k)}
                                            style={{
                                              ...ghostBtn,
                                              background: isH ? C.dark : "transparent",
                                              color:      isH ? C.bg : C.dark,
                                            }}
                                        >
                                          {msg.cartAction.type === "ADD_TO_CART" ? "Xác nhận thêm vào giỏ" : "Xác nhận xóa khỏi giỏ"}
                                        </button>
                                    );
                                  })()}
                                </div>
                            )}

                            {/* Cart confirmed */}
                            {msg.cartAction?.confirmed && (
                                <div style={{
                                  marginTop: 8, padding: "8px 12px",
                                  border: `1px solid ${C.border}`, background: C.subtle,
                                  fontSize: "0.72rem", letterSpacing: "0.08em",
                                  textTransform: "uppercase", color: C.dark, textAlign: "center",
                                }}>
                                  Đã thực hiện
                                </div>
                            )}

                            {/* Compare */}
                            {msg.compareIds?.length >= 2 && (() => {
                              const k   = `cmp-${i}`;
                              const isH = hovered[k];
                              return (
                                  <button
                                      onClick={() => navigate(`/compare?ids=${msg.compareIds.join(",")}`)}
                                      onMouseEnter={() => onEnter(k)}
                                      onMouseLeave={() => onLeave(k)}
                                      style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "10px 14px", cursor: "pointer", marginTop: 8, width: "100%",
                                        background:  isH ? C.subtle : C.bgWhite,
                                        border:      `1px solid ${isH ? C.dark : C.border}`,
                                        color:       C.dark,
                                        transition:  "border-color 0.2s, background 0.2s",
                                        textAlign:   "left",
                                      }}
                                  >
                                    <div>
                                      <p style={{ fontFamily: C.serif, fontSize: "0.82rem", fontWeight: 400, margin: 0 }}>
                                        So sánh {msg.compareIds.length} sản phẩm
                                      </p>
                                      <p style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "3px 0 0" }}>
                                        Bảng chi tiết form, chất liệu, giá, size
                                      </p>
                                    </div>
                                    <svg width="14" height="14" fill="none" stroke={C.dark} viewBox="0 0 24 24" strokeWidth={1.5}>
                                      <path strokeLinecap="square" d="M9 18l6-6-6-6" />
                                    </svg>
                                  </button>
                              );
                            })()}
                          </div>
                      )}
                    </div>
                ))}

                {/* Typing indicator */}
                {chatLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{
                        background: C.bgWhite, border: `1px solid ${C.border}`,
                        padding: "12px 16px", display: "flex", gap: 5, alignItems: "center",
                      }}>
                        {[0, 1, 2].map((n) => (
                            <span
                                key={n}
                                className="chat-dot"
                                style={{
                                  width: 5, height: 5, background: "#bbb",
                                  borderRadius: "50%", display: "inline-block",
                                  animationDelay: `${n * 0.2}s`,
                                }}
                            />
                        ))}
                      </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding:    "14px 16px",
                borderTop:  `1px solid ${C.border}`,
                background: C.bg,
                display:    "flex", gap: 8, alignItems: "center",
                flexShrink: 0,
              }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập câu hỏi của bạn..."
                    disabled={chatLoading}
                    style={{
                      flex:        1, padding: "10px 14px",
                      border:      `1px solid ${C.border}`,
                      background:  C.bgWhite,
                      fontSize:    "0.8rem", color: C.dark,
                      fontFamily:  C.sans,
                      outline:     "none",
                      transition:  "border-color 0.2s",
                    }}
                    onFocus={(e)  => { e.target.style.borderColor = C.dark; }}
                    onBlur={(e)   => { e.target.style.borderColor = C.border; }}
                />
                <button
                    onClick={sendMessage}
                    disabled={chatLoading || !input.trim()}
                    onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = C.darkHover; }}
                    onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = C.dark; }}
                    style={{
                      padding:       "10px 18px",
                      background:    C.dark, color: C.bg,
                      border:        "none", cursor: "pointer",
                      fontFamily:    C.sans,
                      fontSize:      "0.68rem", letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      transition:    "background 0.2s",
                      opacity:       (chatLoading || !input.trim()) ? 0.4 : 1,
                      flexShrink:    0,
                    }}
                >
                  Gửi
                </button>
              </div>
            </div>
        )}
      </>
  );
};

export default ChatBot;
