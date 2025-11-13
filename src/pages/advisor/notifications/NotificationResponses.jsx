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
} from "antd";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const NotificationResponses = () => {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

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

  // Remove unused function - handleLogoutClick not needed in this component
  const columns = [
    {
      title: "Học sinh",
      dataIndex: ["student", "user"],
      key: "student_name",
      width: 200,
      render: (userInfo) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{userInfo?.full_name}</div>
            <div style={{ fontSize: 12, color: "#999" }}>
              {userInfo?.user_code}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Nội dung phản hồi",
      dataIndex: "content",
      key: "content",
      width: 300,
      render: (text) => (
        <div style={{ color: "#666", fontSize: 13, lineHeight: 1.5 }}>
          {text}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { text: "Chờ phản hồi", color: "orange" },
          replied: { text: "Đã trả lời", color: "green" },
          rejected: { text: "Từ chối", color: "volcano" },
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
        <span title={dayjs(date).format("DD/MM/YYYY HH:mm")}>
          {dayjs(date).fromNow()}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === "pending" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleReply(record)}
              style={{ background: "#faad14", border: "none" }}
            >
              Trả lời
            </Button>
          )}
          {record.status === "replied" && (
            <span style={{ color: "green", fontSize: 12 }}>✓ Đã trả lời</span>
          )}
        </Space>
      ),
    },
  ];

  const handleReply = (response) => {
    setSelectedResponse(response);
    setReplyContent("");
    setReplyModalOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      setReplyLoading(true);
      const res = await updateNotificationResponseAPI(
        selectedResponse.response_id,
        {
          advisor_response: replyContent,
          status: "resolved",
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
              📋 Phản hồi từ sinh viên
            </h1>
          </div>

          {/* Responses Table */}
          <Card
            title={
              <h3
                style={{
                  margin: 0,
                  fontSize: "clamp(16px, 4vw, 18px)",
                  fontWeight: 600,
                }}
              >
                📌 Danh sách phản hồi ({responses.length})
              </h3>
            }
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
                  responsive: true,
                }}
                scroll={{ x: 1000 }}
                style={{ fontSize: 14 }}
              />
            ) : (
              <div style={{ padding: "40px 20px" }}>
                <Empty description="Chưa có phản hồi nào" />
              </div>
            )}
          </Card>
        </div>
      </Spin>

      {/* Reply Modal */}
      <Modal
        title={
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              💬 Trả lời phản hồi
            </h2>
          </div>
        }
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
        width={600}
        style={{ top: 20 }}
      >
        {selectedResponse && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Student Info */}
            <Card
              style={{
                background: "linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)",
                border: "1px solid #e8e8e8",
              }}
              bodyStyle={{ padding: "12px 16px" }}
            >
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>
                    {selectedResponse.student?.user?.full_name}
                  </div>
                  <div style={{ color: "#999", fontSize: 12 }}>
                    {selectedResponse.student?.user?.user_code}
                  </div>
                </div>
              </Space>
            </Card>

            <Divider style={{ margin: "8px 0" }} />

            {/* Student Response */}
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
                Phản hồi của sinh viên:
              </span>
              <Card
                style={{
                  marginTop: 8,
                  background: "#f9f9f9",
                  border: "1px solid #e8e8e8",
                }}
                bodyStyle={{ padding: "12px" }}
              >
                <p style={{ margin: 0, color: "#666", lineHeight: 1.5 }}>
                  {selectedResponse.content}
                </p>
              </Card>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            {/* Reply Form */}
            <div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#333",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Trả lời của giáo viên:
              </span>
              <Input.TextArea
                rows={4}
                placeholder="Nhập nội dung trả lời..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                maxLength={5000}
                showCount
                style={{ fontSize: 13 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </AdvisorLayout>
  );
};

export default NotificationResponses;
