import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  getNotificationsAPI,
  deleteNotificationAPI,
  getNotificationReadStatisticsAPI,
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
  Spin,
  Tabs,
  Statistic,
  Progress,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined, // Giữ lại icon cho nút Tạo mới (nằm ngoài table)
  SearchOutlined, // Giữ lại icon cho nút Search (nằm ngoài input)
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
  const [statisticsModal, setStatisticsModal] = useState({
    visible: false,
    data: null,
    loading: false,
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

  const handleViewStatistics = async (record) => {
    try {
      setStatisticsModal((prev) => ({ ...prev, loading: true, visible: true }));
      const res = await getNotificationReadStatisticsAPI(
        record.notification_id
      );
      if (res && res.success) {
        setStatisticsModal((prev) => ({
          ...prev,
          data: { ...res.data, notification_title: record.title },
          loading: false,
        }));
      } else {
        toast.error("Không thể tải thống kê");
        setStatisticsModal((prev) => ({
          ...prev,
          visible: false,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Lỗi khi tải thống kê");
      setStatisticsModal((prev) => ({
        ...prev,
        visible: false,
        loading: false,
      }));
    }
  };

  const handleCloseStatisticsModal = () => {
    setStatisticsModal((prev) => ({ ...prev, visible: false, data: null }));
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
      title: <span className="font-semibold text-gray-700">Tiêu đề</span>,
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
      title: <span className="font-semibold text-gray-700">Loại</span>,
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
          },
          academic: {
            text: "Học tập",
            color: "#ff4d4f",
            bgColor: "#fff1f0",
          },
          event: {
            text: "Sự kiện",
            color: "#52c41a",
            bgColor: "#f6ffed",
          },
          urgent: {
            text: "Khẩn",
            color: "#fa8c16",
            bgColor: "#fff7e6",
          },
        };
        const typeInfo = typeMap[type] || {
          text: type,
          color: "#999",
          bgColor: "#f5f5f5",
        };
        // Đã bỏ icon trong render
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
            <span>{typeInfo.text}</span>
          </div>
        );
      },
    },
    {
      title: <span className="font-semibold text-gray-700">Lớp</span>,
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
      title: <span className="font-semibold text-gray-700">Phản hồi</span>,
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
      title: <span className="font-semibold text-gray-700">Ngày tạo</span>,
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
      title: <span className="font-semibold text-gray-700">Thao tác</span>,
      key: "action",
      width: 250, // Tăng width một chút vì text dài hơn icon
      render: (_, record) => (
        <div className="flex items-center gap-1.5 justify-start">
          {/* Đã bỏ prop icon trong các Button */}
          <Button
            type="primary"
            size="small"
            onClick={() => handleViewResponses(record)}
            className="flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              borderRadius: "6px",
              fontWeight: 500,
              boxShadow: "0 2px 4px rgba(24, 144, 255, 0.2)",
              padding: "0 8px",
            }}
            title="Xem phản hồi"
          >
            <span>Xem</span>
          </Button>
          <Button
            size="small"
            onClick={() => handleViewStatistics(record)}
            className="flex-shrink-0"
            style={{
              borderRadius: "6px",
              fontWeight: 500,
              borderColor: "#faad14",
              color: "#faad14",
              padding: "0 8px",
            }}
            title="Xem thống kê"
          >
            <span>Thống kê</span>
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => handleEdit(record)}
            className="flex-shrink-0"
            style={{
              borderRadius: "6px",
              fontWeight: 500,
              borderColor: "#d9d9d9",
              padding: "0 8px",
            }}
          >
            <span>Sửa</span>
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
              className="flex-shrink-0"
              style={{
                borderRadius: "6px",
                fontWeight: 500,
                padding: "0 8px",
              }}
            >
              <span>Xoá</span>
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
                Quản lý thông báo
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
                {/* Thay đổi layout input search tại đây */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <Input
                    placeholder="Tìm kiếm thông báo..."
                    // Đã bỏ prefix icon
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    disabled={loading}
                    style={{ borderRadius: 6 }}
                  />
                  <Button
                    icon={<SearchOutlined />}
                    disabled={loading}
                    style={{ borderRadius: 6 }}
                    // Nút search nằm rời bên cạnh
                  />
                </div>
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

      {/* Statistics Modal */}
      <Modal
        title={
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            Thống kê thông báo
          </span>
        }
        open={statisticsModal.visible}
        onCancel={handleCloseStatisticsModal}
        width={900}
        footer={[
          <Button key="close" onClick={handleCloseStatisticsModal}>
            Đóng
          </Button>,
        ]}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <Spin spinning={statisticsModal.loading}>
          {statisticsModal.data && (
            <>
              <Card
                style={{
                  marginBottom: 16,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: 8,
                }}
              >
                <div className="text-center">
                  <h3 style={{ color: "white", marginBottom: 16 }}>
                    {statisticsModal.data.notification_title}
                  </h3>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title={
                          <span style={{ color: "rgba(255,255,255,0.7)" }}>
                            Tổng cộng
                          </span>
                        }
                        value={statisticsModal.data.total_recipients}
                        valueStyle={{ color: "white", fontSize: "28px" }}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title={
                          <span style={{ color: "rgba(255,255,255,0.7)" }}>
                            Đã đọc
                          </span>
                        }
                        value={statisticsModal.data.total_read}
                        suffix={
                          <span style={{ color: "rgba(255,255,255,0.7)" }}>
                            ({statisticsModal.data.read_percentage}%)
                          </span>
                        }
                        valueStyle={{ color: "#52c41a", fontSize: "28px" }}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title={
                          <span style={{ color: "rgba(255,255,255,0.7)" }}>
                            Chưa đọc
                          </span>
                        }
                        value={statisticsModal.data.total_unread}
                        valueStyle={{ color: "#ff4d4f", fontSize: "28px" }}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16 }}>
                    <Progress
                      type="circle"
                      percent={Math.round(statisticsModal.data.read_percentage)}
                      width={120}
                      strokeColor={{
                        "0%": "#108ee9",
                        "100%": "#87d068",
                      }}
                    />
                  </div>
                </div>
              </Card>

              <Tabs
                items={[
                  {
                    key: "read",
                    label: (
                      <span>
                        Đã đọc ({statisticsModal.data.read_students.length})
                      </span>
                    ),
                    children: (
                      <div>
                        {statisticsModal.data.read_students.length > 0 ? (
                          <Table
                            dataSource={statisticsModal.data.read_students}
                            rowKey="student_id"
                            size="small"
                            pagination={false}
                            columns={[
                              {
                                title: "Mã SV",
                                dataIndex: "student_id",
                                key: "student_id",
                                width: 80,
                                render: (id) => (
                                  <span style={{ fontWeight: 600 }}>#{id}</span>
                                ),
                              },
                              {
                                title: "Tên sinh viên",
                                dataIndex: "full_name",
                                key: "full_name",
                                render: (text) => (
                                  <span style={{ fontWeight: 500 }}>
                                    {text}
                                  </span>
                                ),
                              },
                              {
                                title: "Email",
                                dataIndex: "email",
                                key: "email",
                              },
                              {
                                title: "Lớp",
                                dataIndex: ["class", "class_name"],
                                key: "class",
                                render: (text) => (
                                  <Tag color="blue">{text}</Tag>
                                ),
                              },
                            ]}
                          />
                        ) : (
                          <Empty description="Chưa có sinh viên nào đọc" />
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "unread",
                    label: (
                      <span>
                        Chưa đọc ({statisticsModal.data.unread_students.length})
                      </span>
                    ),
                    children: (
                      <div>
                        {statisticsModal.data.unread_students.length > 0 ? (
                          <Table
                            dataSource={statisticsModal.data.unread_students}
                            rowKey="student_id"
                            size="small"
                            pagination={false}
                            columns={[
                              {
                                title: "Mã SV",
                                dataIndex: "student_id",
                                key: "student_id",
                                width: 80,
                                render: (id) => (
                                  <span style={{ fontWeight: 600 }}>#{id}</span>
                                ),
                              },
                              {
                                title: "Tên sinh viên",
                                dataIndex: "full_name",
                                key: "full_name",
                                render: (text) => (
                                  <span style={{ fontWeight: 500 }}>
                                    {text}
                                  </span>
                                ),
                              },
                              {
                                title: "Email",
                                dataIndex: "email",
                                key: "email",
                              },
                              {
                                title: "Lớp",
                                dataIndex: ["class", "class_name"],
                                key: "class",
                                render: (text) => <Tag color="red">{text}</Tag>,
                              },
                            ]}
                          />
                        ) : (
                          <Empty description="Tất cả sinh viên đều đã đọc" />
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </>
          )}
        </Spin>
      </Modal>
    </AdvisorLayout>
  );
};

export default AdvisorNotifications;
