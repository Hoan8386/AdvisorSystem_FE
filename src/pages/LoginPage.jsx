import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { loginApi } from "../services/api.service";
import { toast } from "react-toastify";
import { Button, Card } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import logo from "../assets/logo.jpg";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { handleLogin } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    user_code: "",
    password: "",
    role: "student", // Default role
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_code || !formData.password) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi(
        formData.user_code,
        formData.password,
        formData.role
      );

      // Response structure: { success: true, data: { token, user: { id, role, ... } } }
      if (
        res?.success &&
        res?.data?.token &&
        res?.data?.user?.id &&
        res?.data?.user?.role
      ) {
        // Combine token + user data
        const loginData = {
          token: res.data.token,
          user: res.data.user,
        };

        handleLogin(loginData);
        toast.success("Đăng nhập thành công!");

        // Redirect based on role
        if (res.data.user?.role === "advisor") {
          navigate("/advisor");
        } else if (res.data.user?.role === "student") {
          navigate("/student");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Mã số hoặc mật khẩu không chính xác!");
      }
    } catch (error) {
      console.error("Login catch error:", error);

      // Handle error response from interceptor
      if (error?.success === false) {
        toast.error(error?.message || "Mã số hoặc mật khẩu không chính xác!");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Lỗi đăng nhập, vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Brand section */}
          <div className="hidden lg:flex flex-col justify-center items-center text-white">
            <div className="mb-8">
              <div className="inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 mb-6">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-24 h-24 rounded-xl object-cover"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Hệ thống Cố vấn</h1>
            <p className="text-gray-300 text-lg mb-8 text-center">
              Quản lý hiệu quả công tác cố vấn học tập
            </p>
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-3 text-gray-200">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  ✓
                </div>
                <span>Quản lý sinh viên và lớp học</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  ✓
                </div>
                <span>Theo dõi tiến độ học tập</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  ✓
                </div>
                <span>Ghi chép và thông báo</span>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="w-full">
            <Card
              className="shadow-2xl border-0"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
              }}
              bodyStyle={{ padding: "40px" }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="lg:hidden mb-4">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-16 h-16 rounded-full object-cover mx-auto"
                  />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Đăng nhập
                </h2>
                <p className="text-gray-500">
                  Truy cập hệ thống quản lý cố vấn học tập
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: "student" })
                      }
                      className={`flex-1 flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border-2 transition-all duration-300 ${
                        formData.role === "student"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          formData.role === "student"
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <UserOutlined className="text-sm" />
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          formData.role === "student"
                            ? "text-purple-700"
                            : "text-gray-600"
                        }`}
                      >
                        Sinh viên
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: "advisor" })
                      }
                      className={`flex-1 flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border-2 transition-all duration-300 ${
                        formData.role === "advisor"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          formData.role === "advisor"
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <UserOutlined className="text-sm" />
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          formData.role === "advisor"
                            ? "text-purple-700"
                            : "text-gray-600"
                        }`}
                      >
                        Cố vấn
                      </span>
                    </button>
                  </div>
                </div>

                {/* User Code Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
                    <UserOutlined className="text-gray-400" />
                    <input
                      type="text"
                      name="user_code"
                      value={formData.user_code}
                      onChange={handleChange}
                      placeholder={
                        formData.role === "advisor"
                          ? "Nhập mã giảng viên (VD: GV001)"
                          : "Nhập mã sinh viên (VD: 210001)"
                      }
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
                    <LockOutlined className="text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu"
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base"
                    />
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 mr-2 cursor-pointer"
                    />
                    Ghi nhớ tôi
                  </label>
                  <Link
                    to="/forgot"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 font-semibold h-12 rounded-lg flex items-center justify-center gap-2"
                  icon={!loading && <ArrowRightOutlined />}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>

              {/* Register link */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/register"
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>

              {/* Footer info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Bằng cách đăng nhập, bạn đồng ý với{" "}
                  <Link to="/terms" className="text-purple-600 hover:underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/privacy"
                    className="text-purple-600 hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
