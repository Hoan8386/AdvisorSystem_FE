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
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div className="text-xl font-semibold">Hệ thống Quản lý Cố vấn</div>

      <Dropdown menu={{ items }} placement="bottomRight" arrow>
        <Space style={{ cursor: "pointer" }}>
          <Avatar
            icon={<UserOutlined />}
            src={getAvatarUrl(user?.avatar_url)}
            size="large"
          />
          <div>
            <div className="font-semibold">{user?.full_name || "Admin"}</div>
            <div className="text-xs text-gray-500">Quản trị viên</div>
          </div>
        </Space>
      </Dropdown>
    </Header>
  );
};
