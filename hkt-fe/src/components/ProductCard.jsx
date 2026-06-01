// ProductCard.jsx
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import WishlistSelectorModal from "./WishListSelector";

const ProductCard = ({
  product,
  isHot = false,
  isNew = false,
  viewMode = "grid",
  isInWishlist = false,
  onWishlistChange,
}) => {
  const navigate = useNavigate();
  const [isInAnyWishlist, setIsInAnyWishlist] = useState(isInWishlist);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  useEffect(() => {
    setIsInAnyWishlist(isInWishlist);
  }, [isInWishlist]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isSoldOut = product.quantity === 0;

  const goToDetail = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const openWishlistModal = (e) => {
    e.stopPropagation();
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }
    setShowWishlistModal(true);
  };

  const closeWishlistModal = () => {
    setShowWishlistModal(false);
  };

  const handleWishlistSuccess = (added) => {
    setIsInAnyWishlist(added);
    onWishlistChange?.(product.id, added);
  };

  // ── LIST VIEW ──
  if (viewMode === "list") {
    return (
      <>
        <div
          onClick={goToDetail}
          style={{
            display: "flex",
            gap: 24,
            padding: "20px 0",
            borderBottom: "1px solid #e8e4df",
            cursor: "pointer",
            background: "transparent",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#faf9f7")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {/* Image */}
          <div
            style={{
              position: "relative",
              width: 140,
              height: 175,
              flexShrink: 0,
              overflow: "hidden",
              background: "#f0ece6",
            }}
          >
            <img
              src={product.imageUrlFront}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
                display: "block",
              }}
              className="list-prod-img"
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />

            {isSoldOut && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(250,249,247,0.78)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#1a1a1a",
                    border: "1px solid #1a1a1a",
                    padding: "5px 12px",
                  }}
                >
                  Sold Out
                </span>
              </div>
            )}

            {!isSoldOut && product.discountAmount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  background: "#1a1a1a",
                  color: "#faf9f7",
                  fontFamily: "sans-serif",
                  fontSize: "0.58rem",
                  letterSpacing: "0.1em",
                  padding: "3px 8px",
                }}
              >
                -{product.discountAmount}%
              </span>
            )}
          </div>

          {/* Info */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <div>
              {/* Badges */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {isHot && !isSoldOut && (
                  <span
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "0.58rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#c8a96e",
                      border: "1px solid #c8a96e",
                      padding: "2px 8px",
                    }}
                  >
                    Hot
                  </span>
                )}
                {!isHot && isNew && !isSoldOut && (
                  <span
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "0.58rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#888",
                      border: "1px solid #ccc",
                      padding: "2px 8px",
                    }}
                  >
                    New
                  </span>
                )}
              </div>

              <h3
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "1.1rem",
                  fontWeight: 400,
                  lineHeight: 1.4,
                  margin: "0 0 12px",
                  color: "#1a1a1a",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product.name}
              </h3>

              {/* Stars */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="12"
                      height="12"
                      viewBox="0 0 20 20"
                      fill={
                        i < Math.floor(product.rating || 4.5)
                          ? "#c8a96e"
                          : "#e0dbd4"
                      }
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "0.72rem",
                    color: "#aaa",
                    letterSpacing: "0.03em",
                  }}
                >
                  {product.rating || 4.5}
                </span>
              </div>
            </div>

            {/* Price + Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid #e8e4df",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  {formatPrice(product.costPrice)}
                </p>
                {!isSoldOut && product.discountAmount > 0 && (
                  <p
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "0.75rem",
                      color: "#bbb",
                      textDecoration: "line-through",
                      margin: "2px 0 0",
                    }}
                  >
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Wishlist */}
                <button
                  onClick={openWishlistModal}
                  style={{
                    width: 38,
                    height: 38,
                    border: `1px solid ${isInAnyWishlist ? "#1a1a1a" : "#d0cbc4"}`,
                    background: isInAnyWishlist ? "#1a1a1a" : "transparent",
                    color: isInAnyWishlist ? "#faf9f7" : "#888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition:
                      "background 0.2s, border-color 0.2s, color 0.2s",
                    borderRadius: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isInAnyWishlist) {
                      e.currentTarget.style.borderColor = "#1a1a1a";
                      e.currentTarget.style.color = "#1a1a1a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isInAnyWishlist) {
                      e.currentTarget.style.borderColor = "#d0cbc4";
                      e.currentTarget.style.color = "#888";
                    }
                  }}
                >
                  <Heart
                    size={16}
                    fill={isInAnyWishlist ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                </button>

                {/* Detail / Cart */}
                <button
                  onClick={goToDetail}
                  style={{
                    height: 38,
                    padding: "0 20px",
                    background: "#1a1a1a",
                    color: "#faf9f7",
                    border: "1px solid #1a1a1a",
                    fontFamily: "sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.2s, color 0.2s",
                    borderRadius: 0,
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
                  <ShoppingCart size={14} strokeWidth={1.5} />
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        {showWishlistModal && (
          <WishlistSelectorModal
            productId={product.id}
            isOpen={showWishlistModal}
            onClose={closeWishlistModal}
            onSuccess={handleWishlistSuccess}
          />
        )}
      </>
    );
  }

  // ── GRID VIEW ──
  return (
    <>
      <div
        onClick={goToDetail}
        style={{ cursor: "pointer", position: "relative" }}
        onMouseEnter={(e) => {
          const img = e.currentTarget.querySelector(".grid-prod-img");
          if (img) img.style.transform = "scale(1.04)";
        }}
        onMouseLeave={(e) => {
          const img = e.currentTarget.querySelector(".grid-prod-img");
          if (img) img.style.transform = "scale(1)";
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
            className="grid-prod-img"
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

          {/* Sold Out overlay */}
          {isSoldOut && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(250,249,247,0.78)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#1a1a1a",
                  border: "1px solid #1a1a1a",
                  padding: "5px 12px",
                }}
              >
                Sold Out
              </span>
            </div>
          )}

          {/* Discount badge */}
          {!isSoldOut && product.discountAmount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "#1a1a1a",
                color: "#faf9f7",
                fontFamily: "sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.1em",
                padding: "3px 8px",
              }}
            >
              -{product.discountAmount}%
            </span>
          )}

          {/* Hot / New badge */}
          {isHot && !isSoldOut && (
            <span
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontFamily: "sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#c8a96e",
                border: "1px solid #c8a96e",
                padding: "3px 8px",
                background: "rgba(250,249,247,0.9)",
              }}
            >
              Hot
            </span>
          )}
          {!isHot && isNew && !isSoldOut && (
            <span
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontFamily: "sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#888",
                border: "1px solid #ccc",
                padding: "3px 8px",
                background: "rgba(250,249,247,0.9)",
              }}
            >
              New
            </span>
          )}

          {/* Wishlist heart — bottom right, appears on hover */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              zIndex: 20,
            }}
          >
            <button
              onClick={openWishlistModal}
              style={{
                width: 34,
                height: 34,
                border: `1px solid ${isInAnyWishlist ? "#1a1a1a" : "rgba(255,255,255,0.7)"}`,
                background: isInAnyWishlist
                  ? "#1a1a1a"
                  : "rgba(250,249,247,0.85)",
                color: isInAnyWishlist ? "#faf9f7" : "#888",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 0,
                opacity: isInAnyWishlist ? 1 : 0,
                transition: "opacity 0.25s, background 0.2s, color 0.2s",
              }}
              className="wishlist-btn"
              onMouseEnter={(e) => {
                if (!isInAnyWishlist) {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.color = "#faf9f7";
                  e.currentTarget.style.borderColor = "#1a1a1a";
                }
              }}
              onMouseLeave={(e) => {
                if (!isInAnyWishlist) {
                  e.currentTarget.style.background = "rgba(250,249,247,0.85)";
                  e.currentTarget.style.color = "#888";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
                }
              }}
            >
              <Heart
                size={14}
                fill={isInAnyWishlist ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingTop: 14 }}>
          <h3
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "0.88rem",
              fontWeight: 400,
              margin: "0 0 8px",
              lineHeight: 1.45,
              color: "#1a1a1a",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.6em",
            }}
          >
            {product.name}
          </h3>

          {/* Stars */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="11"
                  height="11"
                  viewBox="0 0 20 20"
                  fill={
                    i < Math.floor(product.rating || 4.5)
                      ? "#c8a96e"
                      : "#e0dbd4"
                  }
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.7rem",
                color: "#aaa",
              }}
            >
              {product.rating || 4.5}
            </span>
          </div>

          {/* Price + Cart */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                {formatPrice(product.costPrice)}
              </p>
              {!isSoldOut && product.discountAmount > 0 && (
                <p
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "0.72rem",
                    color: "#bbb",
                    textDecoration: "line-through",
                    margin: "2px 0 0",
                  }}
                >
                  {formatPrice(product.price)}
                </p>
              )}
            </div>

            <button
              onClick={goToDetail}
              style={{
                width: 34,
                height: 34,
                background: "#1a1a1a",
                color: "#faf9f7",
                border: "1px solid #1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                borderRadius: 0,
                flexShrink: 0,
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
              <ShoppingCart size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* CSS để wishlist-btn hiện khi hover card */}
      <style>{`
        div:hover > div > .wishlist-btn {
          opacity: 1 !important;
        }
      `}</style>

      {showWishlistModal && (
        <WishlistSelectorModal
          productId={product.id}
          isOpen={showWishlistModal}
          onClose={closeWishlistModal}
          onSuccess={handleWishlistSuccess}
        />
      )}
    </>
  );
};

export default ProductCard;
