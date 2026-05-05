import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as authService from "../services/auth.service.js";

const Register = () => {
  const navigate = useNavigate();

  // Define Regex for reuse
  const REGEX = {
    email: /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/,
    phoneNumber: /^(0[3|5|7|8|9])+([0-9]{8})$/,
  };

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gender: "MALE",
    dateOfBirth: "",
    username: "",
    password: "",
    password_confirmed: "",
  });

  const [validationStatus, setValidationStatus] = useState({
    fullName: null,
    phoneNumber: null,
    email: null,
    username: null,
    password: null,
    password_confirmed: null,
  });

  const [loading, setLoading] = useState(false);

  const handleValidation = (e) => {
    const { name, value } = e.target;
    let isValid = false;

    if (value.trim() === "") {
      isValid = false;
    } else {
      switch (name) {
        case "fullName":
          isValid = value.trim().length > 0;
          break;
        case "username":
          isValid = value.trim().length > 0;
          break;
        case "email":
          isValid = REGEX.email.test(value);
          break;
        case "phoneNumber":
          isValid = REGEX.phoneNumber.test(value);
          break;
        case "password":
          isValid = value.length > 8;
          if (formData.password_confirmed) {
            setValidationStatus((prev) => ({
              ...prev,
              password_confirmed: value === formData.password_confirmed,
            }));
          }
          break;
        case "password_confirmed":
          isValid = formData.password === value;
          break;
        default:
          break;
      }
    }

    setValidationStatus((prev) => ({ ...prev, [name]: isValid }));
  };

  const getBorderClass = (fieldName) => {
    if (validationStatus[fieldName] === true) {
      return "border-green-500 focus:border-green-500";
    }
    if (validationStatus[fieldName] === false) {
      return "border-red-400 focus:border-red-400";
    }
    return "border-gray-200 focus:border-red-400";
  };

  const renderIcon = (fieldName) => {
    if (validationStatus[fieldName] === true) {
      return (
        <span className="absolute right-3 top-3 text-green-500 text-xl font-bold">
          ✓
        </span>
      );
    }
    return <span className="absolute right-3 top-3 text-red-500">*</span>;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmed) {
      toast.warning("Mật khẩu xác nhận không khớp!");
      return;
    }

    const accountData = {
      username: formData.username,
      password: formData.password,
      customer: {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        gender: formData.gender.toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
      },
    };

    setLoading(true);

    try {
      await authService.register(accountData);
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Vui lòng thử lại.";
      toast.error(`Đăng ký thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2">
        {/* Left side - Form */}
        <div className="p-8 md:p-12">
          <h2 className="font-bold text-4xl mb-2">Sign Up</h2>
          <p className="text-gray-500 mb-8">Nhập thông tin đăng ký</p>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleValidation}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
                  "fullName"
                )}`}
                placeholder="Họ và tên..."
                required
              />
              {renderIcon("fullName")}
            </div>

            <div className="relative">
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleValidation}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
                  "phoneNumber"
                )}`}
                placeholder="Số điện thoại..."
                required
              />
              {renderIcon("phoneNumber")}
            </div>

            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleValidation}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
                  "email"
                )}`}
                placeholder="Email..."
                required
              />
              {renderIcon("email")}
            </div>

            <div className="grid gap-2">
              <label className="font-semibold text-sm text-gray-700">
                Giới tính:
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    className="accent-red-500 w-4 h-4"
                    checked={formData.gender === "MALE"}
                    onChange={handleChange}
                    required
                  />
                  <span className="text-gray-700">Nam</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    className="accent-red-500 w-4 h-4"
                    checked={formData.gender === "FEMALE"}
                    onChange={handleChange}
                    required
                  />
                  <span className="text-gray-700">Nữ</span>
                </label>
              </div>
            </div>

            <div className="relative">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition text-gray-600"
                required
              />
            </div>

            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleValidation}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
                  "username"
                )}`}
                placeholder="Username..."
                required
              />
              {renderIcon("username")}
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleValidation}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
                  "password"
                )}`}
                placeholder="Mật khẩu..."
                required
              />
              {renderIcon("password")}
            </div>

            <div className="relative">
              <input
                type="password"
                name="password_confirmed"
                value={formData.password_confirmed}
                onChange={handleChange}
                onBlur={handleValidation}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition ${getBorderClass(
                  "password_confirmed"
                )}`}
                placeholder="Nhập lại mật khẩu..."
                required
              />
              {renderIcon("password_confirmed")}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                className="px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                onClick={() => {
                  navigate("/login");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="px-6 py-3 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
              >
                Sign Up
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg bg-black text-white font-bold text-lg hover:bg-gray-800 transition mt-2 disabled:opacity-50"
            >
              {loading ? "ĐANG ĐĂNG KÝ..." : "REGISTER"}
            </button>

            <button
              type="button"
              className="w-full py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              onClick={() => {
                navigate("/");
              }}
            >
              Quay lại
            </button>
          </form>
        </div>

        {/* Right side - Gradient */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500 p-12">
          <div className="text-center text-white">
            <h3 className="text-4xl font-bold mb-4">HKT STUDIO</h3>
            <p className="text-lg opacity-90">Create your account to get started!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
