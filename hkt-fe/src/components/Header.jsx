import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Menu, X, LogOut } from "lucide-react";
import { logout as authLogout } from "../services/auth.service.js";
import * as accountService from "../services/account.service.js";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Session management — clear token on new browser session
  useEffect(() => {
    const sessionAlive = sessionStorage.getItem("session_alive");

    if (!sessionAlive) {
      localStorage.removeItem("accessToken");
      sessionStorage.setItem("session_alive", "true");
    }
  }, []);

  // Check auth state
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

  // Fetch user info when logged in
  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoggedIn) {
        setUser(null);
        return;
      }
      try {
        const userData = await accountService.getMyInfo();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUser();
  }, [isLoggedIn]);

  const handleLogout = () => {
    authLogout();
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight">
              HKT <span className="text-red-500">STUDIO</span>
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
              to="/profile"
              className={`font-bold text-lg transition ${
                isActive("/profile")
                  ? "text-red-500"
                  : "text-gray-800 hover:text-red-500"
              }`}
            >
              Profile
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Auth */}
            {isLoggedIn ? (
              <>
                <div className="relative group">
                  <button className="text-gray-600 hover:text-red-500 transition">
                    <User size={26} strokeWidth={2} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      Profile
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
              </>
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
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className={`font-bold text-base py-2 transition flex items-center justify-between ${
                  isActive("/profile")
                    ? "text-red-500"
                    : "text-gray-800 hover:text-red-500"
                }`}
              >
                Profile{" "}
                {isActive("/profile") && (
                  <span className="text-red-500">•</span>
                )}
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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
