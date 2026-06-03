// src/components/ChatBot.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X, Send, ChevronRight } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChatBot = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Mình là trợ lý mua sắm đây. Bạn đang tìm sản phẩm nào hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("kh3t_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.length > 1 ||
          (parsed.length === 1 && parsed[0].sender === "user")
        ) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Lỗi parse chat history:", e);
      }
    }
  }, []);

  useEffect(() => {
    const hasRealMessage =
      messages.length > 1 ||
      (messages.length === 1 && messages[0].sender === "user");
    if (hasRealMessage) {
      localStorage.setItem("kh3t_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("kh3t_chat_history");
      setMessages([
        {
          sender: "bot",
          text: "Xin chào! Mình là trợ lý mua sắm đây. Bạn đang tìm sản phẩm nào hôm nay?",
        },
      ]);
    };
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatLoading]);

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setChatLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.message || "Dạ em chưa hiểu lắm ạ!",
          suggestedProducts: data.suggestedProducts || [],
          compareIds: data.compareIds || null,
          cartAction: data.cartAction || null,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Oops! Có lỗi kết nối rồi, thử lại sau ít phút nhé!",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCartAction = async (cartAction) => {
    if (cartAction.loading || cartAction.confirmed) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.cartAction === cartAction
          ? { ...m, cartAction: { ...m.cartAction, loading: true } }
          : m,
      ),
    );

    try {
      const token = localStorage.getItem("accessToken");
      let endpoint = "";
      let body = {};

      if (cartAction.type === "ADD_TO_CART") {
        endpoint = `${BASE_URL}/chat/cart/confirm-add`;
        body = {
          productId: cartAction.productId,
          sizeDetailId: cartAction.sizeDetailId,
          quantity: cartAction.quantity,
        };
      }

      if (cartAction.type === "REMOVE_FROM_CART") {
        endpoint = `${BASE_URL}/chat/cart/confirm-remove`;
        body = { cartDetailId: cartAction.cartDetailId };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.cartAction === cartAction
            ? {
                ...m,
                cartAction: {
                  ...m.cartAction,
                  confirmed: true,
                  loading: false,
                },
              }
            : m,
        ),
      );
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.message || "Thao tác thành công!" },
      ]);

      const toastMsg =
        cartAction.type === "ADD_TO_CART"
          ? `Đã thêm ${cartAction.productName} vào giỏ hàng`
          : `Đã xóa sản phẩm khỏi giỏ hàng`;
      toast.success(toastMsg);
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.cartAction === cartAction
            ? { ...m, cartAction: { ...m.cartAction, loading: false } }
            : m,
        ),
      );
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Có lỗi khi xử lý giỏ hàng." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
        .chat-window {
          animation: fadeSlideUp 0.22s ease both;
        }
        .dot-1 { animation: dotBounce 1.2s ease infinite 0ms; }
        .dot-2 { animation: dotBounce 1.2s ease infinite 150ms; }
        .dot-3 { animation: dotBounce 1.2s ease infinite 300ms; }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: #e8e4df; }
      `}</style>

      {/* ── Toggle button ── */}
      <ToggleButton
        chatOpen={chatOpen}
        onClick={() => {
          setChatOpen(!chatOpen);
          window.dispatchEvent(
            new Event(chatOpen ? "chatbotClosed" : "chatbotOpened"),
          );
        }}
      />

      {/* ── Chat window ── */}
      {chatOpen && (
        <div
          className="chat-window"
          style={{
            position: "fixed",
            right: 24,
            bottom: 96,
            zIndex: 50,
            width: 380,
            height: 540,
            background: "#faf9f7",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
            fontFamily: "sans-serif",
            border: "1px solid #e8e4df",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid #e8e4df",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#faf9f7",
              flexShrink: 0,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.6rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#aaa",
                  margin: "0 0 3px",
                }}
              >
                Shopping Assistant
              </p>
              <h3
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "0.98rem",
                  fontWeight: 400,
                  margin: 0,
                  color: "#1a1a1a",
                }}
              >
                Trợ lý mua sắm
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Online dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#6bbd8e",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: "#aaa",
                    letterSpacing: "0.08em",
                  }}
                >
                  Online
                </span>
              </div>

              {/* Close */}
              <button
                onClick={() => {
                  setChatOpen(false);
                  window.dispatchEvent(new Event("chatbotClosed"));
                }}
                style={{
                  width: 28,
                  height: 28,
                  border: "1px solid #e8e4df",
                  background: "transparent",
                  color: "#888",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderRadius: 0,
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1a1a1a";
                  e.currentTarget.style.color = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e8e4df";
                  e.currentTarget.style.color = "#888";
                }}
              >
                <X size={13} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="chat-messages"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.sender === "user" ? (
                  <div
                    style={{
                      maxWidth: "72%",
                      padding: "10px 14px",
                      background: "#1a1a1a",
                      color: "#faf9f7",
                      fontSize: "0.8rem",
                      lineHeight: 1.6,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {msg.text}
                  </div>
                ) : (
                  <div style={{ maxWidth: "82%" }}>
                    {/* Bot bubble */}
                    <div
                      style={{
                        padding: "10px 14px",
                        background: "#fff",
                        border: "1px solid #e8e4df",
                        fontSize: "0.8rem",
                        lineHeight: 1.7,
                        color: "#333",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.text}
                    </div>

                    {/* Suggested products */}
                    {msg.suggestedProducts &&
                      msg.suggestedProducts.length > 0 && (
                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {msg.suggestedProducts.map((product) => (
                            <ProductChip
                              key={product.id}
                              name={product.name}
                              onClick={() => navigate(`/product/${product.id}`)}
                            />
                          ))}
                        </div>
                      )}

                    {/* Cart action */}
                    {msg.cartAction && !msg.cartAction.confirmed && (
                      <button
                        onClick={() => handleCartAction(msg.cartAction)}
                        disabled={msg.cartAction.loading}
                        style={{
                          marginTop: 8,
                          width: "100%",
                          padding: "10px 14px",
                          border: "1px solid #1a1a1a",
                          background: msg.cartAction.loading
                            ? "transparent"
                            : "#1a1a1a",
                          color: msg.cartAction.loading ? "#1a1a1a" : "#faf9f7",
                          fontSize: "0.65rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          cursor: msg.cartAction.loading
                            ? "not-allowed"
                            : "pointer",
                          fontFamily: "sans-serif",
                          transition: "background 0.2s, color 0.2s",
                          opacity: msg.cartAction.loading ? 0.5 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => {
                          if (!msg.cartAction.loading) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#1a1a1a";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!msg.cartAction.loading) {
                            e.currentTarget.style.background = "#1a1a1a";
                            e.currentTarget.style.color = "#faf9f7";
                          }
                        }}
                      >
                        {msg.cartAction.loading
                          ? "Đang xử lý..."
                          : msg.cartAction.type === "ADD_TO_CART"
                            ? "Xác nhận thêm vào giỏ"
                            : "Xác nhận xóa khỏi giỏ"}
                      </button>
                    )}

                    {/* Compare */}
                    {msg.compareIds && msg.compareIds.length >= 2 && (
                      <ProductChip
                        name={`So sánh ${msg.compareIds.length} sản phẩm`}
                        onClick={() =>
                          navigate(`/compare?ids=${msg.compareIds.join(",")}`)
                        }
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading dots */}
            {chatLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#fff",
                    border: "1px solid #e8e4df",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`dot-${n}`}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#c8c4bf",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid #e8e4df",
              background: "#faf9f7",
              flexShrink: 0,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập câu hỏi..."
              disabled={chatLoading}
              style={{
                flex: 1,
                padding: "9px 12px",
                border: "1px solid #e8e4df",
                borderBottom: "1px solid #1a1a1a",
                background: "transparent",
                fontSize: "0.78rem",
                color: "#1a1a1a",
                outline: "none",
                fontFamily: "sans-serif",
                borderRadius: 0,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
              onBlur={(e) =>
                (e.currentTarget.style.borderBottom = "1px solid #1a1a1a")
              }
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !input.trim()}
              title="Gửi"
              style={{
                width: 36,
                height: 36,
                border: "1px solid #1a1a1a",
                background:
                  input.trim() && !chatLoading ? "#1a1a1a" : "transparent",
                color: input.trim() && !chatLoading ? "#faf9f7" : "#ccc",
                borderColor:
                  input.trim() && !chatLoading ? "#1a1a1a" : "#e8e4df",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  input.trim() && !chatLoading ? "pointer" : "not-allowed",
                borderRadius: 0,
                flexShrink: 0,
                transition: "background 0.2s, color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !chatLoading) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1a1a1a";
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !chatLoading) {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.color = "#faf9f7";
                }
              }}
            >
              <Send size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ── Toggle button ──
function ToggleButton({ chatOpen, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 50,
        width: 48,
        height: 48,
        border: "1px solid #1a1a1a",
        background: hovered ? "transparent" : "#1a1a1a",
        color: hovered ? "#1a1a1a" : "#faf9f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        borderRadius: 0,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        transition: "background 0.2s, color 0.2s",
        fontFamily: "sans-serif",
      }}
      title={chatOpen ? "Đóng chat" : "Mở chat"}
    >
      {chatOpen ? (
        <X size={18} strokeWidth={1.5} />
      ) : (
        /* Chat bubble icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 10H6v-2h12v2zm0-4H6V6h12v2z" />
        </svg>
      )}
    </button>
  );
}

// ── Product / action chip ──
function ProductChip({ name, onClick, style: extraStyle }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "9px 12px",
        border: `1px solid ${hovered ? "#1a1a1a" : "#e8e4df"}`,
        background: hovered ? "#f5f3f0" : "#fff",
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color 0.2s, background 0.2s",
        fontFamily: "sans-serif",
        ...extraStyle,
      }}
    >
      <span
        style={{
          fontSize: "0.72rem",
          color: "#1a1a1a",
          letterSpacing: "0.02em",
          fontFamily: "'Georgia', serif",
        }}
      >
        {name}
      </span>
      <ChevronRight
        size={13}
        strokeWidth={1.5}
        style={{ color: "#aaa", flexShrink: 0 }}
      />
    </button>
  );
}

export default ChatBot;
