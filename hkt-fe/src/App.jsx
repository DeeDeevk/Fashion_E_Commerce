import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Layout from "./components/Layout";
import UserOnlyRoute from "./components/UserOnlyRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Toaster richColors closeButton position="top-right" />

      <Routes>
        {/* Trang dành cho User — có Header/Footer */}
        <Route
          element={
            <UserOnlyRoute>
              <Layout />
            </UserOnlyRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Trang Public — không có Header/Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget_password" element={<ForgotPassword />} />
        <Route path="/reset_password" element={<ResetPassword />} />

        {/* 404 → redirect về Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
