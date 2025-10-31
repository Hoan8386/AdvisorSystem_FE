import { useState, useEffect, useContext } from "react";
import { Button, Space, Avatar, Dropdown, message } from "antd";
import {
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { getAccountAPI } from "../../services/api.service";

export const AdvisorHeader = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [advisorInfo, setAdvisorInfo] = useState(null);

  useEffect(() => {
    fetchAdvisorInfo();
  }, []);

  const fetchAdvisorInfo = async () => {
    try {
      const res = await getAccountAPI();
      if (res) {
        setAdvisorInfo(res);
      }
    } catch (error) {
      console.error("Error fetching advisor info:", error);
    }
  };

  const profileMenuItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
      onClick: () => navigate("/admin/profile"),
    },
    {
      key: "divider",
      type: "divider",
    },
    {
      key: "settings",
      label: "Cài đặt",
      onClick: () => message.info("Chức năng này sẽ được cập nhật"),
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fff 0%, #fef5f6 50%, #fff 100%)",
        padding: window.innerWidth < 768 ? "12px 16px" : "16px 40px",
        boxShadow: "0 4px 20px rgba(200,16,46,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "2px solid rgba(200,16,46,0.1)",
        backdropFilter: "blur(10px)",
        flexShrink: 0,
        gap: 12,
      }}
    >
      {/* Left: Collapse Button */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleCollapse}
        style={{ fontSize: 18 }}
        className="hidden md:inline-flex"
      />

      {/* Center: Page Title - will be handled by parent if needed */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Space for dynamic content */}
      </div>

      {/* Right: Profile & Notifications */}
      <Space size="large" style={{ display: "flex", alignItems: "center" }}>
        {/* Notifications */}
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18, color: "#c8102e" }} />}
          size="large"
          style={{ border: "none" }}
        />

        {/* Profile Dropdown */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(200,16,46,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ textAlign: "right", minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#c8102e",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {advisorInfo?.full_name || user?.full_name || "Giáo viên"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#999",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {advisorInfo?.user_code || "GV"}
              </div>
            </div>
            <Avatar
              size={40}
              src={advisorInfo?.avatar_url}
              style={{
                background: "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                flexShrink: 0,
              }}
            >
              {advisorInfo?.full_name?.charAt(0) || "A"}
            </Avatar>
          </div>
        </Dropdown>
      </Space>
    </div>
  );
};
