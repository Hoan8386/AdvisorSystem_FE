import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../components/context/auth.context";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  updateNotificationResponseAPI,
  getNotificationResponsesAPI,
} from "../../../services/api.service";
import {
  Card,
  Table,
  Button,
  Spin,
  Empty,
  Tag,
  Modal,
  Input,
  Space,
  Avatar,
  Divider,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  EyeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text } = Typography;

export const NotificationResponses = () => {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]);

  // State cho Modal Trả lời
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // State cho Modal Xem chi tiết
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "advisor") {
      navigate("/login");
      return;
    }
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, notificationId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await getNotificationResponsesAPI(notificationId);

      if (res?.success || res?.data) {
        const data = res.data || res;
        setResponses(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Lỗi khi tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (response) => {
    setSelectedResponse(response);
    setReplyContent("");
    setReplyModalOpen(true);
  };

  const handleViewDetail = (record) => {
    setViewData(record);
    setViewModalOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung trả lời");
      return;
    }

    if (replyContent.trim().length < 10) {
      toast.warning("Nội dung trả lời phải có ít nhất 10 ký tự");
      return;
    }

    try {
      setReplyLoading(true);
      const res = await updateNotificationResponseAPI(
        selectedResponse.response_id,
        {
          advisor_response: replyContent,
          status: "resolved", // Cập nhật status theo JSON mẫu
        }
      );

      if (res?.success) {
        toast.success("✓ Trả lời thành công!");
        setReplyModalOpen(false);
        setReplyContent("");
        setSelectedResponse(null);
        fetchResponses();
      }
    } catch (error) {
      toast.error(error?.message || "Lỗi khi trả lời phản hồi");
    } finally {
      setReplyLoading(false);
    }
  };

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "student",
      key: "student_name",
      width: 220,
      render: (student) => {
        const userInfo = student?.user || student; // Fallback nếu cấu trúc JSON thay đổi
        return (
          <Space>
            <Avatar icon={<UserOutlined />} src={userInfo?.avatar_url} />
            <div>
              <div style={{ fontWeight: 600 }}>{userInfo?.full_name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>
                {userInfo?.user_code} - {student?.class?.class_name}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Nội dung phản hồi",
      dataIndex: "content",
      key: "content",
      width: 300,
      render: (text) => (
        <div
          style={{ color: "#666", fontSize: 13, lineHeight: 1.5 }}
          className="line-clamp-2"
        >
          {text}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusMap = {
          pending: { text: "Chờ phản hồi", color: "orange" },
          resolved: { text: "Đã phản hồi", color: "green" }, // Map đúng với JSON response
          rejected: { text: "Từ chối", color: "red" },
        };
        const statusInfo = statusMap[status] || {
          text: status,
          color: "default",
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "Ngày gửi",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => (
        <span title={dayjs(date).fromNow()}>
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          {/* Nút Xem chi tiết - Luôn hiện */}
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          >
            Xem
          </Button>

          {/* Nút Trả lời - Chỉ hiện khi chưa trả lời */}
          {record.status === "pending" && (
            <Button
              type="primary"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => handleReply(record)}
              style={{ background: "#faad14", border: "none" }}
            >
              Trả lời
            </Button>
          )}
        </Space>
      ),
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/advisor/notifications")}
              type="text"
              style={{ fontSize: 18 }}
            >
              Quay lại
            </Button>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(20px, 5vw, 28px)",
                fontWeight: 700,
                color: "#c8102e",
              }}
            >
              Phản hồi từ sinh viên
            </h1>
          </div>

          {/* Responses Table */}
          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: 0 }}
          >
            {responses.length > 0 ? (
              <Table
                columns={columns}
                dataSource={responses}
                rowKey="response_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} phản hồi`,
                }}
                scroll={{ x: 1000 }}
              />
            ) : (
              <div style={{ padding: "40px 20px" }}>
                <Empty description="Chưa có phản hồi nào" />
              </div>
            )}
          </Card>
        </div>
      </Spin>

      {/* Reply Modal (Form trả lời) */}
      <Modal
        title="💬 Trả lời phản hồi"
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setReplyModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={replyLoading}
            onClick={handleSubmitReply}
            style={{ background: "#faad14", border: "none" }}
          >
            Gửi trả lời
          </Button>,
        ]}
      >
        {selectedResponse && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Text strong>Sinh viên hỏi:</Text>
              <div style={{ marginTop: 4, color: "#555" }}>
                {selectedResponse.content}
              </div>
            </div>
            <div>
              <Text strong>Trả lời của giáo viên:</Text>
              <Input.TextArea
                rows={4}
                placeholder="Nhập nội dung trả lời..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* View Detail Modal (Xem chi tiết câu hỏi & câu trả lời) */}
      <Modal
        title="📄 Chi tiết hội thoại"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {viewData && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Thông tin sinh viên */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingBottom: 12,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Avatar
                size="large"
                src={viewData.student?.avatar_url}
                icon={<UserOutlined />}
              />
              <div>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>
                  {viewData.student?.full_name ||
                    viewData.student?.user?.full_name}
                </div>
                <div style={{ color: "#888" }}>
                  {viewData.student?.user_code ||
                    viewData.student?.user?.user_code}
                  {viewData.student?.class &&
                    ` - ${viewData.student.class.class_name}`}
                </div>
              </div>
            </div>

            {/* Câu hỏi của sinh viên */}
            <Card
              size="small"
              title={
                <span style={{ color: "#1890ff" }}>
                  ❓ Câu hỏi của sinh viên
                </span>
              }
              style={{ background: "#e6f7ff", borderColor: "#91d5ff" }}
              headStyle={{
                borderBottom: "1px solid #91d5ff",
                minHeight: "auto",
                padding: "0 12px",
              }}
            >
              <div style={{ fontSize: 14, color: "#0050b3" }}>
                {viewData.content}
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontSize: 11,
                  color: "#0050b3",
                  marginTop: 8,
                  fontStyle: "italic",
                }}
              >
                Gửi lúc: {dayjs(viewData.created_at).format("HH:mm DD/MM/YYYY")}
              </div>
            </Card>

            {/* Câu trả lời của giảng viên (nếu có) */}
            {viewData.advisor_response ? (
              <Card
                size="small"
                title={
                  <span style={{ color: "#52c41a" }}>
                    ✅ Trả lời của giảng viên
                  </span>
                }
                style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}
                headStyle={{
                  borderBottom: "1px solid #b7eb8f",
                  minHeight: "auto",
                  padding: "0 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: "#389e0d",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {viewData.advisor_response}
                </div>
                {viewData.response_at && (
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: "#389e0d",
                      marginTop: 8,
                      fontStyle: "italic",
                    }}
                  >
                    Trả lời lúc:{" "}
                    {dayjs(viewData.response_at).format("HH:mm DD/MM/YYYY")}
                  </div>
                )}
              </Card>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  padding: "20px",
                  border: "1px dashed #d9d9d9",
                  borderRadius: 8,
                }}
              >
                Giảng viên chưa phản hồi nội dung này.
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdvisorLayout>
  );
};

export default NotificationResponses;
