import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as authService from "../services/auth.service.js";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("resetToken");
    if (!token) {
      toast.warning("Vui lòng thực hiện yêu cầu quên mật khẩu trước!");
      navigate("/forget_password");
    }
  }, [navigate]);

  const handleResetSubmit = async () => {
    if (!otp || !newPassword) { toast.warning("Vui lòng nhập đầy đủ OTP và mật khẩu mới."); return; }
    const token = sessionStorage.getItem("resetToken");
    setLoading(true);
    try {
      const data = await authService.resetPassword({ token, otp, newPassword });
      if (data?.code === 0) {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        sessionStorage.removeItem("resetToken");
        sessionStorage.removeItem("otp");
        navigate("/login");
      } else {
        toast.error(data?.result || "OTP không đúng hoặc đã hết hạn!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi kết nối server!");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
        <div className="p-8 md:p-12">
          <h2 className="font-bold text-4xl mb-3">Đặt lại mật khẩu</h2>
          <div className="grid gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2"><label className="text-gray-700 font-medium">Mã OTP (6 số):</label></div>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition tracking-widest" placeholder="XXXXXX" maxLength={6} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><label className="text-gray-700 font-medium">Mật khẩu mới:</label></div>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition" placeholder="Nhập mật khẩu mới..." />
            </div>
            <button onClick={handleResetSubmit} disabled={loading} className={`w-full py-4 rounded-lg text-white font-bold text-lg transition mt-4 ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>{loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐỔI MẬT KHẨU"}</button>
            <button className="text-sm text-gray-500 hover:underline text-center mt-2" onClick={() => { sessionStorage.removeItem("resetToken"); sessionStorage.removeItem("resetEmail"); navigate("/forget_password"); }}>Quay lại nhập Email khác</button>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500 p-12">
          <div className="text-center text-white">
            <h3 className="text-4xl font-bold mb-4">HKT STUDIO</h3>
            <p className="text-lg opacity-90">Nhập mã OTP để đặt lại mật khẩu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
