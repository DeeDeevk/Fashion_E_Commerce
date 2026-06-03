// src/components/ChatBot.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  // ★ messagesRef luôn giữ giá trị messages mới nhất — dùng để đọc trong async handlers
  const messagesRef = useRef([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ── Persist chat history qua F5 ─────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("kh3t_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 1 || (parsed.length === 1 && parsed[0].sender === "user")) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Lỗi parse chat history:", e);
      }
    }
  }, []);

  useEffect(() => {
    const hasRealMessage =
        messages.length > 1 || (messages.length === 1 && messages[0].sender === "user");
    if (hasRealMessage) {
      localStorage.setItem("kh3t_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("kh3t_chat_history");
      setMessages([{
        sender: "bot",
        text: "Xin chào! Mình là trợ lý mua sắm đây. Bạn đang tìm sản phẩm nào hôm nay?",
      }]);
    };
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatLoading]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatVND = (amount) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const getToken = () => localStorage.getItem("accessToken");

  const getUserId = () => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u).id : null;
    } catch { return null; }
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setChatLoading(true);

    try {
      const token = getToken();
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
        (() => {
          const msgId = Date.now() + Math.random();
          return {
            sender: "bot",
            msgId,
            text: data.message || "Dạ em chưa hiểu lắm ạ!",
            suggestedProducts: data.suggestedProducts || [],
            compareIds:        data.compareIds  || null,
            cartAction:        data.cartAction  ? { ...data.cartAction,  msgId } : null,
            buyAction:         data.buyAction   ? { ...data.buyAction,   msgId } : null,
          };
        })(),
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Có lỗi kết nối rồi, thử lại sau ít phút nhé!" },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── BUY_NOW Step 1: user click nút chọn payment ──────────────────────────
  // → Fetch địa chỉ → hiển thị danh sách để user chọn
  const handleSelectPayment = async (msgIndex, paymentMethod) => {
    const token = getToken();
    if (!token) {
      toast.warning("Anh/chị vui lòng đăng nhập trước nhé! 🔐");
      return;
    }

    // ★ Đọc buyAction snapshot TRƯỚC setMessages
    const currentBuyAction = messagesRef.current[msgIndex]?.buyAction;

    setMessages((prev) =>
        prev.map((m, idx) =>
            idx === msgIndex && m.buyAction
                ? { ...m, buyAction: { ...m.buyAction, selectedPayment: paymentMethod, loadingAddress: true } }
                : m,
        ),
    );

    try {
      console.log("[ChatBot] Fetching addresses from:", `${BASE_URL}/chat/order/addresses`);
      const res = await fetch(`${BASE_URL}/chat/order/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("[ChatBot] Address response status:", res.status);

      // Reset loadingAddress nếu BE lỗi HTTP
      if (!res.ok) {
        const errText = await res.text();
        console.error("[ChatBot] Address fetch HTTP error:", res.status, errText);
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      console.log("[ChatBot] Address data:", data);

      if (data.error) throw new Error(data.error);

      // BE có thể trả { addresses: [...] } hoặc { result: [...] } tuỳ service
      const addresses = data.addresses || data.result || [];

      if (addresses.length === 0) {
        // Không có địa chỉ → báo lỗi, navigate checkout
        setMessages((prev) =>
            prev.map((m, idx) =>
                idx === msgIndex && m.buyAction
                    ? { ...m, buyAction: { ...m.buyAction, loadingAddress: false, confirmed: true } }
                    : m,
            ),
        );
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Anh/chị chưa có địa chỉ nào được lưu 😔 Em sẽ chuyển sang trang Checkout để anh/chị nhập địa chỉ nhé!",
          },
        ]);
        setTimeout(() => {
          navigate("/checkout", {
            state: {
              userId:         getUserId(),
              product:        currentBuyAction?.productInfo,
              quantity:       currentBuyAction?.quantity,
              sizeDetailId:   currentBuyAction?.sizeDetailId,
              defaultPayment: paymentMethod,
            },
          });
        }, 1000);
        return;
      }

      // Có địa chỉ → gắn vào buyAction để render danh sách
      setMessages((prev) =>
          prev.map((m, idx) =>
              idx === msgIndex && m.buyAction
                  ? {
                    ...m,
                    buyAction: {
                      ...m.buyAction,
                      loadingAddress:  false,
                      addresses:       addresses,
                      selectedPayment: paymentMethod,
                    },
                  }
                  : m,
          ),
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
          prev.map((m, idx) =>
              idx === msgIndex && m.buyAction
                  ? { ...m, buyAction: { ...m.buyAction, loadingAddress: false } }
                  : m,
          ),
      );
      toast.error("Lỗi lấy danh sách địa chỉ 😔");
    }
  };

  // ── BUY_NOW Step 2: user chọn địa chỉ → gọi /chat/order/confirm ─────────
  const handleConfirmOrder = async (msgIndex, addressId) => {
    const token = getToken();
    if (!token) return;

    // ★ Đọc buyAction snapshot TRƯỚC khi setMessages (setMessages là async)
    const buyAction = messagesRef.current[msgIndex]?.buyAction;
    if (!buyAction) {
      toast.error("Không tìm thấy thông tin đơn hàng 😔");
      return;
    }

    // Mark confirming
    setMessages((prev) =>
        prev.map((m, idx) =>
            idx === msgIndex && m.buyAction
                ? { ...m, buyAction: { ...m.buyAction, selectedAddressId: addressId, confirming: true } }
                : m,
        ),
    );

    try {
      const body = {
        productId:     buyAction.productId,
        productName:   buyAction.productName,
        sizeDetailId:  buyAction.sizeDetailId,
        quantity:      buyAction.quantity,
        price:         buyAction.price,
        addressId:     addressId,
        paymentMethod: buyAction.selectedPayment,
        note:          "",
      };

      const res = await fetch(`${BASE_URL}/chat/order/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      // Đánh dấu toàn bộ buyAction đã xong
      setMessages((prev) =>
          prev.map((m, idx) =>
              idx === msgIndex && m.buyAction
                  ? { ...m, buyAction: { ...m.buyAction, confirmed: true, confirming: false } }
                  : m,
          ),
      );

      if (!data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.message || "Đặt hàng thất bại ạ 😔" },
        ]);
        return;
      }

      // Thành công
      toast.success("Đặt hàng thành công! 🎉");
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.message },
      ]);

      // Bank → navigate /payment (giống Checkout.jsx)
      if (data.paymentMethod === "bank" && data.paymentInfo) {
        sessionStorage.setItem("paymentInfo", JSON.stringify(data.paymentInfo));
        setTimeout(() => navigate("/payment"), 1000);
      }
      // Cash → ở lại, user đọc tin nhắn xác nhận

    } catch (err) {
      console.error(err);
      setMessages((prev) =>
          prev.map((m, idx) =>
              idx === msgIndex && m.buyAction
                  ? { ...m, buyAction: { ...m.buyAction, confirming: false } }
                  : m,
          ),
      );
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Có lỗi khi đặt hàng 😔 Anh/chị thử lại nhé!" },
      ]);
    }
  };

  // ── ADD/REMOVE cart action ────────────────────────────────────────────────
  const handleCartAction = async (cartAction) => {
    if (cartAction.loading || cartAction.confirmed) return;

    setMessages((prev) =>
        prev.map((m) =>
            m.cartAction?.msgId === cartAction.msgId
                ? { ...m, cartAction: { ...m.cartAction, loading: true } }
                : m,
        ),
    );

    try {
      const token = getToken();
      let endpoint = "";
      let body = {};

      if (cartAction.type === "ADD_TO_CART") {
        endpoint = `${BASE_URL}/chat/cart/confirm-add`;
        body = { productId: cartAction.productId, sizeDetailId: cartAction.sizeDetailId, quantity: cartAction.quantity };
      }
      if (cartAction.type === "REMOVE_FROM_CART") {
        endpoint = `${BASE_URL}/chat/cart/confirm-remove`;
        body = { cartDetailId: cartAction.cartDetailId };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
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
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.message || "Thao tác thành công 🎉" },
      ]);
      toast.success(
          cartAction.type === "ADD_TO_CART"
              ? `Đã thêm ${cartAction.productName} vào giỏ hàng! 🛒`
              : `Đã xóa sản phẩm khỏi giỏ hàng! 🗑️`,
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
          prev.map((m) =>
              m.cartAction?.msgId === cartAction.msgId
                  ? { ...m, cartAction: { ...m.cartAction, loading: false } }
                  : m,
          ),
      );
      setMessages((prev) => [...prev, { sender: "bot", text: "Có lỗi khi xử lý giỏ hàng 😔" }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Render BuyAction UI ───────────────────────────────────────────────────
  const renderBuyAction = (buyAction, msgIndex) => {
    if (!buyAction || buyAction.confirmed) {
      if (buyAction?.confirmed) {
        return (
            <div className="mt-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700 font-medium">
              ✅ {buyAction.confirming ? "Đang xử lý đơn hàng..." : "Đơn hàng đã được xử lý!"}
            </div>
        );
      }
      return null;
    }

    // Order summary luôn hiển thị
    const summary = (
        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-sm">
          <p className="font-semibold text-amber-800">🛍️ Đơn hàng:</p>
          <p className="text-gray-700 mt-1">
            <span className="font-medium">{buyAction.productName}</span>
            {" "}· Size {buyAction.size} · SL: {buyAction.quantity}
          </p>
          <p className="text-red-600 font-bold mt-1">
            {formatVND(buyAction.price * buyAction.quantity + 30000)}
            <span className="text-xs font-normal text-gray-500 ml-1">(gồm ship 30k)</span>
          </p>
        </div>
    );

    // Step 1: Chọn payment method
    if (!buyAction.selectedPayment) {
      return (
          <>
            {summary}
            <p className="text-xs text-gray-500 text-center mt-2">Chọn phương thức thanh toán:</p>
            <div className="flex gap-2 mt-1">
              <button
                  onClick={() => handleSelectPayment(msgIndex, "cash")}
                  className="flex-1 py-3 px-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-all"
              >
                💵 Tiền mặt
              </button>
              <button
                  onClick={() => handleSelectPayment(msgIndex, "bank")}
                  className="flex-1 py-3 px-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all"
              >
                📱 Chuyển khoản
              </button>
            </div>
          </>
      );
    }

    // Loading địa chỉ
    if (buyAction.loadingAddress) {
      return (
          <>
            {summary}
            <div className="mt-2 text-sm text-gray-500 text-center animate-pulse">
              Đang tải địa chỉ...
            </div>
          </>
      );
    }

    // Step 2: Chọn địa chỉ
    if (buyAction.addresses && !buyAction.selectedAddressId) {
      const paymentLabel = buyAction.selectedPayment === "bank" ? "📱 Chuyển khoản" : "💵 Tiền mặt";
      return (
          <>
            {summary}
            <div className="mt-2 px-2 py-1 bg-blue-50 rounded-lg text-xs text-blue-700 font-medium">
              Thanh toán: {paymentLabel}
            </div>
            <p className="text-xs text-gray-500 mt-2">Chọn địa chỉ giao hàng:</p>
            <div className="mt-1 space-y-2 max-h-48 overflow-y-auto">
              {buyAction.addresses.map((addr) => (
                  <button
                      key={addr.id}
                      onClick={() => handleConfirmOrder(msgIndex, addr.id)}
                      disabled={buyAction.confirming}
                      className="w-full text-left p-3 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-400 rounded-xl text-sm transition-all"
                  >
                    <p className="font-medium text-gray-800">{addr.delivery_address}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{addr.province}</p>
                  </button>
              ))}
            </div>
          </>
      );
    }

    // Confirming
    if (buyAction.confirming) {
      return (
          <>
            {summary}
            <div className="mt-2 text-sm text-gray-500 text-center animate-pulse">
              Đang đặt hàng...
            </div>
          </>
      );
    }

    return null;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
      <>
        {/* Nút nổi góc dưới phải */}
        <button
            onClick={() => {
              setChatOpen(!chatOpen);
              window.dispatchEvent(new Event(chatOpen ? "chatbotClosed" : "chatbotOpened"));
            }}
            className="group fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 ring-4 ring-white/50"
        >
          <div className="absolute inset-0 -z-10 rounded-full bg-red-600/60 blur-xl opacity-70 group-hover:opacity-100 transition duration-300" />
          {chatOpen ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          ) : (
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2v3l-3-3H9a2 2 0 0 1-2-2v-1" />
                <path d="M3 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3 3v-3H5a2 2 0 0 1-2-2V6z" />
                <circle cx="9" cy="9" r="1" />
                <circle cx="13" cy="9" r="1" />
              </svg>
          )}
        </button>

        {/* Cửa sổ chat */}
        {chatOpen && (
            <div className="fixed right-6 bottom-24 z-50 w-96 h-120 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full overflow-hidden border-2 border-white shadow-lg">
                  <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPJteM29wDFaITjbx1jOkFsIPRa6JKw-508w&s"
                      alt="Trợ lý"
                      className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">Trợ lý mua sắm</h3>
                  <p className="text-xs opacity-90">Luôn online • Hỗ trợ 24/7</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.sender === "user" ? (
                          <div className="max-w-xs px-4 py-3 rounded-2xl bg-red-500 text-white rounded-tr-none">
                            {msg.text}
                          </div>
                      ) : (
                          <div className="max-w-lg">
                            {/* Text */}
                            <div className="px-4 py-3 bg-white rounded-2xl shadow rounded-tl-none whitespace-pre-wrap">
                              {msg.text}
                            </div>

                            {/* Suggested products */}
                            {msg.suggestedProducts?.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {msg.suggestedProducts.map((product) => (
                                      <button
                                          key={product.id}
                                          onClick={() => navigate(`/product/${product.id}`)}
                                          className="block w-full p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 hover:border-red-400 hover:shadow-lg transition-all transform hover:scale-105 text-left"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="font-semibold text-red-700">Xem ngay: {product.name}</p>
                                            <p className="text-xs text-gray-600 mt-1">Click để xem chi tiết sản phẩm</p>
                                          </div>
                                          <span className="text-2xl ml-3">→</span>
                                        </div>
                                      </button>
                                  ))}
                                </div>
                            )}

                            {/* ★ BUY_NOW UI */}
                            {renderBuyAction(msg.buyAction, i)}

                            {/* ADD/REMOVE cart */}
                            {msg.cartAction && !msg.cartAction.confirmed && !msg.cartAction.loading && (
                                <div className="mt-3">
                                  <button
                                      onClick={() => handleCartAction(msg.cartAction)}
                                      className="w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
                                  >
                                    {msg.cartAction.type === "ADD_TO_CART"
                                        ? "🛒 Xác nhận thêm vào giỏ"
                                        : "🗑️ Xác nhận xóa khỏi giỏ"}
                                  </button>
                                </div>
                            )}

                            {/* Compare */}
                            {msg.compareIds?.length >= 2 && (
                                <div className="mt-3">
                                  <button
                                      onClick={() => navigate(`/compare?ids=${msg.compareIds.join(",")}`)}
                                      className="block w-full p-4 bg-red-50 rounded-xl border border-red-200 hover:border-red-400 hover:shadow-lg transition-all transform hover:scale-105 text-left"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-semibold text-red-700">
                                          So sánh {msg.compareIds.length} sản phẩm
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          Bảng so sánh chi tiết form, chất liệu, giá, size...
                                        </p>
                                      </div>
                                      <span className="text-2xl ml-3">→</span>
                                    </div>
                                  </button>
                                </div>
                            )}
                          </div>
                      )}
                    </div>
                ))}

                {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-3 rounded-2xl shadow rounded-tl-none">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Nhập câu hỏi của bạn..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-red-500"
                      disabled={chatLoading}
                  />
                  <button
                      onClick={sendMessage}
                      disabled={chatLoading || !input.trim()}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );
};

export default ChatBot;