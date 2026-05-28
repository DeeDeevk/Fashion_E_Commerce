import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [formAuthentication, setFormAuthentication] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormAuthentication((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formAuthentication),
      });

      if (response.ok) {
        const result = await response.json();

        if (result && result.result && result.result.token) {
          const token = result.result.token;

          // 1. Save token to localStorage (always do this step)
          localStorage.setItem("accessToken", token);

          // === CHÈN THÊM ĐOẠN NÀY ĐỂ GỘP GIỎ HÀNG NGAY KHI ĐĂNG NHẬP THÀNH CÔNG ===
          await mergeGuestCartToUserCart(token);
          // ======================================================================

          // 2. Decode the token to extract information
          const decodedToken = jwtDecode(token);

          // !!! IMPORTANT: Check your token structure
          // Run console.log to see the token object structure
          console.log("Decoded Token:", decodedToken);

          // 3. Extract role/scope from token
          // Based on your token sample, the permission field might be "scope"
          const userRole = decodedToken.scope;

          toast.success("Login successful!");

          // 5. Navigate based on user role
          if (userRole === "ADMIN") {
            navigate("/admin");
          } else if (userRole === "USER") {
            // Or any on
            navigate("/");
          } else {
            // Redirect to default home page if role is undefined
            navigate("/staff/orders");
          }
        } else {
          toast.error("Login failed: Authentication token not received.");
        }
      } else {
        // If server returns error (e.g., wrong password), response.json() might still contain error info
        let errorData = { message: "Invalid username or password." };
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Could not parse JSON from error response.");
        }
        console.error("Login error:", errorData);
        toast.error(
          `Login failed: ${errorData.message || "Please try again."}`,
        );
      }
    } catch (error) {
      console.error("Network or unknown error:", error);
      toast.error(
        "An error occurred. Please check your network connection and try again.",
      );
    }
  };

  // Hàm gộp giỏ hàng vãng lai vào tài khoản chính thức sau khi đăng nhập
  // Hàm gộp giỏ hàng vãng lai vào tài khoản chính thức sau khi đăng nhập (Đã sửa lỗi vượt tồn kho)
  const mergeGuestCartToUserCart = async (token) => {
    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
    if (guestCart.length === 0) return;

    try {
      // 1. Gọi API lấy thông tin User và lưu vào localStorage
      const resUser = await fetch(`${BASE_URL}/accounts/myinfor`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await resUser.json();
      const loggedInUser = userData.result;

      if (!loggedInUser || !loggedInUser.id) return;
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // 2. Gọi API lấy thông tin Giỏ hàng tổng (Cart) của User
      const resCart = await fetch(
        `${BASE_URL}/carts/account/${loggedInUser.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const cartData = await resCart.json();
      const userCart = cartData.result;

      if (!userCart || !userCart.id) return;

      // ================= BỔ SUNG BƯỚC KIỂM TRA GIỎ HÀNG TRÊN DATABASE =================
      // 3. Lấy toàn bộ danh sách sản phẩm chi tiết đang có sẵn trong giỏ hàng Database của User
      const resDBDetails = await fetch(
        `${BASE_URL}/cart-details/cart/${userCart.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dbCartData = resDBDetails.ok ? await resDBDetails.json() : [];
      const existingDBItems = Array.isArray(dbCartData)
        ? dbCartData
        : dbCartData.result || [];

      // 4. Lặp qua từng sản phẩm trong giỏ hàng vãng lai và gộp có kiểm soát số lượng
      for (const item of guestCart) {
        // Tìm xem sản phẩm cùng size này đã có sẵn trong DB của tài khoản này chưa
        const existingDBItem = existingDBItems.find((dbItem) => {
          const dbProdId = dbItem.productId || dbItem.product?.id;
          const dbSizeName =
            dbItem.sizeName ||
            dbItem.sizeDetail?.sizeName ||
            dbItem.sizeDetail?.size?.nameSize;
          return dbProdId === item.productId && dbSizeName === item.sizeName;
        });

        const dbQty = existingDBItem ? Number(existingDBItem.quantity || 0) : 0;
        const maxStock = Number(item.stock || 0); // Giới hạn tồn kho tối đa được lưu từ ProductDetail

        // Tính toán số lượng tối đa còn có thể nhét thêm vào giỏ hàng tài khoản
        const allowedToAdd = maxStock - dbQty;

        // Nếu giỏ hàng trên DB đã đầy hoặc vượt quá giới hạn tồn kho thì bỏ qua không gộp sản phẩm này nữa
        if (allowedToAdd <= 0) {
          continue;
        }

        // Số lượng thực tế sẽ gửi lên API gộp (Không vượt quá khoảng trống còn lại)
        const finalQtyToAdd = Math.min(
          Number(item.quantity || 0),
          allowedToAdd,
        );

        // Gửi số lượng đã được kiểm soát bảo vệ lên API
        const resAdd = await fetch(`${BASE_URL}/cart-details/add-to-cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.productId,
            cartId: userCart.id,
            sizeDetailId: item.sizeDetailId,
            quantity: finalQtyToAdd,
          }),
        });

        // 5. Nếu gộp chi tiết thành công, cập nhật tổng tiền/số lượng giỏ hàng tổng
        if (resAdd.ok) {
          const cartRequest = {
            quantity: parseInt(finalQtyToAdd),
            totalAmount: item.priceAtTime,
          };
          await fetch(`${BASE_URL}/carts/update/${userCart.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(cartRequest),
          });
        }
      }
      // ===============================================================================

      // Xóa sạch giỏ hàng vãng lai sau khi đồng bộ thành công
      localStorage.removeItem("guestCart");

      // Phát sự kiện cập nhật giao diện toàn hệ thống
      window.dispatchEvent(new Event("cartUpdated"));
      console.log("Merge guest cart successfully with stock limit protection!");
    } catch (error) {
      console.error("Lỗi gộp giỏ hàng vãng lai:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
        {/* Left side - Form */}
        <div className="p-8 md:p-12">
          <h2 className="font-bold text-5xl mb-12">Sign In</h2>

          {/* BẮT ĐẦU THÊM THẺ FORM TẠI ĐÂY */}
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* ... SVG icon ... */}
                <label className="text-gray-700 font-medium">User name:</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 transition"
                  value={formAuthentication.username}
                  onChange={handleChange}
                  placeholder="Username.........."
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* ... SVG icon ... */}
                <label className="text-gray-700 font-medium">Password:</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 transition"
                  value={formAuthentication.password}
                  onChange={handleChange}
                  placeholder="Password..........."
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 items-center mt-2 flex-wrap sm:flex-nowrap">
              <button
                type="submit" // Đổi nút này thành submit cũng được, hoặc để onClick
                className="px-6 py-2 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-500 transition whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition whitespace-nowrap"
                onClick={() => {
                  navigate("/register");
                }}
              >
                Sign Up
              </button>
              <a
                href="#"
                className="text-gray-500 text-sm hover:text-gray-700 whitespace-nowrap sm:ml-auto"
                onClick={() => {
                  navigate("/forget_password");
                }}
              >
                Forget Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-lg bg-black text-white font-bold text-lg hover:bg-gray-800 transition mt-4"
            >
              LOG IN
            </button>
            {/* KẾT THÚC THẺ FORM TẠI ĐÂY */}
          </form>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500 p-12">
          <div className="relative">
            <div className="absolute inset-0 bg-red-300 rounded-full blur-3xl opacity-50"></div>
            <img
              src="https://legiakhanhxd.s3.ap-southeast-1.amazonaws.com/6f1c8330-63ab-4113-ab8c-4ebab755b4a1.jpg"
              alt="Profile"
              className="relative rounded-full w-80 h-80 object-cover border-8 border-white shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
