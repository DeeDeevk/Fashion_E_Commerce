import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  CardSim,
} from "lucide-react";

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
// --- CHÈN THÊM ĐOẠN NÀY ĐỂ QUẢN LÝ SỐ LƯỢNG GIỎ HÀNG ---
    const [cartCount, setCartCount] = useState(0);

    // const fetchCartCount = async () => {
    //     try {
    //         const cartId = localStorage.getItem("cartId") || 3; // Lấy cartId từ localStorage hoặc mặc định là 3 như API của bạn
    //         const token = localStorage.getItem("accessToken");
    //
    //         const res = await fetch(`http://localhost:8080/cart-details/cart/${cartId}`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //
    //         if (res.ok) {
    //             const data = await res.json();
    //             // Tính tổng số lượng (quantity) của tất cả sản phẩm trong giỏ
    //             const total = data.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    //             setCartCount(total);
    //         }
    //     } catch (err) {
    //         console.error("Lỗi cập nhật số lượng giỏ hàng tại Header:", err);
    //     }
    // };

    // const fetchCartCount = async () => {
    //     const token = localStorage.getItem("accessToken");
    //
    //     if (token) {
    //         // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> Gọi API lấy dữ liệu từ Database
    //         try {
    //             const cartId = localStorage.getItem("cartId") || 3; // Lấy từ localStorage hoặc mặc định bằng 3
    //             const res = await fetch(`http://localhost:8080/cart-details/cart/${cartId}`, {
    //                 headers: {
    //                     "Authorization": `Bearer ${token}`
    //                 }
    //             });
    //             if (res.ok) {
    //                 const data = await res.json();
    //                 // Cộng tổng quantity của toàn bộ sản phẩm trong giỏ hàng thật
    //                 const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);
    //                 setCartCount(totalQty);
    //             }
    //         } catch (error) {
    //             console.error("Lỗi khi lấy số lượng giỏ hàng thành viên:", error);
    //         }
    //     } else {
    //         // TRƯỜNG HỢP 2: KHÁCH VÃNG LAI -> Tính tổng quantity trực tiếp từ LocalStorage
    //         const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
    //         const totalQty = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    //         setCartCount(totalQty);
    //     }
    // };


    // --------------------------------------------------------
  useEffect(() => {
    const sessionAlive = sessionStorage.getItem("session_alive");

    if (!sessionAlive) {
      // Tab mới hoặc browser vừa bật → logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Đánh dấu phiên đang hoạt động
      sessionStorage.setItem("session_alive", "true");

      console.log("Tab/browser mới → auto logout");
    } else {
      console.log("Reload hoặc chuyển trang → giữ trạng thái đăng nhập");
    }
  }, []);

    const fetchCartCount = async () => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> Lấy tổng số lượng (totalQuantity) trực tiếp từ giỏ hàng User
            try {
                // Lấy User từ localStorage để đảm bảo có ID mới nhất
                const storedUser = JSON.parse(localStorage.getItem("user"));

                if (storedUser && storedUser.id) {
                    const res = await fetch(`http://localhost:8080/carts/account/${storedUser.id}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        // Kế thừa ưu điểm từ đoạn code cũ bạn khóa: Lấy trực tiếp totalQuantity
                        setCartCount(data.result?.totalQuantity || 0);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy số lượng giỏ hàng thành viên:", error);
            }
        } else {
            // TRƯỜNG HỢP 2: KHÁCH VÃNG LAI -> Tính tổng quantity trực tiếp từ LocalStorage
            const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

            // Ép kiểu Number() để chống lỗi cộng nối chuỗi thành "011"
            const totalQty = guestCart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            setCartCount(totalQty);
        }
    };

    useEffect(() => {
        // Chạy lần đầu tiên khi Header render
        fetchCartCount();

        // Lắng nghe sự kiện (Được trigger khi Thêm/Sửa/Xóa/Gộp giỏ hàng)
        window.addEventListener("cartUpdated", fetchCartCount);
        window.addEventListener("storage", fetchCartCount);

        // Hủy lắng nghe khi Component bị dỡ bỏ
        return () => {
            window.removeEventListener("cartUpdated", fetchCartCount);
            window.removeEventListener("storage", fetchCartCount);
        };
    }, []);

// // useEffect chuyên trách cập nhật số lượng giỏ hàng real-time
//     useEffect(() => {
//         // Chạy lần đầu tiên khi Header vừa hiển thị
//         fetchCartCount();
//
//         // Lắng nghe sự kiện "cartUpdated" khi có thao tác Thêm/Sửa/Xóa từ trang chi tiết hoặc trang giỏ hàng
//         window.addEventListener("cartUpdated", fetchCartCount);
//
//         // Lắng nghe thay đổi trạng thái đăng nhập/đăng xuất giữa các tabs/cửa sổ
//         window.addEventListener("storage", fetchCartCount);
//
//         // Hủy lắng nghe khi Header bị hủy (tránh leak bộ nhớ)
//         return () => {
//             window.removeEventListener("cartUpdated", fetchCartCount);
//             window.removeEventListener("storage", fetchCartCount);
//         };
//     }, []);
//     // Khởi chạy lấy số lượng khi load trang và lắng nghe sự kiện đồng bộ dữ liệu giữa các trang
//     useEffect(() => {
//         fetchCartCount();
//         window.addEventListener("cartUpdated", fetchCartCount);
//         return () => window.removeEventListener("cartUpdated", fetchCartCount);
//     }, []);
  // Kiểm tra đăng nhập
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
  //lay thong tin gio hang
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [cart, setCart] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`http://localhost:8080/accounts/myinfor`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("Tài khoản đang login: ", data.result);
      setUser(data.result);
        // BẮT BUỘC PHẢI CÓ DÒNG NÀY: Để lưu user info dùng cho việc đếm giỏ hàng
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
      const res = await fetch(
        `http://localhost:8080/carts/account/${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log("Cart của user: ", data.result);
      setCart(data.result);
    } catch (error) {
      console.error("Lỗi fetch cart: ", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    const handleCartUpdated = () => {
      if (user?.id) {
        fetchCart();
      }
    };
    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => window.removeEventListener("cartUpdated", handleCartUpdated);
  },[user]);

  // Đóng dropdown khi click ngoài
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

  // Tìm kiếm sản phẩm
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 1) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:8080/products`);
        if (response.ok) {
          const data = await response.json();
          const filtered = (data.result || [])
            .filter((product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        localStorage.removeItem("user"); // BỔ SUNG: Xóa sạch thông tin user để tránh xung đột dữ liệu cũ

        setIsLoggedIn(false);

        // BỔ SUNG QUAN TRỌNG: Bắn sự kiện "cartUpdated" để hàm fetchCartCount() lập tức chạy lại,
        // chuyển số lượng hiển thị về giỏ hàng tạm của Guest (bằng 0 hoặc giỏ guest cũ nếu có).
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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight">
              H<span className="text-red-500">K</span>T STUDIO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            <Link
              to="/"
              className={`font-bold text-lg transition ${
                isActive("/")
                  ? "text-red-500"
                  : "text-gray-800 hover:text-red-500"
              }`}
            >
              Home
            </Link>
            <Link
              to="/product"
              className={`font-bold text-lg transition ${
                isActive("/product")
                  ? "text-red-500"
                  : "text-gray-800 hover:text-red-500"
              }`}
            >
              Product
            </Link>
            <Link
              to="/about"
              className={`font-bold text-lg transition ${
                isActive("/about")
                  ? "text-red-500"
                  : "text-gray-800 hover:text-red-500"
              }`}
            >
              About Us
            </Link>
            <Link
              to="/policy"
              className={`font-bold text-lg transition ${
                isActive("/policy")
                  ? "text-red-500"
                  : "text-gray-800 hover:text-red-500"
              }`}
            >
              Policy
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Search Bar with Dropdown */}
            <div className="relative hidden sm:block" ref={searchRef}>
              {searchOpen ? (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search product..."
                    className="border border-gray-300 rounded-full px-5 py-2.5 w-48 lg:w-64 focus:outline-none focus:border-red-500 text-base pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-gray-600 hover:text-red-500 transition"
                >
                  <Search size={26} strokeWidth={2} />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full mt-2 w-80 lg:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50"
                >
                  {isSearching && (
                    <div className="p-4 text-center text-gray-500">
                      Đang tìm kiếm...
                    </div>
                  )}

                  {!isSearching &&
                    searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={product.imageUrlFront}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                              {product.name}
                            </h4>
                            {/* SOLD OUT BADGE */}
                            {product.quantity === 0 && (
                              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <p className="text-red-500 font-bold text-sm mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Auth */}
              {/* --- ĐOẠN ĐÃ SỬA: TÁCH BIỆT GIỎ HÀNG RA NGOÀI ĐIỀU KIỆN AUTH --- */}
              {isLoggedIn ? (
                  <div className="relative group">
                      <button className="text-gray-600 hover:text-red-500 transition">
                          <User size={26} strokeWidth={2} />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg">
                              Profile
                          </Link>
                          <Link to="/wishlists" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                              Wish List
                          </Link>
                          <Link
                              to="/orders"
                              onClick={() => localStorage.setItem("userId", user.id)}
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                              My Orders
                          </Link>
                          <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
                          >
                              <LogOut size={16} />
                              Logout
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="hidden sm:flex items-center gap-3">
                      <Link
                          to="/login"
                          className="px-5 py-2.5 bg-black text-white rounded-full font-medium text-sm hover:bg-red-500 transition"
                      >
                          Sign In
                      </Link>
                      <Link
                          to="/register"
                          className="px-5 py-2.5 border border-black text-black rounded-full font-medium text-sm hover:bg-black hover:text-white transition"
                      >
                          Sign Up
                      </Link>
                  </div>
              )}

              {/* ĐƯA GIỎ HÀNG RA ĐÂY (Luôn hiển thị song song cạnh cụm Login/User) */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-red-500 transition flex items-center justify-center">
                  <ShoppingCart size={26} strokeWidth={2} />

                  {/* Chấm đỏ Badge số lượng tự động nhảy số */}
                  {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px] h-[18px] shadow-sm border border-white animate-pulse">
                  {cartCount}
                </span>
                  )}
              </Link>
              {/* ------------------------------------------------------------- */}

            {/*{isLoggedIn ? (*/}
            {/*  <>*/}
            {/*    <div className="relative group">*/}
            {/*      <button className="text-gray-600 hover:text-red-500 transition">*/}
            {/*        <User size={26} strokeWidth={2} />*/}
            {/*      </button>*/}
            {/*      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">*/}
            {/*        <Link*/}
            {/*          to="/profile"*/}
            {/*          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"*/}
            {/*        >*/}
            {/*          Profile*/}
            {/*        </Link>*/}
            {/*        <Link*/}
            {/*          to="/wishlists"*/}
            {/*          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"*/}
            {/*        >*/}
            {/*          Wish List*/}
            {/*        </Link>*/}
            {/*        <Link*/}
            {/*          to="/orders"*/}
            {/*          onClick={() => {*/}
            {/*            localStorage.setItem("userId", user.id);*/}
            {/*          }}*/}
            {/*          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"*/}
            {/*        >*/}
            {/*          My Orders*/}
            {/*        </Link>*/}
            {/*        <button*/}
            {/*          onClick={handleLogout}*/}
            {/*          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"*/}
            {/*        >*/}
            {/*          <LogOut size={16} />*/}
            {/*          Logout*/}
            {/*        </button>*/}
            {/*      </div>*/}
            {/*    </div>*/}


                {/*<button*/}
                {/*  onClick={() => navigate("/cart")}*/}
                {/*  className="text-gray-600 hover:text-red-500 transition relative"*/}
                {/*>*/}
                {/*  <ShoppingCart size={26} strokeWidth={2} />*/}
                {/*  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">*/}
                {/*    {cart?.totalQuantity}*/}
                {/*  </span>*/}
                {/*</button>*/}

                  {/* Bọc icon giỏ hàng bằng Link chuyển trang, bắt buộc có lớp relative */}
    {/*              <Link*/}
    {/*                  to="/cart"*/}
    {/*                  className="relative p-2 text-gray-700 hover:text-black transition-colors flex items-center justify-center"*/}
    {/*              >*/}
    {/*                  /!* Icon giỏ hàng từ thư viện lucide-react *!/*/}
    {/*                  <ShoppingCart size={24} />*/}

    {/*                  /!* Chỉ hiển thị vòng tròn đỏ CHỨA SỐ nếu số lượng lớn hơn 0 *!/*/}
    {/*                  {cartCount > 0 && (*/}
    {/*                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-white animate-pulse">*/}
    {/*  {cartCount}*/}
    {/*</span>*/}
    {/*                  )}*/}
    {/*              </Link>*/}


    {/*              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-black transition flex items-center justify-center">*/}
    {/*                  <ShoppingCart size={24} />*/}

    {/*                  /!* Chấm đỏ Badge hiển thị số lượng, tự động ẩn nếu giỏ hàng bằng 0 *!/*/}
    {/*                  {cartCount > 0 && (*/}
    {/*                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[18px] h-[18px] shadow-sm">*/}
    {/*  {cartCount}*/}
    {/*</span>*/}
    {/*                  )}*/}
    {/*              </Link>*/}
    {/*          </>*/}
    {/*        ) : (*/}
    {/*          <div className="hidden sm:flex items-center gap-3">*/}
    {/*            <Link*/}
    {/*              to="/login"*/}
    {/*              className="px-5 py-2.5 bg-black text-white rounded-full font-medium text-sm hover:bg-red-500 transition"*/}
    {/*            >*/}
    {/*              Sign In*/}
    {/*            </Link>*/}
    {/*            <Link*/}
    {/*              to="/register"*/}
    {/*              className="px-5 py-2.5 border border-black text-black rounded-full font-medium text-sm hover:bg-black hover:text-white transition"*/}
    {/*            >*/}
    {/*              Sign Up*/}
    {/*            </Link>*/}
    {/*          </div>*/}
    {/*        )}*/}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-600 hover:text-red-500 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X size={28} strokeWidth={2} />
              ) : (
                <Menu size={28} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className={`font-bold text-base py-2 transition flex items-center justify-between ${
                  isActive("/")
                    ? "text-red-500"
                    : "text-gray-800 hover:text-red-500"
                }`}
              >
                Home {isActive("/") && <span className="text-red-500">•</span>}
              </Link>

              <Link
                to="/product"
                onClick={() => setMenuOpen(false)}
                className={`font-bold text-base py-2 transition flex items-center justify-between ${
                  isActive("/product")
                    ? "text-red-500"
                    : "text-gray-800 hover:text-red-500"
                }`}
              >
                Product{" "}
                {isActive("/product") && (
                  <span className="text-red-500">•</span>
                )}
              </Link>

              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className={`font-bold text-base py-2 transition flex items-center justify-between ${
                  isActive("/about")
                    ? "text-red-500"
                    : "text-gray-800 hover:text-red-500"
                }`}
              >
                About Us{" "}
                {isActive("/about") && <span className="text-red-500">•</span>}
              </Link>

              <Link
                to="/policy"
                onClick={() => setMenuOpen(false)}
                className={`font-bold text-base py-2 transition flex items-center justify-between ${
                  isActive("/policy")
                    ? "text-red-500"
                    : "text-gray-800 hover:text-red-500"
                }`}
              >
                Policy{" "}
                {isActive("/policy") && <span className="text-red-500">•</span>}
              </Link>

              {/* Mobile Auth */}
              {!isLoggedIn && (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 bg-black text-white rounded-full font-medium text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 border border-black text-black rounded-full font-medium text-center hover:bg-black hover:text-white transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {isLoggedIn && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-700 font-bold hover:text-red-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block py-2 text-gray-700 font-bold hover:text-red-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-red-600 font-bold flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}

              {/* Mobile Search */}
              <div className="sm:hidden pt-2">
                <input
                  type="text"
                  placeholder="Search product..."
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:border-red-500 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {showDropdown && searchResults.length > 0 && (
                  <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          handleProductClick(product.id);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={product.imageUrlFront}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-xs line-clamp-2 flex-1">
                              {product.name}
                            </h4>
                            {/* SOLD OUT BADGE - MOBILE */}
                            {product.quantity === 0 && (
                              <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <p className="text-red-500 font-bold text-xs mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
