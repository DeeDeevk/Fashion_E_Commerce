import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import dauTick from "../assets/dauTick.png";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";
import { ArrowRight, CheckCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const QrPayment = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const paymentInfo = JSON.parse(sessionStorage.getItem("paymentInfo") || "{}");
  const { orderId, amount, invoiceId, invoiceCode } = paymentInfo;
  const interval = useRef(null);

  const qrCode = `https://qr.sepay.vn/img?acc=VQRQAFTEV8402&bank=MBBank&amount=${amount}&des=${invoiceCode}`;

  const handleFetchInvoiceById = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/invoices/${invoiceId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const invoice = await res.json();
      if (invoice.paymentStatus === "PAID") {
        clearInterval(interval.current);
        sessionStorage.removeItem("paymentInfo");
        await fetch(`${BASE_URL}/orders/status/${orderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statusOrder: "CONFIRMED" }),
        });
        setIsSuccess(true);
      } else {
        setIsSuccess(false);
      }
    } catch (error) {
      console.log("Invoice not found", error);
    }
  };

  useEffect(() => {
    interval.current = setInterval(() => {
      handleFetchInvoiceById();
    }, 5000);
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    if (!invoiceId || !orderId) {
      navigate("/");
    }
  }, []);

  // ── Success state ──
  if (isSuccess) {
    return (
      <div
        style={{
          minHeight: "70vh",
          background: "#faf9f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          {/* Check icon */}
          <div
            style={{
              width: 72,
              height: 72,
              border: "1px solid #1a1a1a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
            }}
          >
            <img
              src={dauTick}
              alt="Success"
              style={{ width: 36, height: 36, objectFit: "contain" }}
            />
          </div>

          <p
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#aaa",
              marginBottom: 12,
            }}
          >
            Completed
          </p>
          <h3
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 400,
              color: "#1a1a1a",
              margin: "0 0 16px",
            }}
          >
            Payment Successful
          </h3>
          <div
            style={{
              width: 48,
              height: 1,
              background: "#1a1a1a",
              margin: "0 auto 20px",
            }}
          />
          <p
            style={{
              fontSize: "0.82rem",
              color: "#888",
              lineHeight: 1.75,
              marginBottom: 40,
            }}
          >
            Your transaction has been completed. Thank you for shopping with us!
          </p>

          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 40px",
              background: "#1a1a1a",
              color: "#faf9f7",
              border: "1px solid #1a1a1a",
              fontFamily: "sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
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
            Back to Home <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  }

  // ── QR Payment screen ──
  return (
    <div
      style={{
        background: "#faf9f7",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        color: "#1a1a1a",
      }}
    >
      <div
        style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}
      >
        {/* Page header */}
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
            Almost There
          </p>
          <h1
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 400,
              margin: "0 0 16px",
            }}
          >
            Complete Your Payment
          </h1>
          <div style={{ width: 48, height: 1, background: "#1a1a1a" }} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            background: "#e8e4df",
          }}
          className="qr-grid"
        >
          {/* QR Code panel */}
          <div
            style={{
              background: "#fff",
              padding: "48px 36px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
            }}
          >
            <p
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#aaa",
                margin: 0,
              }}
            >
              Scan to Pay
            </p>
            <div
              style={{
                border: "1px solid #e8e4df",
                padding: 12,
                background: "#faf9f7",
              }}
            >
              <img
                src={qrCode}
                alt="QR Code"
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#888",
                textAlign: "center",
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 260,
              }}
            >
              Use your banking app to scan the QR code and complete payment.
            </p>
          </div>

          {/* Payment details panel */}
          <div style={{ background: "#faf9f7", padding: "48px 36px" }}>
            <p
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 24,
              }}
            >
              Bank Details
            </p>

            {/* Bank badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 20px",
                border: "1px solid #e8e4df",
                background: "#fff",
                marginBottom: 28,
              }}
            >
              <img
                src="https://play-lh.googleusercontent.com/t7F9E1HglpFrmXzXGO7u-hnTSKkFW3ZmXJdmS97WaOnUgrySvAXVgwncj1uE4_3LcA"
                alt="MBBank"
                style={{
                  width: 44,
                  height: 44,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "0.92rem",
                    margin: "0 0 2px",
                    color: "#1a1a1a",
                  }}
                >
                  MBBank
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "#aaa",
                    margin: 0,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Bank Transfer
                </p>
              </div>
            </div>

            {/* Detail rows */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { label: "Account Name", value: "NGUYEN HO VIET KHOA" },
                { label: "Account Number", value: "0812777990" },
                {
                  label: "Amount",
                  value: `${Number(amount).toLocaleString("vi-VN")} VNĐ`,
                  highlight: true,
                },
                {
                  label: "Transfer Content",
                  value: invoiceCode,
                  highlight: true,
                },
              ].map(({ label, value, highlight }, idx, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom:
                      idx < arr.length - 1 ? "1px solid #e8e4df" : "none",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#aaa",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: highlight ? 700 : 500,
                      color: "#1a1a1a",
                      textAlign: "right",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: "0.72rem",
                color: "#aaa",
                lineHeight: 1.7,
                marginTop: 24,
                letterSpacing: "0.02em",
              }}
            >
              Please complete the payment using the above details to ensure your
              order is processed.
            </p>

            {/* Waiting indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 28,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: "1px solid #1a1a1a",
                  borderTop: "1px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.9s linear infinite",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.68rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#aaa",
                }}
              >
                Waiting for payment confirmation...
              </span>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .qr-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ChatBot />
      <Contact />
    </div>
  );
};

export default QrPayment;
