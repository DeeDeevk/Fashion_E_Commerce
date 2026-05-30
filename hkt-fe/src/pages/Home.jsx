// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  TrendingUp,
  Award,
  Truck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
} from "lucide-react";
import "../css/Home.css";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bestseller");

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener("login", checkAuth);
    window.addEventListener("logout", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("login", checkAuth);
      window.removeEventListener("logout", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          const productList =
            data.result.filter((p) => p.status === "ACTIVE") || [];
          setProducts(productList);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextBanner = () =>
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () =>
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  const banners = [
    "https://legiakhanhxd.s3.ap-southeast-1.amazonaws.com/z7796781278873_ae66b2ea4a9ae14eb7518f26dad1c77b.jpg",
    "https://legiakhanhxd.s3.ap-southeast-1.amazonaws.com/z7796798493473_a75d40aa9ceae620dd196bd8684f6ba4.jpg",
    "https://legiakhanhxd.s3.ap-southeast-1.amazonaws.com/z7796817782034_3b2eea6ef8d3144343f04bfc186e8d32.jpg",
  ];

  const getBestSellers = () => {
    return [...products]
      .filter((p) => p.quantity > 0)
      .sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0))
      .slice(0, 5);
  };

  const getNewArrivals = () => {
    return [...products]
      .filter((p) => p.quantity > 0)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const goToProduct = (id) => navigate(`/product/${id}`);

  const featureItems = [
    {
      icon: <ShoppingBag size={22} />,
      label: "Diverse Products",
      desc: "Hundreds of latest fashion designs",
    },
    {
      icon: <TrendingUp size={22} />,
      label: "Latest Trends",
      desc: "Updated with hottest fashion trends",
    },
    {
      icon: <Award size={22} />,
      label: "High Quality",
      desc: "100% quality guarantee",
    },
    {
      icon: <Truck size={22} />,
      label: "Fast Delivery",
      desc: "2–3 days nationwide",
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#1a1a1a",
        background: "#faf9f7",
        minHeight: "80vh",
      }}
    >
      {/* ── BANNER ── */}
      <section style={{ background: "#faf9f7", padding: "32px 24px 0" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            height: "78vh",
            overflow: "hidden",
          }}
        >
          {banners.map((banner, index) => (
            <img
              key={index}
              src={banner}
              alt={`Banner ${index + 1}`}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: index === currentBanner ? 1 : 0,
                transition: "opacity 1.1s ease",
              }}
            />
          ))}

          {/* gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.04) 45%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Prev / Next */}
          {[
            {
              fn: prevBanner,
              side: "left",
              icon: <ChevronLeft size={18} strokeWidth={1} />,
            },
            {
              fn: nextBanner,
              side: "right",
              icon: <ChevronRight size={18} strokeWidth={1} />,
            },
          ].map(({ fn, side, icon }) => (
            <button
              key={side}
              onClick={fn}
              style={{
                position: "absolute",
                top: "50%",
                [side]: "20px",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "#fff",
                width: 34,
                height: 34,
                borderRadius: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                transition: "border-color 0.25s, background 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {icon}
            </button>
          ))}

          {/* Bottom-left: label + CTA */}
          <div
            style={{
              position: "absolute",
              bottom: 36,
              left: 32,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <p
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                margin: 0,
              }}
            >
              New Collection
            </p>
            <button
              onClick={() => navigate("/product")}
              style={{
                padding: "11px 32px",
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.7)",
                borderRadius: 0,
                fontFamily: "sans-serif",
                fontSize: "0.66rem",
                fontWeight: 400,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.25s, border-color 0.25s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                e.currentTarget.style.borderColor = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
              }}
            >
              Shop Now <ArrowRight size={13} strokeWidth={1.2} />
            </button>
          </div>

          {/* Bottom-right: counter + dots */}
          <div
            style={{
              position: "absolute",
              bottom: 36,
              right: 32,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {String(currentBanner + 1).padStart(2, "0")} /{" "}
              {String(banners.length).padStart(2, "0")}
            </span>
            <div style={{ display: "flex", gap: 5 }}>
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  style={{
                    width: index === currentBanner ? 22 : 5,
                    height: 1,
                    background:
                      index === currentBanner
                        ? "#fff"
                        : "rgba(255,255,255,0.32)",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "width 0.35s ease, background 0.35s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{
          padding: "72px 0",
          background: "#faf9f7",
          borderBottom: "1px solid #e8e4df",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          {/* section header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: 12,
              }}
            >
              Our Promise
            </p>
            <h2
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 400,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Why Choose Us
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 1,
              background: "#e8e4df",
            }}
          >
            {featureItems.map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#faf9f7",
                  padding: "40px 32px",
                  textAlign: "center",
                  transition: "background 0.25s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0ece6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#faf9f7")
                }
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    background: "#1a1a1a",
                    color: "#fff",
                    borderRadius: "50%",
                    marginBottom: 20,
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1rem",
                    fontWeight: 400,
                    margin: "0 0 8px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.label}
                </h3>
                <p
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "0.78rem",
                    color: "#888",
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COLLECTIONS ── */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          {/* Header */}
          <div style={{ marginBottom: 52 }}>
            <p
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: 12,
              }}
            >
              Handpicked For You
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Featured Collections
              </h2>

              {/* Tabs */}
              <div
                style={{ display: "flex", gap: 0, border: "1px solid #1a1a1a" }}
              >
                {[
                  { key: "bestseller", label: "Best Sellers" },
                  { key: "newarrival", label: "New Arrivals" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      padding: "10px 24px",
                      background: activeTab === key ? "#1a1a1a" : "transparent",
                      color: activeTab === key ? "#fff" : "#1a1a1a",
                      border: "none",
                      borderRight:
                        key === "bestseller" ? "1px solid #1a1a1a" : "none",
                      fontFamily: "sans-serif",
                      fontSize: "0.72rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Underline accent */}
            <div
              style={{
                width: 48,
                height: 1,
                background: "#1a1a1a",
                marginTop: 20,
              }}
            />
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 28,
                  border: "2px solid #1a1a1a",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                gap: 20,
              }}
            >
              {(activeTab === "bestseller"
                ? getBestSellers()
                : getNewArrivals()
              ).map((product) => (
                <div
                  key={product.id}
                  onClick={() => goToProduct(product.id)}
                  style={{ cursor: "pointer", position: "relative" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelector(".prod-img").style.transform =
                      "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.querySelector(".prod-img").style.transform =
                      "scale(1)";
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "3/4",
                      overflow: "hidden",
                      background: "#f0ece6",
                      position: "relative",
                    }}
                  >
                    <img
                      className="prod-img"
                      src={product.imageUrlFront}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                        display: "block",
                      }}
                    />
                    {product.quantity === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(250,249,247,0.75)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "sans-serif",
                            fontSize: "0.65rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "#1a1a1a",
                            border: "1px solid #1a1a1a",
                            padding: "6px 14px",
                          }}
                        >
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ paddingTop: 14 }}>
                    <h4
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "0.88rem",
                        fontWeight: 400,
                        margin: "0 0 8px",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        color: "#1a1a1a",
                      }}
                    >
                      {product.name}
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#1a1a1a",
                          margin: 0,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {formatPrice(product.costPrice)}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Star
                          size={12}
                          style={{ color: "#c8a96e", fill: "#c8a96e" }}
                        />
                        <span
                          style={{
                            fontFamily: "sans-serif",
                            fontSize: "0.75rem",
                            color: "#888",
                          }}
                        >
                          {product.rating?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                    </div>

                    {product.reviewCount > 0 && (
                      <p
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: "0.7rem",
                          color: "#aaa",
                          margin: "4px 0 0",
                        }}
                      >
                        {product.reviewCount} reviews
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All */}
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <button
              onClick={() => {
                const sortParam =
                  activeTab === "bestseller" ? "bestselling" : "newest";
                navigate(`/product?sort=${sortParam}`);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 40px",
                background: "transparent",
                color: "#1a1a1a",
                border: "1px solid #1a1a1a",
                fontFamily: "sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.25s, color 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1a1a1a";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#1a1a1a";
              }}
            >
              View All Products <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── SIGN UP CTA (chỉ khi chưa đăng nhập) ── */}
      {!isLoggedIn && (
        <section
          style={{
            padding: "88px 24px",
            background: "#1a1a1a",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 16,
            }}
          >
            Join Us
          </p>
          <h2
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 400,
              color: "#faf9f7",
              margin: "0 0 16px",
              lineHeight: 1.25,
            }}
          >
            Start Shopping Today
          </h2>
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.85rem",
              color: "#888",
              marginBottom: 40,
              letterSpacing: "0.03em",
            }}
          >
            Sign up to receive special offers and latest product updates
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "13px 40px",
                background: "#faf9f7",
                color: "#1a1a1a",
                border: "1px solid #faf9f7",
                fontFamily: "sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.25s, color 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#faf9f7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#faf9f7";
                e.currentTarget.style.color = "#1a1a1a";
              }}
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "13px 40px",
                background: "transparent",
                color: "#faf9f7",
                border: "1px solid rgba(255,255,255,0.3)",
                fontFamily: "sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "border-color 0.25s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#faf9f7")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")
              }
            >
              Already Have Account
            </button>
          </div>
        </section>
      )}

      {/* Spinner keyframe — inject once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <ChatBot />
      <Contact />
    </div>
  );
};

export default Home;
