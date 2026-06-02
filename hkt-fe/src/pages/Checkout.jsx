import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

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
      shippingFee: 30000,
      total: 0,
    };

  const selectedItems = items.filter((i) => i.selected);
  const subtotal = selectedItems.reduce((s, i) => s + i.subtotal, 0);
  const discount = 0;
  const shippingFee = 30000;
  const total = subtotal - discount + shippingFee;

  return { subtotal, discount, shippingFee, total };
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addresses, setAddresses] = useState([]);
  const userId = location.state?.userId;
  const product = location.state?.product;
  const quantity = location.state?.quantity;
  const selectedCartItems = location.state?.select || [];
  const [cartItems, setCartItems] = useState([]);
  const [payment, setPayment] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const cartId = location.state?.cartId;
  const sizeDetailId = location.state?.sizeDetailId;

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [summary, setSummary] = useState({
    subtotal: 0,
    discount: 0,
    shippingFee: 0,
    total: 0,
  });

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: "",
  });
  const [formAddress, setFormAddress] = useState({
    province: "",
    delivery_address: "",
    delivery_note: "",
  });
  const [isAddAddress, setIsAddAddress] = useState(false);
  console.log(product, quantity);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${BASE_URL}/addresses/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setAddresses(data);
      } catch (error) {
        console.log("Lỗi fetch Addreses: ", error);
      }
    };
    if (userId) fetchAddresses();
  }, [userId]);

  useEffect(() => {
    const handleFetchCustomer = async () => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/customers/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const customer = await res.json();
      setForm({
        name: customer.fullName,
        phone: customer.phoneNumber,
        email: customer.email,
      });
    };
    handleFetchCustomer();
  }, []);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/?depth=2")
      .then((res) => res.json())
      .then((data) => setProvinces(data));
  }, []);

  const handleProvinceChange = (provinceName) => {
    setSelectedProvince(provinceName);
    const province = provinces.find((p) => p.name == provinceName);
    setWards(province?.wards || []);
  };

  useEffect(() => {
    const stored = localStorage.getItem("cartItems");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCartItems(parsed);
      setSummary(calculateSummary(parsed));
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleChangeAddress = (e) =>
    setFormAddress({ ...formAddress, [e.target.name]: e.target.value });

  const handleSelectAddress = (index) => {
    if (index === "") return;
    const addr = addresses[index];
    setForm((prev) => ({
      ...prev,
      address: addr.delivery_address,
      province: addr.province,
      district: addr.city,
      ward: addr.ward || "",
      note: addr.delivery_note || "",
    }));
  };

  const handleConfirm = async () => {
    try {
      if (!form.address || !form.province) {
        toast.warning("Vui lòng chọn địa chỉ giao hàng trước khi xác nhận!");
        return;
      }
      if (payment === "") {
        toast.warning("Vui lòng chọn phương thức thanh toán!!!");
        return;
      } else {
        const token = localStorage.getItem("accessToken");
        const fullAddress = `${form.address}${
          form.ward ? ", " + form.ward : ""
        }, ${form.province}`;

        let requestBody;
        if (product) {
          requestBody = {
            receiverName: form.name,
            receiverPhone: form.phone,
            receiverEmail: form.email,
            receiverAddress: fullAddress,
            totalAmount: product.costPrice * quantity + 30000,
          };
        } else {
          requestBody = {
            receiverName: form.name,
            receiverPhone: form.phone,
            receiverEmail: form.email,
            receiverAddress: fullAddress,
            totalAmount: summary.total,
          };
        }

        const res = await fetch(`${BASE_URL}/customer-trading/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) throw new Error("Failed to create order");

        const data = await res.json();
        console.log(data);
        let orderBody;
        if (payment === "bank") {
          orderBody = {
            customerTradingId: data.id,
            note: form.note || "",
            account_id: userId,
            paymentMethod: "BANK_TRANSFER",
          };
        } else {
          orderBody = {
            customerTradingId: data.id,
            note: form.note || "",
            account_id: userId,
            paymentMethod: "CASH",
          };
        }

        const orderRes = await fetch(`${BASE_URL}/orders/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderBody),
        });

        if (!orderRes.ok) throw new Error("Failed to create order");

        const orderData = await orderRes.json();
        console.log("Order created:", orderData);
        if (orderData.ok) {
          toast.success("Đặt hàng thành công!!");
        }

        if (product) {
          await fetch(`${BASE_URL}/order-details/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productName: product.name,
              quantity: quantity,
              unitPrice: product.costPrice,
              totalPrice: product.costPrice * quantity,
              orderId: orderData.id,
              productId: product.id,
              sizeDetailId: sizeDetailId,
            }),
          });
        } else {
          for (const item of selectedCartItems) {
            await fetch(`${BASE_URL}/order-details/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.priceAtTime,
                totalPrice: item.subtotal,
                orderId: orderData.id,
                productId: item.productId,
                sizeDetailId: item.sizeDetailId,
              }),
            });

            await fetch(`${BASE_URL}/cart-details/delete/${item.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            await fetch(`${BASE_URL}/carts/update/${cartId}/delete`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                price: item.subtotal,
                quantity: item.quantity,
              }),
            });
          }
          localStorage.removeItem("cartItems");
        }

        toast.success("Order successfull!!");

        if (payment === "bank") {
          const orderId = orderData.id;
          const invoiceRequest = {
            orderId: orderId,
            paymentMethod: "BANK_TRANSFER",
            paymentStatus: "UNPAID",
          };
          const res = await fetch(`${BASE_URL}/invoices`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(invoiceRequest),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Failed to create invoice");
          } else {
            const newInvoice = await res.json();
            sessionStorage.setItem(
              "paymentInfo",
              JSON.stringify({
                orderId: orderData.id,
                amount: product
                  ? product.costPrice * quantity + 30000
                  : summary.total,
                invoiceId: newInvoice.id,
                invoiceCode: newInvoice.invoiceCode,
              })
            );
            navigate(`/payment`);
          }
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const handleAddNewAddress = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const finalDeliveryAddress = selectedWard
        ? `${formAddress.delivery_address}, ${selectedWard}`
        : `${formAddress.delivery_address}`;
      const requestBody = {
        accountId: userId,
        province: selectedProvince,
        delivery_address: finalDeliveryAddress,
        delivery_note: formAddress.delivery_note,
      };
      const res = await fetch(`${BASE_URL}/addresses/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        setFormAddress({
          city: "",
          province: "",
          delivery_address: "",
          delivery_note: "",
        });
        toast.success("Add address successfully!!");
        setIsAddAddress(false);
      }
      const resAddress = await fetch(`${BASE_URL}/addresses/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resAddress.json();
      setAddresses(data);
    } catch (error) {
      console.error("Fail to add new address!!", error);
      toast.error("Fail to add new address!!");
    }
  };

  // ─── shared style tokens (mirrors Home.jsx) ───────────────────────────────
  const font = {
    serif: "'Georgia', 'Times New Roman', serif",
    sans: "sans-serif",
  };
  const color = {
    bg: "#faf9f7",
    ink: "#1a1a1a",
    muted: "#888",
    border: "#e8e4df",
    hover: "#f0ece6",
    gold: "#c8a96e",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 0",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${color.border}`,
    outline: "none",
    fontFamily: font.sans,
    fontSize: "0.85rem",
    color: color.ink,
    letterSpacing: "0.02em",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
  };

  const sectionLabel = {
    fontFamily: font.sans,
    fontSize: "0.62rem",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: color.muted,
    margin: "0 0 10px",
  };

  const sectionTitle = {
    fontFamily: font.serif,
    fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
    fontWeight: 400,
    margin: "0 0 32px",
    color: color.ink,
  };

  const divider = {
    width: 40,
    height: 1,
    background: color.ink,
    margin: "16px 0 36px",
  };

  return (
    <div
      style={{
        fontFamily: font.serif,
        color: color.ink,
        background: color.bg,
        minHeight: "100vh",
      }}
    >
      {/* ── Page header ── */}
      <div
        style={{
          borderBottom: `1px solid ${color.border}`,
          padding: "48px 24px 36px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <p style={sectionLabel}>Secure Checkout</p>
        <h1
          style={{
            fontFamily: font.serif,
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Complete Your Order
        </h1>
      </div>

      {/* ── Main layout ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 24px 80px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 48,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 340px",
            gap: 64,
            alignItems: "start",
          }}
          className="checkout-grid"
        >
          {/* ─── LEFT COLUMN ─────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>

            {/* §1 — Shipping Information */}
            <section>
              <p style={sectionLabel}>01 — Contact</p>
              <h2 style={sectionTitle}>Shipping Information</h2>
              <div style={divider} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 32px",
                }}
              >
                {[
                  { name: "email", placeholder: "Email address", type: "email", span: 2 },
                  { name: "name", placeholder: "Full name", type: "text", span: 1 },
                  { name: "phone", placeholder: "Phone number", type: "text", span: 1 },
                ].map(({ name, placeholder, type, span }) => (
                  <div
                    key={name}
                    style={{ gridColumn: span === 2 ? "span 2" : "span 1", position: "relative" }}
                  >
                    <input
                      type={type}
                      name={name}
                      placeholder={placeholder}
                      style={inputStyle}
                      onChange={handleChange}
                      value={form[name] || ""}
                      onFocus={(e) =>
                        (e.target.style.borderBottomColor = color.ink)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderBottomColor = color.border)
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Address section */}
              <div style={{ marginTop: 32 }}>
                {!isAddAddress ? (
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "relative" }}>
                      <select
                        name="address"
                        style={selectStyle}
                        onChange={(e) => handleSelectAddress(e.target.value)}
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = color.ink)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor = color.border)
                        }
                      >
                        <option value="">— Select saved address —</option>
                        {addresses.map((addr, index) => (
                          <option key={index} value={index}>
                            {addr.delivery_address} ({addr.province})
                          </option>
                        ))}
                      </select>
                      {/* custom chevron */}
                      <span
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          fontSize: "0.65rem",
                          color: color.muted,
                        }}
                      >
                        ▾
                      </span>
                    </div>

                    <button
                      onClick={() => setIsAddAddress(true)}
                      style={{
                        marginTop: 16,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        fontFamily: font.sans,
                        fontSize: "0.68rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: color.muted,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: 4,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = color.ink)}
                      onMouseLeave={(e) => (e.target.style.color = color.muted)}
                    >
                      + Add new address
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      background: color.hover,
                      padding: "32px",
                      borderLeft: `2px solid ${color.ink}`,
                    }}
                  >
                    <p
                      style={{
                        ...sectionLabel,
                        marginBottom: 24,
                        color: color.ink,
                      }}
                    >
                      New Address
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      <input
                        type="text"
                        name="delivery_address"
                        placeholder="Street address"
                        style={inputStyle}
                        onChange={handleChangeAddress}
                        value={formAddress.delivery_address}
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = color.ink)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor = color.border)
                        }
                      />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0 32px",
                          marginTop: 8,
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <select
                            value={selectedProvince}
                            onChange={(e) =>
                              handleProvinceChange(e.target.value)
                            }
                            style={selectStyle}
                            onFocus={(e) =>
                              (e.target.style.borderBottomColor = color.ink)
                            }
                            onBlur={(e) =>
                              (e.target.style.borderBottomColor = color.border)
                            }
                          >
                            <option value="">— Province —</option>
                            {provinces.map((p) => (
                              <option key={p.code} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <span
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                              fontSize: "0.65rem",
                              color: color.muted,
                            }}
                          >
                            ▾
                          </span>
                        </div>

                        <div style={{ position: "relative" }}>
                          <select
                            style={{
                              ...selectStyle,
                              color: !selectedProvince ? color.muted : color.ink,
                            }}
                            disabled={!selectedProvince}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            onFocus={(e) =>
                              (e.target.style.borderBottomColor = color.ink)
                            }
                            onBlur={(e) =>
                              (e.target.style.borderBottomColor = color.border)
                            }
                          >
                            <option value="">— Ward —</option>
                            {wards.map((w) => (
                              <option key={w.code} value={w.name}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                          <span
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                              fontSize: "0.65rem",
                              color: color.muted,
                            }}
                          >
                            ▾
                          </span>
                        </div>
                      </div>

                      <textarea
                        name="delivery_note"
                        placeholder="Delivery note (optional)"
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize: "none",
                          marginTop: 8,
                          paddingTop: 14,
                        }}
                        onChange={handleChangeAddress}
                        value={formAddress.delivery_note}
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = color.ink)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor = color.border)
                        }
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 28,
                      }}
                    >
                      <button
                        onClick={() => setIsAddAddress(false)}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          fontFamily: font.sans,
                          fontSize: "0.68rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: color.muted,
                          cursor: "pointer",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.target.style.color = color.ink)}
                        onMouseLeave={(e) =>
                          (e.target.style.color = color.muted)
                        }
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleAddNewAddress}
                        style={{
                          padding: "11px 32px",
                          background: color.ink,
                          color: color.bg,
                          border: `1px solid ${color.ink}`,
                          fontFamily: font.sans,
                          fontSize: "0.66rem",
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          transition: "background 0.25s, color 0.25s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = color.ink;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = color.ink;
                          e.currentTarget.style.color = color.bg;
                        }}
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Note */}
              <div style={{ marginTop: 24 }}>
                <textarea
                  name="note"
                  placeholder="Order notes (optional)"
                  rows={3}
                  style={{ ...inputStyle, resize: "none", paddingTop: 14 }}
                  onChange={handleChange}
                  onFocus={(e) =>
                    (e.target.style.borderBottomColor = color.ink)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderBottomColor = color.border)
                  }
                />
              </div>
            </section>

            {/* §2 — Delivery */}
            <section>
              <p style={sectionLabel}>02 — Logistics</p>
              <h2 style={sectionTitle}>Delivery Method</h2>
              <div style={divider} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 0",
                  borderBottom: `1px solid ${color.border}`,
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: font.serif,
                      fontSize: "0.95rem",
                      margin: "0 0 4px",
                    }}
                  >
                    Standard Delivery
                  </p>
                  <p
                    style={{
                      fontFamily: font.sans,
                      fontSize: "0.73rem",
                      color: color.muted,
                      margin: 0,
                      letterSpacing: "0.04em",
                    }}
                  >
                    3–5 business days · Nationwide
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: font.sans,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  {formatVND(30000)}
                </span>
              </div>
            </section>

            {/* §3 — Payment */}
            <section>
              <p style={sectionLabel}>03 — Payment</p>
              <h2 style={sectionTitle}>Payment Method</h2>
              <div style={divider} />

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { value: "cash", label: "Cash on Delivery", sub: "Pay when your order arrives" },
                  { value: "bank", label: "Bank Transfer", sub: "Secure online bank payment" },
                ].map(({ value, label, sub }) => (
                  <label
                    key={value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px 0",
                      borderBottom: `1px solid ${color.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {/* custom radio */}
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `1px solid ${
                            payment === value ? color.ink : color.border
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "border-color 0.2s",
                        }}
                      >
                        {payment === value && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: color.ink,
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: font.serif,
                            fontSize: "0.95rem",
                            margin: "0 0 3px",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            fontFamily: font.sans,
                            fontSize: "0.72rem",
                            color: color.muted,
                            margin: 0,
                            letterSpacing: "0.03em",
                          }}
                        >
                          {sub}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      style={{ display: "none" }}
                      onChange={(e) => setPayment(e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* ─── RIGHT COLUMN — Order Summary ─────────────────────────── */}
          <aside
            style={{
              position: "sticky",
              top: 32,
              background: color.ink,
              color: color.bg,
              padding: "40px 36px",
            }}
          >
            <p
              style={{
                fontFamily: font.sans,
                fontSize: "0.6rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(250,249,247,0.45)",
                margin: "0 0 10px",
              }}
            >
              Your Order
            </p>
            <h2
              style={{
                fontFamily: font.serif,
                fontSize: "1.7rem",
                fontWeight: 400,
                margin: "0 0 32px",
                lineHeight: 1.2,
              }}
            >
              Order Summary
            </h2>

            {/* thin gold accent */}
            <div
              style={{
                width: 36,
                height: 1,
                background: color.gold,
                marginBottom: 36,
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  label: "Subtotal",
                  value: formatVND(
                    product ? product.costPrice * quantity : summary.subtotal
                  ),
                },
                {
                  label: "Shipping",
                  value: formatVND(
                    product ? 30000 : summary.shippingFee
                  ),
                },
                {
                  label: "Discount",
                  value: formatVND(summary.discount),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(250,249,247,0.1)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: font.sans,
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(250,249,247,0.55)",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: font.sans,
                      fontSize: "0.85rem",
                      color: "rgba(250,249,247,0.85)",
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
                alignItems: "baseline",
                padding: "28px 0 0",
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontFamily: font.serif,
                  fontSize: "1.1rem",
                  fontWeight: 400,
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: font.serif,
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  color: color.gold,
                  letterSpacing: "0.02em",
                }}
              >
                {formatVND(
                  product
                    ? product.costPrice * quantity + 30000
                    : summary.total
                )}
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={handleConfirm}
              style={{
                width: "100%",
                marginTop: 36,
                padding: "16px",
                background: color.bg,
                color: color.ink,
                border: `1px solid ${color.bg}`,
                fontFamily: font.sans,
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.25s, color 0.25s, border-color 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = color.bg;
                e.currentTarget.style.borderColor = "rgba(250,249,247,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = color.bg;
                e.currentTarget.style.color = color.ink;
                e.currentTarget.style.borderColor = color.bg;
              }}
            >
              Confirm Order
            </button>

            <p
              style={{
                fontFamily: font.sans,
                fontSize: "0.65rem",
                color: "rgba(250,249,247,0.3)",
                textAlign: "center",
                letterSpacing: "0.06em",
                marginTop: 20,
              }}
            >
              Secured · Encrypted · Trusted
            </p>
          </aside>
        </div>
      </div>

      {/* ── Responsive grid collapse ── */}
      <style>{`
        @media (max-width: 820px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
        input::placeholder,
        textarea::placeholder,
        select option[value=""] {
          color: #aaa;
          font-family: sans-serif;
          font-size: 0.83rem;
        }
      `}</style>
    </div>
  );
};

export default Checkout;