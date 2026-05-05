// components/UserOnlyRoute.jsx
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const UserOnlyRoute = ({ children }) => {
    const token = localStorage.getItem("accessToken");

    // Nếu chưa đăng nhập → cho phép vào (các trang public)
    if (!token) {
        return children;
    }

    try {
        const decoded = jwtDecode(token);
        const role = decoded.scope || decoded.role || decoded.authorities?.[0];

        // Chặn Admin truy cập vào các trang dành cho người dùng thường
        if (role === "ADMIN") {
            alert("Access denied. Administrators cannot access user pages.");
            return <Navigate to="/login" replace />;
        }

        // Nếu là USER hoặc STAFF → cho vào
        return children;
    } catch (error) {
        console.error("Invalid or expired token:", error);
        localStorage.removeItem("accessToken");
        alert("Your session has expired or is invalid. Please log in again.");
        return <Navigate to="/login" replace />;
    }
};

export default UserOnlyRoute;
