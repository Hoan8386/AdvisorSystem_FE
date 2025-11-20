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
  Calendar,
  Trophy,
  BookOpen,
  AlertTriangle,
  MessageCircle,
  Award,
  FileText,
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
    {
      id: "meetings",
      path: "/student/meetings",
      label: "Cuộc họp",
      icon: Calendar,
    },
    {
      id: "chat",
      path: "/student/chat",
      label: "Tin nhắn",
      icon: MessageCircle,
    },
    {
      id: "activities",
      path: "/student/activities",
      label: "Hoạt động",
      icon: Calendar,
    },
    {
      id: "semester-report",
      path: "/student/semester-report",
      label: "Báo cáo học kỳ",
      icon: BookOpen,
    },
    {
      id: "warnings",
      path: "/student/warnings",
      label: "Cảnh cáo học vụ",
      icon: AlertTriangle,
    },
    {
      id: "point-feedbacks",
      path: "/student/point-feedbacks",
      label: "Phản hồi điểm",
      icon: Award,
    },
    {
      id: "monitoring-notes",
      path: "/student/monitoring-notes",
      label: "Ghi chú theo dõi",
      icon: FileText,
    },
  ];

  const isActive = (path) => {
    if (path === "/student") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom right, #e8f5fe, #f0f9ff)",
      }}
    >
      {/* Header Bar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <img
                src="/logo/logo_2.png"
                alt="Logo"
                className="h-16 w-auto object-contain"
              />
            </div>

            {/* User Dropdown Menu - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl border-2 hover:shadow-lg transition-all duration-300"
                style={{ backgroundColor: "#e8f5fe", borderColor: "#1da1f2" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                  style={{ backgroundColor: "#1da1f2" }}
                >
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-all"
                  >
                    <User className="w-5 h-5" style={{ color: "#1da1f2" }} />
                    <span className="font-medium">Hồ sơ của tôi</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate("/student/points");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-all"
                  >
                    <Trophy className="w-5 h-5" style={{ color: "#1da1f2" }} />
                    <span className="font-medium">Điểm rèn luyện</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleLogoutClick();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[#1da1f2] hover:bg-blue-50 transition-all"
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
                      ? "text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={active ? { backgroundColor: "#1da1f2" } : {}}
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
                    active ? "text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={active ? { backgroundColor: "#1da1f2" } : {}}
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
                <User className="w-5 h-5" style={{ color: "#1da1f2" }} />
                <span>Hồ sơ của tôi</span>
              </button>
              <button
                onClick={() => {
                  navigate("/student/points");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
              >
                <Trophy className="w-5 h-5" style={{ color: "#1da1f2" }} />
                <span>Điểm rèn luyện</span>
              </button>
              <button
                onClick={() => {
                  handleLogoutClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#1da1f2] hover:bg-blue-50 rounded-xl font-medium"
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
      <footer
        className="bg-white border-t-2 mt-12"
        style={{ borderColor: "#1da1f2" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo/logo_2.png"
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
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
