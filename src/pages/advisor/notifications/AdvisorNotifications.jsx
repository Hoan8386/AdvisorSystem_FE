import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  getNotificationsAPI,
  deleteNotificationAPI,
} from "../../../services/api.service";
import {
  Button,
  Table,
  Modal,
  Card,
  Tag,
  Space,
  Empty,
  Input,
  Row,
  Col,
  Select,
  Popconfirm,
  Skeleton,
  Spin,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export const AdvisorNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    fetchNotifications();
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

  const performDelete = async (id) => {
    try {
      setLoading(true);
      const res = await deleteNotificationAPI(id);

      if (res?.success) {
        toast.success("Thông báo đã được xoá thành công");
        fetchNotifications();
      } else {
        toast.error("Không thể xoá thông báo");
      }
    } catch (error) {
      console.error("Delete error:", error);
      console.error("Delete error response:", error?.response);
      toast.error(error?.message || "Lỗi khi xoá thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    navigate(`/advisor/notifications/${record.notification_id}/edit`, {
      state: { notification: record },
    });
  };

  const handleViewResponses = (record) => {
    navigate(`/advisor/notifications/${record.notification_id}/responses`);
  };

  const handleCreateNew = () => {
    navigate("/advisor/notifications/create");
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((item) => {
    const matchSearch =
      item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === "all" || item.type === filterType;
    return matchSearch && matchType;
  });

  const columns = [
    {
      title: <span className="font-semibold text-gray-700">📝 Tiêu đề</span>,
      dataIndex: "title",
      key: "title",
      width: 300,
      render: (text, record) => (
        <div className="py-1">
          <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
            {text}
          </div>
          <div className="text-xs text-gray-500">
            ID: {record.notification_id}
          </div>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-gray-700">🏷️ Loại</span>,
      dataIndex: "type",
      key: "type",
      width: 140,
      align: "center",
      render: (type) => {
        const typeMap = {
          general: {
            text: "Thông báo chung",
            color: "#1890ff",
            bgColor: "#e6f7ff",
            icon: "📢",
          },
          academic: {
            text: "Học tập",
            color: "#ff4d4f",
            bgColor: "#fff1f0",
            icon: "📚",
          },
          event: {
            text: "Sự kiện",
            color: "#52c41a",
            bgColor: "#f6ffed",
            icon: "🎉",
          },
          urgent: {
            text: "Khẩn",
            color: "#fa8c16",
            bgColor: "#fff7e6",
            icon: "⚠️",
          },
        };
        const typeInfo = typeMap[type] || {
          text: type,
          color: "#999",
          bgColor: "#f5f5f5",
          icon: "📌",
        };
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: typeInfo.bgColor,
              color: typeInfo.color,
              fontSize: "12px",
              fontWeight: 600,
              border: `1px solid ${typeInfo.color}30`,
            }}
          >
            <span>{typeInfo.icon}</span>
            <span>{typeInfo.text}</span>
          </div>
        );
      },
    },
    {
      title: <span className="font-semibold text-gray-700">👥 Lớp</span>,
      dataIndex: "classes",
      key: "classes",
      align: "center",
      width: 90,
      render: (classes) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "#f0f5ff",
            color: "#1890ff",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          {classes ? classes.length : 0}
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-gray-700">💬 Phản hồi</span>,
      dataIndex: "responses_count",
      key: "responses_count",
      align: "center",
      width: 100,
      render: (count) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: count > 0 ? "#f6ffed" : "#fafafa",
            color: count > 0 ? "#52c41a" : "#999",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          {count || 0}
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-gray-700">📅 Ngày tạo</span>,
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (date) => (
        <div className="text-xs">
          <div className="font-medium text-gray-700">
            {dayjs(date).format("DD/MM/YYYY")}
          </div>
          <div className="text-gray-500">{dayjs(date).format("HH:mm")}</div>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-gray-700">⚙️ Thao tác</span>,
      key: "action",
      width: 200,

      render: (_, record) => (
        <div className="flex items-center gap-1.5 justify-start">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewResponses(record)}
            className="flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              borderRadius: "6px",
              fontWeight: 500,
              boxShadow: "0 2px 4px rgba(24, 144, 255, 0.2)",
              padding: "0 8px",
              minWidth: "32px",
            }}
          >
            <span className="hidden lg:inline ml-1">Xem</span>
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="flex-shrink-0"
            style={{
              borderRadius: "6px",
              fontWeight: 500,
              borderColor: "#d9d9d9",
              padding: "0 8px",
              minWidth: "32px",
            }}
          >
            <span className="hidden lg:inline ml-1">Sửa</span>
          </Button>
          <Popconfirm
            title={<span className="font-semibold">Xoá thông báo</span>}
            description="Bạn chắc chắn muốn xoá thông báo này?"
            onConfirm={() => performDelete(record.notification_id)}
            okText="Xoá"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
              style: { borderRadius: "6px", fontWeight: 500 },
            }}
            cancelButtonProps={{
              style: { borderRadius: "6px" },
            }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="flex-shrink-0"
              style={{
                borderRadius: "6px",
                fontWeight: 500,
                padding: "0 8px",
                minWidth: "32px",
              }}
            >
              <span className="hidden lg:inline ml-1">Xoá</span>
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <AdvisorLayout>
      <Spin spinning={loading} size="large" tip="Đang tải...">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: "0 16px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(20px, 5vw, 28px)",
                  fontWeight: 700,
                  color: "#c8102e",
                }}
              >
                📬 Quản lý thông báo
              </h1>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#999",
                  fontSize: "clamp(12px, 3vw, 14px)",
                }}
              >
                Tổng {filteredNotifications.length} thông báo
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                height: 40,
                flex: "0 1 auto",
                minWidth: "180px",
              }}
            >
              Tạo thông báo mới
            </Button>
          </div>

          {/* Filters */}
          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: "16px" }}
            loading={loading}
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={8}>
                <Input
                  placeholder="Tìm kiếm thông báo..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  disabled={loading}
                  style={{ borderRadius: 6 }}
                />
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  disabled={loading}
                  options={[
                    { label: "Tất cả loại", value: "all" },
                    { label: "Thông báo chung", value: "general" },
                    { label: "Học tập", value: "academic" },
                    { label: "Sự kiện", value: "event" },
                    { label: "Khẩn", value: "urgent" },
                  ]}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col
                xs={24}
                sm={12}
                lg={8}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  onClick={() => setSearchText("")}
                  disabled={loading}
                  style={{ width: "100%" }}
                >
                  Xóa bộ lọc
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Notifications Table */}
          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: 0 }}
            loading={loading}
          >
            {filteredNotifications.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filteredNotifications}
                rowKey="notification_id"
                loading={loading}
                pagination={{
                  pageSize: pagination.pageSize,
                  current: pagination.current,
                  onChange: (page, pageSize) => {
                    setPagination({ current: page, pageSize });
                  },
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} thông báo`,
                  pageSizeOptions: ["5", "10", "20", "50"],
                }}
                scroll={{ x: 1200 }}
              />
            ) : (
              <div style={{ padding: "40px 20px" }}>
                <Empty
                  description={
                    searchText || filterType !== "all"
                      ? "Không tìm thấy thông báo nào"
                      : "Chưa có thông báo nào"
                  }
                />
              </div>
            )}
          </Card>
        </div>
      </Spin>
    </AdvisorLayout>
  );
};

export default AdvisorNotifications;
