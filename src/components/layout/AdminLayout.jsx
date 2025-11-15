import { Layout, Menu } from "antd";
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { AdminHeader } from "./AdminHeader";

const { Sider, Content } = Layout;

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Bảng điều khiển",
    },
    {
      key: "/admin/advisors",
      icon: <UserOutlined />,
      label: "Danh sách Giảng viên",
    },
    {
      key: "/admin/classes",
      icon: <TeamOutlined />,
      label: "Quản lý Lớp học",
    },
    {
      key: "/admin/semesters",
      icon: <CalendarOutlined />,
      label: "Quản lý Học kỳ",
    },
    {
      key: "/admin/courses",
      icon: <BookOutlined />,
      label: "Quản lý Môn học",
    },
    {
      key: "/admin/grades",
      icon: <FileTextOutlined />,
      label: "Quản lý Điểm",
    },
    {
      key: "/admin/schedules",
      icon: <ClockCircleOutlined />,
      label: "Quản lý Lịch học",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // Get current selected key based on path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") {
      return "/admin";
    }
    if (path.startsWith("/admin/advisors")) {
      return "/admin/advisors";
    }
    if (path.startsWith("/admin/classes")) {
      return "/admin/classes";
    }
    if (path.startsWith("/admin/semesters")) {
      return "/admin/semesters";
    }
    if (path.startsWith("/admin/courses")) {
      return "/admin/courses";
    }
    if (path.startsWith("/admin/grades")) {
      return "/admin/grades";
    }
    if (path.startsWith("/admin/schedules")) {
      return "/admin/schedules";
    }
    return "/admin";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={250}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="flex items-center justify-center h-16 bg-white/10">
          {!collapsed ? (
            <h1 className="text-white text-lg font-bold">Admin Panel</h1>
          ) : (
            <h1 className="text-white text-lg font-bold">AP</h1>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
        />
        <div
          className="absolute bottom-4 left-0 right-0 flex justify-center cursor-pointer hover:bg-white/10 py-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <MenuUnfoldOutlined className="text-white text-lg" />
          ) : (
            <MenuFoldOutlined className="text-white text-lg" />
          )}
        </div>
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
      >
        <AdminHeader />
        <Content style={{ margin: "16px", background: "#f0f2f5" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
