import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchProductsByIds = async (ids) => {
  const response = await fetch(
    `${BASE_URL}/products/batch?ids=${ids.join(",")}`,
  );
  const data = await response.json();
  return data.result;
};

const formatPrice = (price) => {
  const numericPrice = typeof price === "number" && isFinite(price) ? price : 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericPrice);
};

const clearCompareList = () => {
  localStorage.removeItem("compareList");
};

const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const idsString = searchParams.get("ids");
  const productIds = idsString
    ? idsString.split(",").map((id) => parseInt(id))
    : [];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProducts = async () => {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const fetchedProducts = await fetchProductsByIds(productIds);
        setProducts(fetchedProducts);
      } catch (err) {
        setError("Failed to fetch product data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [idsString]);

  const handleClearComparison = () => {
    clearCompareList();
    setProducts([]);
    toast.success("Comparison list cleared successfully!");
  };

  const comparisonFeatures = [
    {
      key: "costPrice",
      label: "Sale Price",
      render: (p) => (
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          {formatPrice(p.costPrice)}
        </span>
      ),
    },
    {
      key: "price",
      label: "Original Price",
      render: (p) => (
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: "0.82rem",
            color: "#bbb",
            textDecoration: "line-through",
          }}
        >
          {formatPrice(p.price)}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (p) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="#c8a96e"
            stroke="#c8a96e"
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.82rem",
              color: "#1a1a1a",
            }}
          >
            {p.rating || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "availableSizes",
      label: "Available Sizes",
      render: (p) => {
        const availableSizes = p.sizeDetails
          ? p.sizeDetails
              .filter((size) => size.quantity > 0)
              .sort((a, b) => {
                const order = ["S", "M", "L", "XL"];
                return order.indexOf(a.sizeName) - order.indexOf(b.sizeName);
              })
          : [];
        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              justifyContent: "center",
            }}
          >
            {availableSizes.length > 0 ? (
              availableSizes.map((size) => (
                <span
                  key={size.sizeName}
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#1a1a1a",
                    border: "1px solid #1a1a1a",
                    padding: "3px 10px",
                  }}
                >
                  {size.sizeName}
                </span>
              ))
            ) : (
              <span
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "0.72rem",
                  color: "#aaa",
                  letterSpacing: "0.08em",
                }}
              >
                Out of Stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "form",
      label: "Form / Fit",
      render: (p) => <CellText>{p.form || "—"}</CellText>,
    },
    {
      key: "material",
      label: "Material",
      render: (p) => <CellText>{p.material || "—"}</CellText>,
    },
    {
      key: "unit",
      label: "Unit",
      render: (p) => <CellText>{p.unit || "—"}</CellText>,
    },
    {
      key: "description",
      label: "Description",
      render: (p) => (
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: "0.78rem",
            color: "#888",
            lineHeight: 1.7,
            textAlign: "left",
            margin: 0,
            maxWidth: 220,
            marginInline: "auto",
          }}
        >
          {p.description}
        </p>
      ),
    },
    {
      key: "imageUrlFront",
      label: "Front",
      render: (p) => (
        <div
          style={{
            width: 80,
            height: 96,
            overflow: "hidden",
            background: "#f0ece6",
            margin: "0 auto",
          }}
        >
          <img
            src={p.imageUrlFront}
            alt={`${p.name} Front`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      ),
    },
    {
      key: "imageUrlBack",
      label: "Back",
      render: (p) => (
        <div
          style={{
            width: 80,
            height: 96,
            overflow: "hidden",
            background: "#f0ece6",
            margin: "0 auto",
          }}
        >
          <img
            src={p.imageUrlBack}
            alt={`${p.name} Back`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      ),
    },
  ];

  // ── Loading ──
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#faf9f7",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "1px solid #1a1a1a",
            borderTop: "1px solid transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Empty / Error ──
  if (error || productIds.length === 0 || products.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#faf9f7",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          gap: 20,
        }}
      >
        <p
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#aaa",
          }}
        >
          Compare
        </p>
        <h3
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "1.6rem",
            fontWeight: 400,
            color: "#1a1a1a",
            margin: 0,
          }}
        >
          {error ||
            (productIds.length === 0
              ? "No products selected."
              : "Products not found.")}
        </h3>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
            padding: "10px 24px",
            border: "1px solid #e8e4df",
            background: "transparent",
            color: "#888",
            textDecoration: "none",
            fontSize: "0.68rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
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
          <ArrowLeft size={13} strokeWidth={1.5} /> Back to Home
        </Link>
      </div>
    );
  }

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
        style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 48,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 10,
              }}
            >
              Compare
            </p>
            <h1
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 400,
                margin: "0 0 16px",
                lineHeight: 1.15,
              }}
            >
              Product Comparison
            </h1>
            <div style={{ width: 48, height: 1, background: "#1a1a1a" }} />
          </div>

          <button
            onClick={handleClearComparison}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
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
            <Trash2 size={13} strokeWidth={1.5} /> Clear Comparison
          </button>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                {/* Feature label column */}
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 20,
                    background: "#faf9f7",
                    padding: "16px 20px",
                    textAlign: "left",
                    width: 160,
                    minWidth: 140,
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#aaa",
                    fontWeight: 400,
                    borderRight: "1px solid #e8e4df",
                  }}
                >
                  Feature
                </th>

                {/* Product columns */}
                {products.map((p) => (
                  <th
                    key={p.id}
                    style={{
                      padding: "20px 24px",
                      textAlign: "center",
                      minWidth: 220,
                      borderLeft: "1px solid #e8e4df",
                      fontWeight: 400,
                      verticalAlign: "bottom",
                    }}
                  >
                    <Link
                      to={`/product/${p.id}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div
                        style={{
                          width: 72,
                          height: 88,
                          overflow: "hidden",
                          background: "#f0ece6",
                          margin: "0 auto 12px",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <img
                          src={p.imageUrlFront}
                          alt={p.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontFamily: "'Georgia', serif",
                          fontSize: "0.88rem",
                          fontWeight: 400,
                          color: "#1a1a1a",
                          margin: 0,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {p.name}
                      </p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {comparisonFeatures.map((feature, rowIndex) => (
                <tr
                  key={feature.key}
                  style={{
                    background: rowIndex % 2 === 0 ? "#fff" : "#faf9f7",
                  }}
                >
                  {/* Feature label */}
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                      background: rowIndex % 2 === 0 ? "#fff" : "#faf9f7",
                      padding: "18px 20px",
                      fontSize: "0.65rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#888",
                      fontWeight: 400,
                      borderRight: "1px solid #e8e4df",
                      verticalAlign: "middle",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {feature.label}
                  </td>

                  {/* Product values */}
                  {products.map((p) => (
                    <td
                      key={`${p.id}-${feature.key}`}
                      style={{
                        padding: "18px 24px",
                        textAlign: "center",
                        borderLeft: "1px solid #e8e4df",
                        verticalAlign: "middle",
                      }}
                    >
                      {feature.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Back link ── */}
        <div style={{ marginTop: 48 }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              border: "1px solid #e8e4df",
              background: "transparent",
              color: "#888",
              textDecoration: "none",
              fontSize: "0.68rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
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
            <ArrowLeft size={13} strokeWidth={1.5} /> Back to Home
          </Link>
        </div>
      </div>

      <ChatBot />
      <Contact />
    </div>
  );
};

// ── Helper component ──
function CellText({ children }) {
  return (
    <span
      style={{
        fontFamily: "sans-serif",
        fontSize: "0.82rem",
        color: "#666",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

export default ComparePage;
