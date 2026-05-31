import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft } from "lucide-react";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const calculateSummary = (items) => {
  if (!Array.isArray(items))
    return {
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      total: 0,
      shippingText: "Not Yet",
      minFreeShipping: 1000000,
    };

  const selectedItems = items.filter((item) => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const minFreeShipping = 1000000;
  const standardShippingFee = 0;
  const discount = 0;
  const shippingFee = subtotal >= minFreeShipping ? 0 : standardShippingFee;
  const shippingText = subtotal >= minFreeShipping ? "Free" : "Not Yet";
  const total = subtotal - discount + shippingFee;

  return {
    subtotal,
    discount,
    shippingFee,
    total,
    shippingText,
    minFreeShipping,
  };
};

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [select, setSelect] = useState([]);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [cart, setCart] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/accounts/myinfor`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUser(data.result);
    } catch (error) {
      console.error("Lỗi fetch user", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/carts/account/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCart(data.result);
    } catch (error) {
      console.error("Lỗi fetch cart: ", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCart();
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      setCartItems(guestCart);
    }
  }, [user]);

  const hanldeFetchCart = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/cart-details/cart/${cart.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const items = Array.isArray(data)
        ? data
        : data.result || data.cartDetails || [];
      setCartItems(items);
    } catch (err) {
      console.error("Lỗi: ", err);
    }
  };

  const handleToggleSelect = async (cartDetailId) => {
    const updatedItems = cartItems.map((item) =>
      item.id === cartDetailId ? { ...item, selected: !item.selected } : item,
    );
    setCartItems(updatedItems);
    if (!user?.id) {
      localStorage.setItem("guestCart", JSON.stringify(updatedItems));
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${BASE_URL}/cart-details/${cartDetailId}/select`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selected: updatedItems.find((i) => i.id === cartDetailId).selected,
        }),
      });
    } catch (err) {
      console.error("Lỗi update select: ", err);
    }
  };

  useEffect(() => {
    const selectedItems = cartItems.filter((item) => item.selected);
    setSelect(selectedItems);
  }, [cartItems]);

  useEffect(() => {
    console.log("Select state đã cập nhật:", select);
  }, [select]);

  const handleToggleIncrease = async (
    cartDetailId,
    priceAtTime,
    currentQuantity,
    maxStock,
  ) => {
    const qty = Number(currentQuantity || 0);
    const stock = Number(maxStock || 0);
    if (maxStock !== undefined && maxStock !== null && qty >= stock) {
      toast.error(`Sản phẩm này chỉ còn tối đa ${stock} sản phẩm trong kho!`);
      return;
    }
    if (!user?.id) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      const updatedCart = guestCart.map((item) => {
        if (item.id === cartDetailId) {
          const newQty = Number(item.quantity) + 1;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.priceAtTime,
          };
        }
        return item;
      });
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/cart-details/${cartDetailId}/increase-quantity`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartDetailId ? { ...item, ...data } : item,
        ),
      );
      const resCart = await fetch(
        `${BASE_URL}/carts/update/${cart.id}/increase`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ price: priceAtTime, quantity: 1 }),
        },
      );
      if (resCart.ok) window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Lỗi tăng số lượng: ", err);
    }
  };

  const handleToggleDecrease = async (
    cartDetailId,
    priceAtTime,
    currentQuantity,
    subtotal,
  ) => {
    if (!user?.id) {
      if (currentQuantity <= 1) {
        if (
          window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")
        ) {
          handleDelete(cartDetailId, currentQuantity, subtotal);
        }
        return;
      }
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      const updatedCart = guestCart.map((item) => {
        if (item.id === cartDetailId) {
          const newQty = item.quantity - 1;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.priceAtTime,
          };
        }
        return item;
      });
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/cart-details/${cartDetailId}/decrease-quantity`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartDetailId ? { ...item, ...data } : item,
        ),
      );
      const resCart = await fetch(
        `${BASE_URL}/carts/update/${cart.id}/decrease`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ price: priceAtTime, quantity: 1 }),
        },
      );
      if (resCart.ok) window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Lỗi giảm số lượng: ", err);
    }
  };

  const handleDelete = async (cartDetailId, quantity, subtotal) => {
    if (!user?.id) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      const updatedCart = guestCart.filter((item) => item.id !== cartDetailId);
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/cart-details/delete/${cartDetailId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        setCartItems(cartItems.filter((item) => item.id !== cartDetailId));
        const resCart = await fetch(
          `${BASE_URL}/carts/update/${cart.id}/delete`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ price: subtotal, quantity: quantity }),
          },
        );
        if (resCart.ok) window.dispatchEvent(new Event("cartUpdated"));
      } else {
        console.error("Delete failed:", res.statusText);
      }
    } catch (err) {
      console.error("Lỗi update select: ", err);
    }
  };

  const [editingItemData, setEditingItemData] = useState({});

  const handleQuantityChange = (cartDetailId, value, maxStock) => {
    if (value === "") {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartDetailId ? { ...item, quantity: "" } : item,
        ),
      );
      return;
    }
    let parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) parsedValue = 0;
    const stockAvailable = maxStock || 0;
    if (parsedValue > stockAvailable) {
      toast.error(
        `Sản phẩm này chỉ còn tối đa ${stockAvailable} sản phẩm trong kho!`,
      );
      parsedValue = stockAvailable;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartDetailId
          ? {
              ...item,
              quantity: parsedValue,
              subtotal: parsedValue * item.priceAtTime,
            }
          : item,
      ),
    );
  };

  const handleBlurQuantity = async (item) => {
    let finalQty = parseInt(item.quantity, 10);
    if (isNaN(finalQty) || finalQty <= 0) {
      if (!user?.id) {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const updatedCart = guestCart.filter((i) => i.id !== item.id);
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        window.dispatchEvent(new Event("cartUpdated"));
        return;
      }
      if (
        window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")
      ) {
        const original = editingItemData[item.id] || {
          quantity: 1,
          subtotal: item.priceAtTime,
        };
        handleDelete(item.id, original.quantity, original.subtotal);
      } else {
        hanldeFetchCart();
      }
      return;
    }
    if (!user?.id) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      const updatedCart = guestCart.map((i) =>
        i.id === item.id
          ? { ...i, quantity: finalQty, subtotal: finalQty * i.priceAtTime }
          : i,
      );
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/cart-details/${item.id}/update-quantity`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: finalQty }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        hanldeFetchCart();
        if (user?.id) fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(data.message || "Không thể cập nhật số lượng");
        hanldeFetchCart();
      }
    } catch (err) {
      console.error("Lỗi cập nhật số lượng nhập tay: ", err);
      hanldeFetchCart();
    }
  };

  useEffect(() => {
    if (cart?.id) hanldeFetchCart();
  }, [cart]);

  const summary = calculateSummary(cartItems);

  const handleCheckout = () => {
    if (!user?.id) {
      toast.info("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) {
      toast.warning("Giỏ hàng rỗng!!!");
    } else if (select.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm muốn thanh toán!!!");
    } else {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      navigate("/checkout", {
        state: { userId: user.id, select: select, cartId: cart.id },
      });
    }
  };

  // ── Custom checkbox ──
  const Checkbox = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      style={{
        width: 18,
        height: 18,
        border: `1px solid ${checked ? "#1a1a1a" : "#ccc"}`,
        background: checked ? "#1a1a1a" : "transparent",
        borderRadius: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1.5 5L4 7.5L8.5 2.5"
            stroke="#faf9f7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf9f7",
        fontFamily: "sans-serif",
        color: "#1a1a1a",
      }}
    >
      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}
      >
        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#aaa",
              marginBottom: 10,
            }}
          >
            Your Selection
          </p>
          <h1
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 400,
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            Shopping Cart
          </h1>
          <div style={{ width: 48, height: 1, background: "#1a1a1a" }} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 48,
            alignItems: "start",
          }}
          className="cart-grid"
        >
          {/* ── LEFT: ITEMS ── */}
          <div>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #1a1a1a",
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#888",
              }}
            >
              <span>Item</span>
              <span style={{ textAlign: "center", minWidth: 110 }}>
                Quantity
              </span>
              <span style={{ textAlign: "right", minWidth: 100 }}>
                Subtotal
              </span>
              <span style={{ minWidth: 24 }} />
            </div>

            {/* Items */}
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: 16,
                    alignItems: "center",
                    padding: "24px 0",
                    borderBottom: "1px solid #e8e4df",
                  }}
                >
                  {/* Product info */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <Checkbox
                      checked={item.selected}
                      onChange={() => handleToggleSelect(item.id)}
                    />

                    <div
                      style={{
                        width: 80,
                        height: 100,
                        flexShrink: 0,
                        overflow: "hidden",
                        background: "#f0ece6",
                      }}
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "'Georgia', serif",
                          fontSize: "0.92rem",
                          fontWeight: 400,
                          margin: "0 0 6px",
                          color: "#1a1a1a",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.productName}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "#aaa",
                          margin: "0 0 3px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Size: {item.sizeName}
                      </p>
                      <p
                        style={{
                          fontSize: "0.68rem",
                          color: "#bbb",
                          margin: 0,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {item.stock ?? 0} in stock
                      </p>
                    </div>
                  </div>

                  {/* Quantity stepper */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      minWidth: 110,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #e8e4df",
                        background: "#fff",
                      }}
                    >
                      <button
                        onClick={() =>
                          handleToggleDecrease(
                            item.id,
                            item.priceAtTime,
                            item.quantity,
                            item.subtotal,
                          )
                        }
                        style={{
                          width: 32,
                          height: 32,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "1rem",
                          color: "#888",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f0ece6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        −
                      </button>

                      <input
                        type="number"
                        value={item.quantity}
                        min="0"
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            e.target.value,
                            item.stock,
                          )
                        }
                        onFocus={() =>
                          setEditingItemData((prev) => ({
                            ...prev,
                            [item.id]: {
                              quantity: item.quantity,
                              subtotal: item.subtotal,
                            },
                          }))
                        }
                        onBlur={() => handleBlurQuantity(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.target.blur();
                        }}
                        style={{
                          width: 40,
                          textAlign: "center",
                          fontSize: "0.82rem",
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          fontFamily: "sans-serif",
                          color: "#1a1a1a",
                          appearance: "textfield",
                          MozAppearance: "textfield",
                        }}
                      />

                      <button
                        onClick={() =>
                          handleToggleIncrease(
                            item.id,
                            item.priceAtTime,
                            item.quantity,
                            item.stock,
                          )
                        }
                        style={{
                          width: 32,
                          height: 32,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "1rem",
                          color: "#888",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f0ece6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: "right", minWidth: 100 }}>
                    <p
                      style={{
                        fontFamily: "sans-serif",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        margin: 0,
                        color: "#1a1a1a",
                      }}
                    >
                      {formatVND(item.subtotal)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "#bbb",
                        margin: "3px 0 0",
                      }}
                    >
                      {formatVND(item.priceAtTime)} / pc
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() =>
                      handleDelete(item.id, item.quantity, item.subtotal)
                    }
                    style={{
                      width: 24,
                      height: 24,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "color 0.2s",
                      padding: 0,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#1a1a1a")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "64px 0",
                  textAlign: "center",
                  color: "#aaa",
                  fontSize: "0.85rem",
                  letterSpacing: "0.04em",
                }}
              >
                Your cart is empty.
              </div>
            )}

            {/* Continue shopping */}
            <div style={{ marginTop: 32 }}>
              <button
                onClick={() => navigate("/product")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 24px",
                  border: "1px solid #e8e4df",
                  background: "transparent",
                  color: "#888",
                  fontSize: "0.68rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "sans-serif",
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
                <ArrowLeft size={13} strokeWidth={1.5} />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* ── RIGHT: SUMMARY ── */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e4df",
              padding: "32px 28px",
              position: "sticky",
              top: 88,
            }}
          >
            <p
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 8,
              }}
            >
              Order
            </p>
            <h2
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1.4rem",
                fontWeight: 400,
                margin: "0 0 24px",
                color: "#1a1a1a",
              }}
            >
              Summary
            </h2>
            <div
              style={{
                width: 32,
                height: 1,
                background: "#1a1a1a",
                marginBottom: 28,
              }}
            />

            {/* Discount code */}
            <div
              style={{
                marginBottom: 28,
                paddingBottom: 28,
                borderBottom: "1px solid #e8e4df",
              }}
            >
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#888",
                  marginBottom: 10,
                }}
              >
                Discount Code
              </p>
              <div style={{ display: "flex", gap: 0 }}>
                <input
                  type="text"
                  placeholder="Enter code..."
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #e8e4df",
                    borderRight: "none",
                    background: "transparent",
                    fontSize: "0.78rem",
                    color: "#1a1a1a",
                    outline: "none",
                    fontFamily: "sans-serif",
                  }}
                />
                <button
                  style={{
                    padding: "10px 16px",
                    background: "#1a1a1a",
                    color: "#faf9f7",
                    border: "1px solid #1a1a1a",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "sans-serif",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#1a1a1a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1a1a1a";
                    e.currentTarget.style.color = "#faf9f7";
                  }}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Line items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 24,
              }}
            >
              {[
                { label: "Subtotal", value: formatVND(summary.subtotal) },
                { label: "Shipping", value: summary.shippingText },
                { label: "Discount", value: formatVND(summary.discount) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "#888",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "#1a1a1a",
                      fontWeight: 500,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #1a1a1a",
                paddingTop: 20,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "1rem",
                  color: "#1a1a1a",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  letterSpacing: "0.02em",
                }}
              >
                {formatVND(summary.total)}
              </span>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              style={{
                width: "100%",
                padding: "14px 0",
                background: "#1a1a1a",
                color: "#faf9f7",
                border: "1px solid #1a1a1a",
                fontFamily: "sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "background 0.25s, color 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1a1a1a";
                e.currentTarget.style.color = "#faf9f7";
              }}
            >
              Proceed to Checkout <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>

      <ChatBot />
      <Contact />
    </div>
  );
};

export default Cart;
