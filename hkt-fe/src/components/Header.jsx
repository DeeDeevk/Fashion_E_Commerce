import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User, ShoppingCart, Menu, X, LogOut } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const sessionAlive = sessionStorage.getItem("session_alive");
    if (!sessionAlive) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.setItem("session_alive", "true");
    }
  }, []);

  const fetchCartCount = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.id) {
          const res = await fetch(
            `${BASE_URL}/carts/account/${storedUser.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            const data = await res.json();
            setCartCount(data.result?.totalQuantity || 0);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy số lượng giỏ hàng thành viên:", error);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      const totalQty = guestCart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      );
      setCartCount(totalQty);
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    window.addEventListener("storage", fetchCartCount);
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
      window.removeEventListener("storage", fetchCartCount);
    };
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("login", checkAuth);
    window.addEventListener("logout", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("login", checkAuth);
      window.removeEventListener("logout", checkAuth);
    };
  }, []);

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
      if (data.result && data.result.id) {
        localStorage.setItem("user", JSON.stringify(data.result));
      }
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
    if (user?.id) fetchCart();
  }, [user]);

  useEffect(() => {
    const handleCartUpdated = () => {
      if (user?.id) fetchCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => window.removeEventListener("cartUpdated", handleCartUpdated);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 1) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(`${BASE_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          const filtered = (data.result || [])
            .filter((product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .slice(0, 5);
          setSearchResults(filtered);
          setShowDropdown(filtered.length > 0);
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("logout"));
    navigate("/");
  };

  const handleProductClick = (productId) => {
    setSearchQuery("");
    setShowDropdown(false);
    setSearchOpen(false);
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/product", label: "Product" },
    { to: "/about", label: "About Us" },
    { to: "/policy", label: "Policy" },
  ];

  return (
    <header
      style={{
        background: "#faf9f7",
        borderBottom: "1px solid #e8e4df",
        position: "sticky",
        top: 0,
        zIndex: 50,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "1.25rem",
              fontWeight: 400,
              letterSpacing: "0.12em",
              color: "#1a1a1a",
            }}
          >
            HK<span style={{ color: "#c8a96e" }}>T</span> STUDIO
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}
          className="desktop-nav"
        >
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                textDecoration: "none",
                fontSize: "0.72rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: isActive(to) ? "#1a1a1a" : "#888",
                borderBottom: isActive(to)
                  ? "1px solid #1a1a1a"
                  : "1px solid transparent",
                paddingBottom: 2,
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isActive(to)) e.currentTarget.style.color = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                if (!isActive(to)) e.currentTarget.style.color = "#888";
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Search */}
          <div
            style={{ position: "relative" }}
            ref={searchRef}
            className="search-desktop"
          >
            {searchOpen ? (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    border: "none",
                    borderBottom: "1px solid #1a1a1a",
                    background: "transparent",
                    padding: "4px 28px 4px 0",
                    width: 180,
                    fontSize: "0.8rem",
                    letterSpacing: "0.04em",
                    outline: "none",
                    color: "#1a1a1a",
                    fontFamily: "sans-serif",
                  }}
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                  style={{
                    position: "absolute",
                    right: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#888",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#888",
                  display: "flex",
                  padding: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
            )}

            {/* Search Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 12,
                  width: 320,
                  background: "#faf9f7",
                  border: "1px solid #e8e4df",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  zIndex: 100,
                  maxHeight: 380,
                  overflowY: "auto",
                }}
              >
                {searchResults.map((product, idx) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      background: "none",
                      border: "none",
                      borderBottom:
                        idx < searchResults.length - 1
                          ? "1px solid #e8e4df"
                          : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f0ece6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <img
                      src={product.imageUrlFront}
                      alt={product.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Georgia', serif",
                            fontSize: "0.82rem",
                            margin: 0,
                            color: "#1a1a1a",
                          }}
                        >
                          {product.name}
                        </p>
                        {product.quantity === 0 && (
                          <span
                            style={{
                              fontSize: "0.6rem",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: "#888",
                              border: "1px solid #ccc",
                              padding: "2px 6px",
                              flexShrink: 0,
                            }}
                          >
                            Sold Out
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#888",
                          margin: "4px 0 0",
                          fontFamily: "sans-serif",
                        }}
                      >
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {isLoggedIn ? (
            <div style={{ position: "relative" }} className="user-menu-wrap">
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#888",
                  display: "flex",
                  padding: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
              >
                <User size={20} strokeWidth={1.5} />
              </button>
              <div
                className="user-dropdown"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 12px)",
                  width: 180,
                  background: "#faf9f7",
                  border: "1px solid #e8e4df",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  zIndex: 100,
                  opacity: 0,
                  visibility: "hidden",
                  transition: "opacity 0.2s, visibility 0.2s",
                }}
              >
                {[
                  { to: "/profile", label: "Profile" },
                  { to: "/wishlists", label: "Wish List" },
                  {
                    to: "/orders",
                    label: "My Orders",
                    onClick: () => localStorage.setItem("userId", user?.id),
                  },
                ].map(({ to, label, onClick }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClick}
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#888",
                      textDecoration: "none",
                      borderBottom: "1px solid #e8e4df",
                      transition: "color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#1a1a1a";
                      e.currentTarget.style.background = "#f0ece6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#888";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#888",
                    cursor: "pointer",
                    transition: "color 0.15s, background 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#1a1a1a";
                    e.currentTarget.style.background = "#f0ece6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#888";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", alignItems: "center", gap: 10 }}
              className="auth-buttons"
            >
              <Link
                to="/login"
                style={{
                  padding: "8px 20px",
                  background: "#1a1a1a",
                  color: "#faf9f7",
                  textDecoration: "none",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#333")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#1a1a1a")
                }
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "8px 20px",
                  background: "transparent",
                  color: "#1a1a1a",
                  textDecoration: "none",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  border: "1px solid #1a1a1a",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.color = "#faf9f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1a1a1a";
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              color: "#888",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -8,
                  background: "#1a1a1a",
                  color: "#faf9f7",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  minWidth: 16,
                  height: 16,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  letterSpacing: 0,
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger */}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#888",
              display: "none",
              padding: 0,
            }}
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <Menu size={22} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            background: "#faf9f7",
            borderTop: "1px solid #e8e4df",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                style={{
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: isActive(to) ? "#1a1a1a" : "#888",
                  padding: "14px 0",
                  borderBottom: "1px solid #e8e4df",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {label}
                {isActive(to) && (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#c8a96e",
                    }}
                  />
                )}
              </Link>
            ))}

            {!isLoggedIn && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 20,
                }}
              >
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: "12px",
                    background: "#1a1a1a",
                    color: "#faf9f7",
                    textDecoration: "none",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: "12px",
                    background: "transparent",
                    color: "#1a1a1a",
                    textDecoration: "none",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    border: "1px solid #1a1a1a",
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {isLoggedIn && (
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
                {[
                  { to: "/profile", label: "Profile" },
                  { to: "/wishlists", label: "Wish List" },
                  { to: "/orders", label: "My Orders" },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      padding: "12px 0",
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#888",
                      textDecoration: "none",
                      borderBottom: "1px solid #e8e4df",
                    }}
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  style={{
                    padding: "12px 0",
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#888",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    textAlign: "left",
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}

            {/* Mobile Search */}
            <div style={{ marginTop: 20 }}>
              <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  borderBottom: "1px solid #1a1a1a",
                  background: "transparent",
                  padding: "8px 0",
                  fontSize: "0.8rem",
                  letterSpacing: "0.04em",
                  outline: "none",
                  color: "#1a1a1a",
                  fontFamily: "sans-serif",
                  boxSizing: "border-box",
                }}
              />
              {showDropdown && searchResults.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    border: "1px solid #e8e4df",
                    background: "#faf9f7",
                  }}
                >
                  {searchResults.map((product, idx) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        handleProductClick(product.id);
                        setMenuOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        background: "none",
                        border: "none",
                        borderBottom:
                          idx < searchResults.length - 1
                            ? "1px solid #e8e4df"
                            : "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <img
                        src={product.imageUrlFront}
                        alt={product.name}
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                      />
                      <div>
                        <p
                          style={{
                            fontFamily: "'Georgia', serif",
                            fontSize: "0.78rem",
                            margin: 0,
                            color: "#1a1a1a",
                          }}
                        >
                          {product.name}
                        </p>
                        <p
                          style={{
                            fontSize: "0.7rem",
                            color: "#888",
                            margin: "2px 0 0",
                          }}
                        >
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for hover states and responsive */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .auth-buttons { display: none !important; }
          .search-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        .user-menu-wrap:hover .user-dropdown {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>
    </header>
  );
}
