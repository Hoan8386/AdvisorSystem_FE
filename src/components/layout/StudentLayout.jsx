import { useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import {
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, handleLogout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      toast.success("Đã đăng xuất");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const menuItems = [
    {
      id: "notifications",
      path: "/student",
      label: "Thông báo",
      icon: Bell,
    },
    // Có thể thêm các menu items khác sau này
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header Bar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Student Portal
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Hệ thống Tư vấn Sinh viên
                </p>
              </div>
            </div>

            {/* User Dropdown Menu - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {user?.full_name?.charAt(0) || "S"}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-900">
                    {user?.full_name || "Sinh viên"}
                  </div>
                  <div className="text-xs text-gray-500">{user?.user_code}</div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate("/student/profile");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
                  >
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Hồ sơ của tôi</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleLogoutClick();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Hidden on Mobile */}
      <nav className="hidden md:block bg-white border-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-b border-gray-200 py-4 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  navigate("/student/profile");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
              >
                <User className="w-5 h-5 text-blue-600" />
                <span>Hồ sơ của tôi</span>
              </button>
              <button
                onClick={() => {
                  handleLogoutClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-80px)]">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t-1 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-900">
                  Student Portal
                </div>
                <div className="text-xs text-gray-500">
                  Hệ thống Tư vấn Sinh viên
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 Student Advisory System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentLayout;
