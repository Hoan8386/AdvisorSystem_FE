import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../components/context/auth.context";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  getNotificationsAPI,
  getNotificationStatisticsAPI,
  deleteNotificationAPI,
} from "../../../services/api.service";
import {
  Button,
  Table,
  Modal,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  Empty,
  message,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("home");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    } else if (activeTab === "home") {
      fetchStats();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsAPI();
      if (res && res.success) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách thông báo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getNotificationStatisticsAPI();
      if (res && res.success) {
        setStats(res.data);
      }
    } catch {
      console.error("Error fetching stats");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xoá thông báo",
      content: "Bạn chắc chắn muốn xoá thông báo này?",
      okText: "Xoá",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await deleteNotificationAPI(id);
          if (res && res.success) {
            message.success("Thông báo đã được xoá");
            fetchNotifications();
          }
        } catch (error) {
          message.error("Lỗi khi xoá thông báo");
        }
      },
    });
  };

  const handleEdit = (record) => {
    navigate(`/admin/notifications/${record.notification_id}/edit`, {
      state: { notification: record },
    });
  };

  const handleViewResponses = (record) => {
    navigate(`/admin/notifications/${record.notification_id}/responses`);
  };

  const handleCreateNew = () => {
    navigate("/admin/notifications/create");
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          color={
            type === "announcement"
              ? "blue"
              : type === "deadline"
              ? "red"
              : "green"
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Số lớp nhận",
      dataIndex: "classes",
      key: "classes",
      render: (classes) => (classes ? classes.length : 0),
      align: "center",
    },
    {
      title: "Phản hồi",
      dataIndex: "responses_count",
      key: "responses_count",
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 150,
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewResponses(record)}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.notification_id)}
          >
            Xoá
          </Button>
        </Space>
      ),
    },
  ];

  // Home Tab Content
  const homeContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Xin chào, {user?.full_name}! 👋</h1>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng thông báo"
                value={stats.total_notifications || 0}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng phản hồi"
                value={stats.total_responses || 0}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đánh giá trung bình"
                value={stats.average_rating?.toFixed(1) || 0}
                suffix="⭐"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Lớp quản lý"
                value={stats.classes_count || 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Notifications */}
      <Card
        title="Thông báo gần đây"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Tạo mới
          </Button>
        }
      >
        {notifications.length === 0 ? (
          <Empty description="Không có thông báo" />
        ) : (
          <Table
            columns={columns}
            dataSource={notifications.slice(0, 5)}
            rowKey="notification_id"
            pagination={false}
            loading={loading}
          />
        )}
      </Card>
    </div>
  );

  // Notifications Tab Content
  const notificationsContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý thông báo</h1>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateNew}
        >
          Tạo thông báo mới
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={notifications}
          rowKey="notification_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} thông báo`,
          }}
        />
      </Card>
    </div>
  );

  // Classes Tab Content
  const classesContent = (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý lớp học</h1>
      <Card>
        <Empty description="Chức năng này sẽ được cập nhật sớm" />
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: "home",
      label: "Trang chủ",
      children: homeContent,
    },
    {
      key: "notifications",
      label: "Thông báo",
      children: notificationsContent,
    },
    {
      key: "classes",
      label: "Lớp học",
      children: classesContent,
    },
  ];

  return (
    <AdvisorLayout>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        tabBarStyle={{ marginBottom: 0 }}
      />
    </AdvisorLayout>
  );
};

export default AdvisorDashboard;
