import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Tabs,
  Table,
  Timeline,
  Modal,
  Form,
  Input,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  CommentOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  getMeetingDetailApi,
  downloadMeetingMinutesApi,
  sendMeetingFeedbackApi,
} from "../../../services/meeting.service";
import dayjs from "dayjs";

const { TextArea } = Input;

export const StudentMeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackForm] = Form.useForm();

  useEffect(() => {
    fetchMeetingDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMeetingDetail = async () => {
    try {
      setLoading(true);
      const response = await getMeetingDetailApi(id);
      if (response?.data) {
        setMeeting(response.data);
        // Set feedbacks from meeting detail response
        if (response.data.feedbacks) {
          setFeedbacks(response.data.feedbacks);
        }
      }
    } catch (error) {
      console.error("Error fetching meeting detail:", error);
      toast.error("Không thể tải chi tiết cuộc họp");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMinutes = async () => {
    if (!meeting) return;
    try {
      const response = await downloadMeetingMinutesApi(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Bien_ban_${meeting.title}_${dayjs().format(
        "YYYYMMDD"
      )}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Tải biên bản thành công");
    } catch (error) {
      console.error("Error downloading minutes:", error);
      toast.error("Không thể tải biên bản");
    }
  };

  const handleSendFeedback = async (values) => {
    try {
      await sendMeetingFeedbackApi(id, values.feedback_content);
      toast.success("Gửi phản hồi thành công");
      setIsFeedbackModalOpen(false);
      feedbackForm.resetFields();
      // Reload meeting detail to get updated feedbacks
      fetchMeetingDetail();
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Không thể gửi phản hồi");
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      scheduled: { color: "blue", text: "Sắp diễn ra" },
      completed: { color: "green", text: "Đã hoàn thành" },
      cancelled: { color: "red", text: "Đã hủy" },
    };
    const config = statusMap[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const attendanceColumns = [
    {
      title: "MSSV",
      dataIndex: ["student", "user_code"],
      key: "user_code",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: ["student", "full_name"],
      key: "full_name",
    },
    {
      title: "Trạng thái",
      dataIndex: "attended",
      key: "attended",
      width: 120,
      align: "center",
      render: (attended, record) => {
        const userId = parseInt(localStorage.getItem("user_id"));
        const isMe = record.student_id === userId;
        return (
          <div>
            {attended ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Có mặt
              </Tag>
            ) : (
              <Tag color="red" icon={<CloseCircleOutlined />}>
                Vắng
              </Tag>
            )}
            {isMe && (
              <Tag color="blue" className="ml-2">
                Bạn
              </Tag>
            )}
          </div>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: "info",
      label: (
        <span>
          <FileTextOutlined /> Thông tin
        </span>
      ),
      children: meeting && (
        <Card className="border-0 shadow-lg">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Lớp">
              <Tag color="blue" className="text-base px-3 py-1">
                {meeting.class?.class_name}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tiêu đề">
              <span className="font-semibold text-lg">{meeting.title}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian bắt đầu">
              <CalendarOutlined className="mr-2" />
              {dayjs(meeting.meeting_time).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            {meeting.end_time && (
              <Descriptions.Item label="Thời gian kết thúc">
                <CalendarOutlined className="mr-2" />
                {dayjs(meeting.end_time).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Địa điểm">
              <EnvironmentOutlined className="mr-2" />
              {meeting.location || "Chưa xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Link họp">
              {meeting.meeting_link ? (
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <LinkOutlined className="mr-2" />
                  {meeting.meeting_link}
                </a>
              ) : (
                <span className="text-gray-400">Chưa có link</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(meeting.status)}
            </Descriptions.Item>
            {meeting.summary && (
              <Descriptions.Item label="Tóm tắt">
                <div className="whitespace-pre-wrap">{meeting.summary}</div>
              </Descriptions.Item>
            )}
            {meeting.class_feedback && (
              <Descriptions.Item label="Phản hồi từ lớp">
                <div className="whitespace-pre-wrap">
                  {meeting.class_feedback}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ),
    },
    {
      key: "attendance",
      label: (
        <span>
          <TeamOutlined /> Điểm danh ({meeting?.attendees?.length || 0})
        </span>
      ),
      children: (
        <Table
          columns={attendanceColumns}
          dataSource={meeting?.attendees || []}
          rowKey="meeting_student_id"
          pagination={false}
          className="shadow-lg"
        />
      ),
    },
    {
      key: "minutes",
      label: (
        <span>
          <FileTextOutlined /> Biên bản
        </span>
      ),
      children: (
        <Card className="border-0 shadow-lg">
          {meeting?.minutes_file_path ? (
            <div className="text-center py-8">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileTextOutlined className="text-white text-5xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Biên bản đã được tải lên
              </h3>
              <p className="text-gray-500 mb-4">
                Tải xuống để xem chi tiết biên bản cuộc họp
              </p>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={handleDownloadMinutes}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg"
              >
                Tải xuống biên bản
              </Button>
            </div>
          ) : (
            <Empty description="Chưa có biên bản" />
          )}
          {meeting?.summary && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Tóm tắt cuộc họp:</h4>
              <div className="whitespace-pre-wrap">{meeting.summary}</div>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: "feedback",
      label: (
        <span>
          <CommentOutlined /> Phản hồi ({feedbacks.length})
        </span>
      ),
      children: (
        <div>
          <div className="mb-4">
            <Button
              type="primary"
              icon={<CommentOutlined />}
              onClick={() => setIsFeedbackModalOpen(true)}
              size="large"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
            >
              Gửi phản hồi
            </Button>
          </div>
          <Card className="border-0 shadow-lg">
            {feedbacks.length > 0 ? (
              <Timeline
                items={feedbacks.map((fb) => ({
                  children: (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold">
                            {fb.student?.full_name}
                          </span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {dayjs(fb.created_at).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>
                      <div className="text-gray-700">{fb.feedback_content}</div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="Chưa có phản hồi nào" />
            )}
          </Card>
        </div>
      ),
    },
  ];

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/student/meetings")}
            size="large"
            className="mb-4 hover:scale-105 transition-transform"
          >
            Quay lại
          </Button>

          <Card
            className="shadow-2xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm"
            loading={loading}
          >
            {meeting && (
              <>
                <div className="mb-5">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {meeting.title}
                  </h1>
                  <div className="flex gap-2">
                    <Tag color="blue">{meeting.class?.class_name}</Tag>
                    {getStatusTag(meeting.status)}
                  </div>
                </div>

                <Tabs items={tabItems} size="large" />
              </>
            )}
          </Card>

          {/* Feedback Modal */}
          <Modal
            title="Gửi phản hồi cuộc họp"
            open={isFeedbackModalOpen}
            onCancel={() => {
              setIsFeedbackModalOpen(false);
              feedbackForm.resetFields();
            }}
            footer={null}
            width={600}
          >
            <Form
              form={feedbackForm}
              onFinish={handleSendFeedback}
              layout="vertical"
            >
              <Form.Item
                name="feedback_content"
                label="Nội dung phản hồi"
                rules={[{ required: true, message: "Vui lòng nhập phản hồi" }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Nhập phản hồi của bạn về cuộc họp..."
                />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" size="large" block>
                  Gửi phản hồi
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentMeetingDetail;
