import { useContext, useState, useEffect } from "react";
import { AdvisorSidebar } from "./AdvisorSidebar";
import { AuthContext } from "../context/auth.context";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAccountAPI, logoutApi } from "../../services/api.service";
import { toast } from "react-toastify";

export const AdvisorLayout = ({ children }) => {
  const { user, handleLogout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [advisorInfo, setAdvisorInfo] = useState(null);

  // Lưu state sidebar collapsed vào localStorage để giữ trạng thái khi navigate
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  // Cập nhật localStorage khi state thay đổi
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    fetchAdvisorInfo();
  }, []);

  const fetchAdvisorInfo = async () => {
    try {
      const res = await getAccountAPI();
      if (res && res.data) {
        setAdvisorInfo(res.data);
      }
    } catch (error) {
      console.error("Error fetching advisor info:", error);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logoutApi();
      handleLogout();
      toast.success("Đã đăng xuất");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      handleLogout();
      navigate("/login");
    }
  };

  const getPageTitle = () => {
    if (location.pathname.includes("/admin/notifications")) {
      return "Quản lý thông báo";
    } else if (location.pathname.includes("/admin/profile")) {
      return "Hồ sơ cá nhân";
    } else if (location.pathname.includes("/admin/activities")) {
      return "Quản lý hoạt động";
    } else if (location.pathname.includes("/admin/classes")) {
      return "Quản lý lớp học";
    } else if (location.pathname.includes("/admin/rag")) {
      return "Trợ lý AI HUIT";
    } else {
      return "Trang chủ";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block h-screen overflow-y-auto transition-all duration-300">
        <AdvisorSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdvisorSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Desktop Sidebar Toggle Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2.5 rounded-xl bg-gradient-to-br from-[#1da1f2] to-[#1890da] hover:from-[#1890da] hover:to-[#1780c8] text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                title={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Chào mừng trở lại, {user?.full_name}
                </p>
              </div>
            </div>

            {/* User Menu - Right */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-[#1da1f2] to-[#1a91da] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {advisorInfo?.full_name || user?.full_name || "Advisor"}
                  </div>
                  <div className="text-xs text-gray-500">{user?.user_code}</div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate("/admin/profile");
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-[#1da1f2]" />
                    <span className="text-sm font-medium">Hồ sơ của tôi</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleLogoutClick();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[#1da1f2] hover:bg-blue-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-center">
            <img
              src="/logo/logo_2.png"
              alt="Logo Trường"
              className="h-14 w-auto object-contain"
            />
          </div>
        </footer>
      </div>
    </div>
  );
};
