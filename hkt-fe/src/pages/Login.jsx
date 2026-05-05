import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import * as authService from "../services/auth.service.js";

const Login = () => {
  const navigate = useNavigate();
  const [formAuthentication, setFormAuthentication] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormAuthentication((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(formAuthentication);

      if (result && result.result && result.result.token) {
        const token = result.result.token;

        // 1. Save token to localStorage
        localStorage.setItem("accessToken", token);

        // 2. Decode the token to extract information
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        // 3. Extract role/scope from token
        const userRole = decodedToken.scope;

        toast.success("Đăng nhập thành công!");

        // 4. Dispatch login event for Header to update
        window.dispatchEvent(new Event("login"));

        // 5. Navigate based on user role
        if (userRole === "USER" || userRole === "STAFF") {
          navigate("/");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Đăng nhập thất bại: Không nhận được token xác thực.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Tài khoản hoặc mật khẩu không đúng.";
      toast.error(`Đăng nhập thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
        {/* Left side - Form */}
        <div className="p-8 md:p-12">
          <h2 className="font-bold text-5xl mb-12">Sign In</h2>

          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
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
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
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
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-500 transition whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Sign In"}
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
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forget_password");
                }}
              >
                Forget Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg bg-black text-white font-bold text-lg hover:bg-gray-800 transition mt-4 disabled:opacity-50"
            >
              {loading ? "ĐANG ĐĂNG NHẬP..." : "LOG IN"}
            </button>
          </form>
        </div>

        {/* Right side - Gradient */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500 p-12">
          <div className="text-center text-white">
            <h3 className="text-4xl font-bold mb-4">HKT STUDIO</h3>
            <p className="text-lg opacity-90">Welcome back! Please sign in to continue.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
