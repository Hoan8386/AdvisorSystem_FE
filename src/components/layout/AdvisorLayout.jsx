import { useContext, useState } from "react";
import { AdvisorSidebar } from "./AdvisorSidebar";
import { AuthContext } from "../context/auth.context";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const AdvisorLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname.includes("/admin/notifications")) {
      return "Quản lý thông báo";
    } else if (location.pathname.includes("/admin/profile")) {
      return "Hồ sơ cá nhân";
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
      <div className="hidden lg:block h-screen overflow-y-auto">
        <AdvisorSidebar />
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
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4">
          <div className="text-center text-xs sm:text-sm text-gray-500">
            © 2024 Hệ thống Tư vấn sinh viên
          </div>
        </footer>
      </div>
    </div>
  );
};
