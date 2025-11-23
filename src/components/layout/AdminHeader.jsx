import { Layout, Avatar, Dropdown, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../../utils/avatarHelper";

const { Header } = Layout;

export const AdminHeader = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const items = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: () => navigate("/admin/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      // Thay đổi: Thêm class gradient xanh đậm giống Sidebar
      className="bg-gradient-to-r from-[#0056b3] via-[#004494] to-[#003375]"
      style={{
        padding: "0 24px",
        // background: "#fff", // Đã xóa màu nền trắng cũ
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // Tăng bóng đổ nhẹ để đẹp hơn
        borderBottom: "1px solid rgba(255,255,255,0.1)", // Thêm viền mờ phía dưới
      }}
    >
      {/* Thay đổi: Chữ màu trắng */}
      <div className="text-xl font-bold text-white tracking-wide shadow-sm">
        Hệ thống Quản lý Cố vấn
      </div>

      <Dropdown menu={{ items }} placement="bottomRight" arrow>
        <Space style={{ cursor: "pointer" }}>
          <Avatar
            icon={<UserOutlined />}
            src={getAvatarUrl(user?.avatar_url)}
            size="large"
            // Thay đổi: Viền trắng cho avatar để nổi trên nền xanh
            className="border-2 border-white/30 bg-white/10"
          />
          <div className="flex flex-col items-end leading-tight">
            {/* Thay đổi: Tên màu trắng */}
            <div className="font-semibold text-white text-sm">
              {user?.full_name || "Admin"}
            </div>
            {/* Thay đổi: Role màu xanh nhạt (text-blue-100) cho dễ đọc */}
            <div className="text-xs text-blue-100/80">Quản trị viên</div>
          </div>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AdminHeader;
