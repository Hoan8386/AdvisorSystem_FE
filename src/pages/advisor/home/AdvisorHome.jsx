import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../components/context/auth.context";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  getNotificationsAPI,
  getNotificationStatisticsAPI,
} from "../../../services/api.service";
import { Card, Row, Col, Statistic, Empty, Spin, Button, Table } from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  FileTextOutlined,
  TeamOutlined,
  StarOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export const AdvisorHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy cả notifications và statistics
      const [notificationsRes, statisticsRes] = await Promise.all([
        getNotificationsAPI(),
        getNotificationStatisticsAPI(),
      ]);

      if (notificationsRes && notificationsRes.success) {
        setNotifications(notificationsRes.data || []);
      }

      if (statisticsRes && statisticsRes.success) {
        setStatistics(statisticsRes.data || null);
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span style={{ fontWeight: 500, color: "#333" }}>{text}</span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeMap = {
          general: { text: "Thông báo chung", color: "#1890ff" },
          academic: { text: "Học tập", color: "#ff4d4f" },
          event: { text: "Sự kiện", color: "#52c41a" },
          urgent: { text: "Khẩn", color: "#fa8c16" },
        };
        const typeInfo = typeMap[type] || { text: type, color: "#999" };
        return (
          <span
            style={{
              background: typeInfo.color + "20",
              color: typeInfo.color,
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {typeInfo.text}
          </span>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      width: 120,
    },
    {
      title: "Phản hồi",
      dataIndex: "responses_count",
      key: "responses_count",
      align: "center",
      width: 80,
    },
  ];

  return (
    <AdvisorLayout>
      <Spin spinning={loading}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: "0 16px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(20px, 5vw, 32px)",
                  fontWeight: 700,
                  color: "#c8102e",
                }}
              >
                👋 Xin chào, {user?.full_name}!
              </h1>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#999",
                  fontSize: "clamp(12px, 3vw, 14px)",
                }}
              >
                {dayjs().format("dddd, DD MMMM YYYY")}
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #fff 0%, #fef5f6 100%)",
                  }}
                >
                  <Statistic
                    title="Tổng thông báo"
                    value={statistics.total_notifications}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#c8102e", fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #fff 0%, #f0f5ff 100%)",
                  }}
                >
                  <Statistic
                    title="Tổng phản hồi"
                    value={statistics.total_responses}
                    prefix={<MessageOutlined />}
                    valueStyle={{ color: "#1890ff", fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #fff 0%, #f6ffed 100%)",
                  }}
                >
                  <Statistic
                    title="Đã đọc"
                    value={statistics.total_read}
                    suffix={`/${statistics.total_recipients}`}
                    valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                    prefix={<StarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #fff 0%, #fff1f0 100%)",
                  }}
                >
                  <Statistic
                    title="Tỉ lệ đọc"
                    value={statistics.read_percentage}
                    suffix="%"
                    precision={1}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#fa8c16", fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate("/advisor/notifications/create")}
              style={{
                background: "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                height: 40,
                flex: "1 1 auto",
                minWidth: "200px",
              }}
            >
              Tạo thông báo mới
            </Button>
          </div>

          {/* Recent Notifications */}
          <Card
            title={
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                📬 Thông báo gần đây
              </h2>
            }
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            {notifications.length > 0 ? (
              <Table
                columns={columns}
                dataSource={notifications}
                rowKey="notification_id"
                pagination={false}
                style={{ fontSize: 14 }}
                scroll={{ x: 800 }}
              />
            ) : (
              <Empty
                description="Chưa có thông báo nào"
                style={{ marginTop: 20, marginBottom: 20 }}
              />
            )}
          </Card>

          {/* Quick Stats Section */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title="Hoạt động hôm nay"
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <Empty description="Không có hoạt động nào hôm nay" />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="Tác vụ cần hoàn thành"
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <Empty description="Không có tác vụ nào" />
              </Card>
            </Col>
          </Row>
        </div>
      </Spin>
    </AdvisorLayout>
  );
};

export default AdvisorHome;
