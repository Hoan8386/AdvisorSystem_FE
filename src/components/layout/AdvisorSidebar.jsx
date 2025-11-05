import { useContext } from "react";
import { toast } from "react-toastify";
import { FileText, Bell, LogOut, Home, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { logoutApi } from "../../services/api.service";

export const AdvisorSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useContext(AuthContext);

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

  const menuItems = [
    {
      id: "home",
      path: "/admin",
      label: "Trang chủ",
      icon: Home,
      color: "text-red-600",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      dotColor: "bg-red-600",
    },
    {
      id: "notifications",
      path: "/admin/notifications",
      label: "Thông báo",
      icon: Bell,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      dotColor: "bg-orange-600",
    },
    {
      id: "activities",
      path: "/admin/activities",
      label: "Hoạt động",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      dotColor: "bg-blue-600",
    },
  ];

  return (
    <div className="w-64 h-screen bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="py-5 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Advisor</h1>
            <p className="text-xs text-gray-500">Hệ thống quản lý</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/admin" &&
              location.pathname.startsWith("/admin/home")) ||
            (item.path === "/admin/notifications" &&
              location.pathname.startsWith("/admin/notifications")) ||
            (item.path === "/admin/activities" &&
              location.pathname.startsWith("/admin/activities"));

          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                isActive
                  ? `${item.bgColor} ${item.color} shadow-sm font-semibold`
                  : `text-gray-600 hover:text-gray-900 ${item.hoverColor}`
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? item.color
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className={`font-medium ${isActive ? "text-current" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <div
                  className={`ml-auto w-2 h-2 rounded-full ${item.dotColor}`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};
