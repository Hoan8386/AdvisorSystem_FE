import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Select,
  DatePicker,
  Button,
  Empty,
  Modal,
  Input,
  Space,
  Form,
} from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  DownloadOutlined,
  SearchOutlined,
  MessageOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  getMeetingsApi,
  downloadMeetingMinutesApi,
  sendMeetingFeedbackApi,
} from "../../../services/meeting.service";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const StudentMeetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    from_date: null,
    to_date: null,
  });

  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;

      const response = await getMeetingsApi(params);
      if (response?.data) {
        const meetingData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setMeetings(meetingData);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Không thể tải danh sách cuộc họp");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMinutes = async (meetingId, title) => {
    try {
      const blob = await downloadMeetingMinutesApi(meetingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Bien_ban_${title}_${dayjs().format("YYYYMMDD")}.pdf`;
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

  const handleOpenFeedbackModal = (meetingId) => {
    setSelectedMeetingId(meetingId);
    feedbackForm.resetFields();
    setFeedbackModalVisible(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setSelectedMeetingId(null);
    feedbackForm.resetFields();
  };

  const handleSubmitFeedback = async (values) => {
    try {
      setFeedbackLoading(true);
      await sendMeetingFeedbackApi(selectedMeetingId, values.feedback_content);
      toast.success("Gửi feedback thành công");
      handleCloseFeedbackModal();
      fetchMeetings();
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Không thể gửi feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters((prev) => ({
        ...prev,
        from_date: dates[0].format("YYYY-MM-DD"),
        to_date: dates[1].format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        from_date: null,
        to_date: null,
      }));
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

  const columns = [
    {
      title: "Lớp",
      dataIndex: ["class", "class_name"],
      key: "class_name",
      width: 120,
      render: (text) => (
        <Tag color="blue" className="font-semibold">
          {text}
        </Tag>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          {record.location && (
            <div className="text-xs text-gray-500">📍 {record.location}</div>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "meeting_time",
      key: "meeting_time",
      width: 150,
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 250,
      align: "center",
      render: (_, record) => (
        <Space direction="vertical" size="small" className="w-full">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/student/meetings/${record.meeting_id}`)}
            size="small"
            block
          >
            Xem
          </Button>
          {record.status === "completed" && record.minutes_file_path && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() =>
                handleDownloadMinutes(record.meeting_id, record.title)
              }
              size="small"
              block
            >
              Biên bản
            </Button>
          )}
          <Button
            icon={<MessageOutlined />}
            onClick={() => handleOpenFeedbackModal(record.meeting_id)}
            size="small"
            block
          >
            Feedback
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 md:mb-5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              <CalendarOutlined className="mr-2 md:mr-3" />
              Cuộc họp lớp
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Danh sách các cuộc họp của lớp bạn
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-4 md:mb-5 shadow-lg rounded-2xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Select
                placeholder="Trạng thái"
                allowClear
                size="middle"
                className="w-full sm:w-48"
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { value: null, label: "Tất cả" },
                  { value: "scheduled", label: "Sắp diễn ra" },
                  { value: "completed", label: "Đã hoàn thành" },
                  { value: "cancelled", label: "Đã hủy" },
                ]}
              />
              <DatePicker.RangePicker
                size="middle"
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                className="w-full sm:w-auto"
                onChange={(dates) => {
                  if (dates && dates.length === 2) {
                    setFilters((prev) => ({
                      ...prev,
                      from_date: dates[0].format("YYYY-MM-DD"),
                      to_date: dates[1].format("YYYY-MM-DD"),
                    }));
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      from_date: null,
                      to_date: null,
                    }));
                  }
                }}
              />
              <Button
                icon={<ReloadOutlined />}
                className="w-full sm:w-auto"
                onClick={() => {
                  setFilters({
                    status: null,
                    from_date: null,
                    to_date: null,
                  });
                  setTimeout(() => fetchMeetings(), 0);
                }}
              >
                Làm mới
              </Button>
            </div>
          </Card>

          {/* Table */}
          <Card
            style={{ marginTop: "20px" }}
            className="shadow-2xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm overflow-x-auto mt-5"
            title={
              <span className="text-base sm:text-lg md:text-xl font-semibold">
                <CalendarOutlined className="mr-2" />
                Danh sách cuộc họp
              </span>
            }
          >
            <Table
              columns={columns}
              dataSource={meetings}
              rowKey="meeting_id"
              loading={loading}
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng ${total} cuộc họp`,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                responsive: true,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      <div className="py-8">
                        <p className="text-gray-500 text-base md:text-lg">
                          Chưa có cuộc họp nào
                        </p>
                      </div>
                    }
                  />
                ),
              }}
            />
          </Card>
        </div>

        {/* Feedback Modal */}
        <Modal
          title="Gửi Feedback"
          open={feedbackModalVisible}
          onCancel={handleCloseFeedbackModal}
          footer={null}
          width={600}
        >
          <Form
            form={feedbackForm}
            onFinish={handleSubmitFeedback}
            layout="vertical"
          >
            <Form.Item
              name="feedback_content"
              label="Nội dung feedback"
              rules={[{ required: true, message: "Vui lòng nhập feedback" }]}
            >
              <Input.TextArea
                rows={5}
                placeholder="Nhập nội dung feedback của bạn..."
              />
            </Form.Item>
            <Form.Item className="mb-0">
              <Space style={{ width: "100%" }} size="middle">
                <Button block onClick={handleCloseFeedbackModal}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  block
                  htmlType="submit"
                  loading={feedbackLoading}
                >
                  Gửi
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </StudentLayout>
  );
};

export default StudentMeetings;
