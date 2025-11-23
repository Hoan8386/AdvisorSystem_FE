import { useContext } from "react";
import { toast } from "react-toastify";
import {
  BarChart3,
  LogOut,
  Home,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Clock,
  MessageSquare,
  Bot,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { logoutApi } from "../../services/api.service";

export const AdminSidebar = ({ onClose, isCollapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useContext(AuthContext);

  const handleLogoutClick = async () => {
    try {
      await logoutApi();
      handleLogout();
      toast.success("Da dang xuat");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      handleLogout();
      navigate("/login");
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      path: "/admin",
      label: "Bảng điều khiển",
      icon: BarChart3,
      color: "text-[#dc3545]",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      dotColor: "bg-[#dc3545]",
    },
    {
      id: "advisors",
      path: "/admin/advisors",
      label: "Giảng viên",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      dotColor: "bg-orange-600",
    },
    {
      id: "classes",
      path: "/admin/classes",
      label: "Lớp học",
      icon: GraduationCap,
      color: "text-[#dc3545]",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      dotColor: "bg-[#dc3545]",
    },
    {
      id: "semesters",
      path: "/admin/semesters",
      label: "Học kỳ",
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      hoverColor: "hover:bg-pink-100",
      dotColor: "bg-pink-600",
    },
    {
      id: "courses",
      path: "/admin/courses",
      label: "Môn học",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      dotColor: "bg-purple-600",
    },
    {
      id: "grades",
      path: "/admin/grades",
      label: "Quản lý điểm",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      dotColor: "bg-blue-600",
    },
    {
      id: "schedules",
      path: "/admin/schedules",
      label: "Lịch học",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      dotColor: "bg-green-600",
    },
    {
      id: "meetings",
      path: "/admin/meetings",
      label: "Cuộc họp",
      icon: MessageSquare,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      hoverColor: "hover:bg-cyan-100",
      dotColor: "bg-cyan-600",
    },
    {
      id: "rag-assistant",
      path: "/admin/rag",
      label: "Trợ lý HUIT",
      icon: Bot,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      dotColor: "bg-green-600",
    },
  ];

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } h-screen bg-gradient-to-b from-[#dc3545] via-[#c82333] to-[#b81c2f] shadow-2xl flex flex-col relative overflow-hidden rounded-r-3xl transition-all duration-300`}
    >
      {/* Decorative Elements */}
      <div
        className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 transition-opacity duration-300"
        style={{ opacity: isCollapsed ? 0.3 : 1 }}
      />
      <div
        className="absolute bottom-20 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 transition-opacity duration-300"
        style={{ opacity: isCollapsed ? 0.3 : 1 }}
      />

      {/* Logo/Brand */}
      <div className="relative py-1 px-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
            <img
              style={{
                borderRadius: "50%",
              }}
              src="/logo/logo_1.jpg"
              alt="Logo"
              className={`relative ${
                isCollapsed ? "h-12" : "h-20"
              } w-auto object-contain drop-shadow-2xl transition-all duration-300`}
            />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav
        className={`flex-1 ${
          isCollapsed ? "px-2" : "px-4"
        } py-2 space-y-2 relative z-10`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Sửa lỗi active: /admin không nên match với /admin/advisors
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");

          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-2" : "gap-4 px-5"
              } py-2 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden ${
                isActive
                  ? "bg-white shadow-xl transform scale-105"
                  : "text-white/90 hover:text-white hover:bg-white/15 hover:transform hover:scale-105"
              }`}
              style={{
                backdropFilter: isActive ? "none" : "blur(10px)",
              }}
              title={isCollapsed ? item.label : ""}
            >
              {/* Active indicator bar */}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#dc3545] to-[#b81c2f] rounded-r-full" />
              )}

              {/* Icon with background */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-[#dc3545] to-[#b81c2f] shadow-lg"
                    : "bg-white/10 group-hover:bg-white/20"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-white/90 group-hover:text-white"
                  }`}
                />
              </div>

              {!isCollapsed && (
                <>
                  <div className="flex-1">
                    <span
                      className={`font-semibold text-sm transition-all duration-300 ${
                        isActive ? "text-gray-800" : "text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-[#dc3545] animate-pulse" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      {!isCollapsed && (
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}

      {/* User Info & Logout */}
      <div className={`${isCollapsed ? "p-2" : "p-6"} relative z-10`}>
        <button
          onClick={handleLogoutClick}
          className={`w-full flex items-center justify-center gap-3 ${
            isCollapsed ? "px-2 py-2.5" : "px-5 py-3.5"
          } bg-white/10 backdrop-blur-sm text-white rounded-2xl transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:transform hover:scale-105 border border-white/20`}
          title={isCollapsed ? "Đăng xuất" : ""}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-semibold text-sm">Đăng xuất </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
