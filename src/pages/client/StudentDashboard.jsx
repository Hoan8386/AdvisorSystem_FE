import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../components/context/auth.context";
import {
  getNotificationsAPI,
  getUnreadNotificationsAPI,
  markAllNotificationsReadAPI,
} from "../../services/api.service";
import {
  Card,
  Button,
  List,
  Tag,
  Badge,
  Space,
  Spin,
  Empty,
  message,
  Divider,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  FileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

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

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationsAPI();
      if (res && res.success) {
        setUnreadCount(res.data ? res.data.length : 0);
      }
    } catch (_error) {
      console.error("Error fetching unread count", _error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsReadAPI();
      if (res && res.success) {
        message.success("Đã đánh dấu tất cả là đã đọc");
        setUnreadCount(0);
        fetchNotifications();
      }
    } catch (error) {
      message.error("Lỗi khi đánh dấu thông báo");
      console.error(error);
    }
  };

  const handleViewDetail = (notificationId) => {
    navigate(`/student/notifications/${notificationId}`);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "announcement":
        return "blue";
      case "deadline":
        return "red";
      case "reminder":
        return "orange";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      announcement: "Thông báo",
      deadline: "Hạn chót",
      reminder: "Nhắc nhở",
    };
    return labels[type] || type;
  };

  if (!user || user.role !== "student") {
    return (
      <Empty
        description="Bạn không có quyền truy cập trang này"
        style={{ marginTop: 50 }}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            <BellOutlined className="mr-2" />
            Thông báo của tôi
          </h1>
          {unreadCount > 0 && (
            <Button
              type="primary"
              onClick={handleMarkAllRead}
              icon={<CheckCircleOutlined />}
              className="bg-green-500 hover:bg-green-600"
            >
              Đánh dấu tất cả đã đọc ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Thông báo"
              value={notifications.length}
              valueStyle={{ color: "#1890ff" }}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Badge
              showZero
              count={unreadCount}
              style={{ backgroundColor: "#ff4d4f" }}
            >
              <Statistic
                title="Chưa Đọc"
                value={unreadCount}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Badge>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tên Sinh viên"
              value={user?.full_name || "N/A"}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Notifications List */}
      <Card className="shadow-md">
        <Spin spinning={loading}>
          {notifications.length === 0 ? (
            <Empty
              description="Không có thông báo nào"
              style={{ padding: "40px 0" }}
            />
          ) : (
            <List
              dataSource={notifications}
              renderItem={(notification) => (
                <Card
                  key={notification.notification_id}
                  className="mb-4 hover:shadow-lg transition-shadow"
                  hoverable
                  onClick={() => handleViewDetail(notification.notification_id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <Badge color="red" text="Chưa đọc" />
                        )}
                      </div>
                      <div className="flex gap-2 items-center mb-3">
                        <Tag color={getTypeColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Tag>
                        {notification.responses_count > 0 && (
                          <Tag color="cyan">
                            {notification.responses_count} phản hồi
                          </Tag>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">
                        {notification.summary.substring(0, 150)}
                        {notification.summary.length > 150 ? "..." : ""}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>
                          📅{" "}
                          {dayjs(notification.created_at).format("DD/MM/YYYY")}
                        </span>
                        <span>👤 {notification.advisor?.user?.full_name}</span>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      className="ml-4 bg-blue-500 hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(notification.notification_id);
                      }}
                    >
                      Xem Chi tiết
                    </Button>
                  </div>
                </Card>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default StudentDashboard;
