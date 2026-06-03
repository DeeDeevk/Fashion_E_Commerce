// src/pages/WishlistDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "../components/ProductCard";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = {
  async request(url, options = {}) {
    const token = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  },
  get(url) {
    return this.request(url, { method: "GET" });
  },
  del(url) {
    return this.request(url, { method: "DELETE" });
  },
};

export default function WishlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchWishlistDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get(`/wishlists/${id}/items`);
        const items = data.result || [];
        const productList = items.map((item) => ({
          id: item.productId,
          name: item.productName,
          imageUrlFront: item.productImage,
          price: item.productPrice,
          costPrice: item.productCostPrice || item.productPrice,
          discountAmount: item.discountAmount || 0,
          quantity: 1,
          rating: 4.5,
        }));
        setProducts(productList);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("Unauthorized")) {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistDetail();
  }, [id, navigate]);

  const openDeleteModal = (productId, productName) => {
    setProductToDelete({ id: productId, name: productName });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleRemoveItem = async () => {
    if (!productToDelete) return;
    try {
      await api.del(`/wishlists/${id}/items/${productToDelete.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success(`"${productToDelete.name}" removed from wishlist`);
      closeDeleteModal();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 24px 80px",
          fontFamily: "sans-serif",
          color: "#1a1a1a",
          minHeight: "80vh",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 48,
          }}
        >
          {/* Left: back + title */}
          <div>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 12,
                fontFamily: "sans-serif",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              Back
            </button>

            <h1
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                fontWeight: 400,
                margin: "0 0 16px",
                lineHeight: 1.15,
              }}
            >
              Collection
            </h1>
            <div style={{ width: 48, height: 1, background: "#1a1a1a" }} />
          </div>

          {/* Right: count */}
          {!loading && !error && products.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "2rem",
                  fontWeight: 400,
                  margin: "0 0 4px",
                  color: "#1a1a1a",
                  lineHeight: 1,
                }}
              >
                {products.length}
              </p>
              <p
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#aaa",
                  margin: 0,
                }}
              >
                {products.length === 1 ? "piece" : "pieces"}
              </p>
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div
              style={{
                display: "inline-block",
                width: 24,
                height: 24,
                border: "1px solid #1a1a1a",
                borderTop: "1px solid transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <p
            style={{
              textAlign: "center",
              padding: "48px 0",
              fontSize: "0.82rem",
              color: "#888",
            }}
          >
            {error}
          </p>
        )}

        {/* ── Content ── */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              /* Empty state */
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1.1rem",
                    color: "#1a1a1a",
                    margin: "0 0 10px",
                  }}
                >
                  No pieces saved yet
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#aaa",
                    margin: "0 0 32px",
                  }}
                >
                  Browse the collection and add what you love.
                </p>
                <button
                  onClick={() => navigate("/product")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 28px",
                    border: "1px solid #1a1a1a",
                    background: "#1a1a1a",
                    color: "#faf9f7",
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
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
                  <Plus size={14} strokeWidth={1.5} />
                  Continue Shopping
                </button>
              </div>
            ) : (
              /* Product grid */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "40px 24px",
                }}
              >
                {products.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    onRemove={() => openDeleteModal(product.id, product.name)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            fontFamily: "sans-serif",
          }}
        >
          <div
            onClick={closeDeleteModal}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(26,26,26,0.45)",
            }}
          />
          <div
            style={{
              position: "relative",
              background: "#faf9f7",
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid #e8e4df",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#aaa",
                    margin: "0 0 4px",
                  }}
                >
                  Confirm
                </p>
                <h2
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1.05rem",
                    fontWeight: 400,
                    margin: 0,
                    color: "#1a1a1a",
                  }}
                >
                  Remove Piece
                </h2>
              </div>
              <CloseBtn onClick={closeDeleteModal} />
            </div>

            {/* Body */}
            <div style={{ padding: "24px" }}>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#444",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Remove{" "}
                <span
                  style={{ fontFamily: "'Georgia', serif", color: "#1a1a1a" }}
                >
                  "{productToDelete?.name}"
                </span>{" "}
                from this wishlist? You can add it back anytime.
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "16px 24px",
                borderTop: "1px solid #e8e4df",
              }}
            >
              <button
                onClick={closeDeleteModal}
                style={ghostBtnStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1a1a1a";
                  e.currentTarget.style.color = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e8e4df";
                  e.currentTarget.style.color = "#888";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveItem}
                style={solidBtnStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.color = "#faf9f7";
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatBot />
      <Contact />
    </>
  );
}

// ── Product item wrapper ──
function ProductItem({ product, onRemove, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove from wishlist"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          width: 30,
          height: 30,
          border: "1px solid #e8e4df",
          background: "#faf9f7",
          color: "#aaa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          borderRadius: 0,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s, border-color 0.2s, color 0.2s",
          pointerEvents: hovered ? "auto" : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#1a1a1a";
          e.currentTarget.style.color = "#1a1a1a";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e8e4df";
          e.currentTarget.style.color = "#aaa";
        }}
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </button>

      {/* Card — disable inner buttons */}
      <div
        onClick={onClick}
        style={{ cursor: "pointer" }}
        className="[&_button]:pointer-events-none"
      >
        <ProductCard product={product} isInWishlist={true} />
      </div>
    </div>
  );
}

// ── Shared ──
function CloseBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
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
      <X size={14} strokeWidth={1.5} />
    </button>
  );
}

const ghostBtnStyle = {
  flex: 1,
  padding: "11px 0",
  border: "1px solid #e8e4df",
  background: "transparent",
  color: "#888",
  fontSize: "0.68rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "sans-serif",
  transition: "border-color 0.2s, color 0.2s",
};

const solidBtnStyle = {
  flex: 1,
  padding: "11px 0",
  border: "1px solid #1a1a1a",
  background: "#1a1a1a",
  color: "#faf9f7",
  fontSize: "0.68rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "sans-serif",
  transition: "background 0.2s, color 0.2s",
};
