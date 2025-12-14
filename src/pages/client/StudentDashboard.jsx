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
  Divider,
  Row,
  Col,
  Statistic,
} from "antd";
import { toast } from "react-toastify";
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
      toast.error("Lỗi khi tải danh sách thông báo");
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
        toast.success("Đã đánh dấu tất cả là đã đọc");
        setUnreadCount(0);
        fetchNotifications();
      }
    } catch (error) {
      toast.error("Lỗi khi đánh dấu thông báo");
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
        return "orange";
      case "reminder":
        return "cyan";
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
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            <BellOutlined className="mr-2" />
            Thông báo của tôi
          </h1>
          {unreadCount > 0 && (
            <Button
              type="primary"
              onClick={handleMarkAllRead}
              icon={<CheckCircleOutlined />}
              className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
              size="middle"
            >
              <span className="hidden sm:inline">
                Đánh dấu tất cả đã đọc ({unreadCount})
              </span>
              <span className="sm:hidden">Đọc tất cả ({unreadCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <Row gutter={[16, 16]} className="mb-4 md:mb-8">
        <Col xs={24} sm={12} lg={8}>
          <Card className="h-full">
            <Statistic
              title="Tổng Thông báo"
              value={notifications.length}
              valueStyle={{ color: "#1890ff" }}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="h-full">
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
        <Col xs={24} sm={24} lg={8}>
          <Card className="h-full">
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
                  className="mb-3 md:mb-4 hover:shadow-lg transition-shadow"
                  hoverable
                  onClick={() => handleViewDetail(notification.notification_id)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <Badge color="blue" text="Chưa đọc" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mb-3">
                        <Tag color={getTypeColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Tag>
                        {notification.responses_count > 0 && (
                          <Tag color="cyan">
                            {notification.responses_count} phản hồi
                          </Tag>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-2 break-words">
                        {notification.summary.substring(0, 150)}
                        {notification.summary.length > 150 ? "..." : ""}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          📅{" "}
                          {dayjs(notification.created_at).format("DD/MM/YYYY")}
                        </span>
                        <span className="flex items-center gap-1 break-words">
                          👤 {notification.advisor?.user?.full_name}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      className="md:ml-4 bg-blue-500 hover:bg-blue-600 w-full md:w-auto"
                      size="middle"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(notification.notification_id);
                      }}
                    >
                      <span className="hidden sm:inline">Xem Chi tiết</span>
                      <span className="sm:hidden">Xem</span>
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
