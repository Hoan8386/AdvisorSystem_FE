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
} from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  DownloadOutlined,
  SearchOutlined,
  MessageOutlined,
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
  const [feedbackText, setFeedbackText] = useState("");
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
    setFeedbackText("");
    setFeedbackModalVisible(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setFeedbackText("");
    setSelectedMeetingId(null);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error("Vui lòng nhập nội dung feedback");
      return;
    }

    try {
      setFeedbackLoading(true);
      await sendMeetingFeedbackApi(selectedMeetingId, feedbackText);
      toast.success("Gửi feedback thành công");
      handleCloseFeedbackModal();
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
        <div className="flex gap-2 justify-center">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/student/meetings/${record.meeting_id}`)}
            size="small"
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
            >
              Biên bản
            </Button>
          )}
          <Button
            icon={<MessageOutlined />}
            onClick={() => handleOpenFeedbackModal(record.meeting_id)}
            size="small"
          >
            Feedback
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              <CalendarOutlined className="mr-3" />
              Cuộc họp lớp
            </h1>
            <p className="text-gray-600 text-lg">
              Danh sách các cuộc họp của lớp bạn
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-5 shadow-lg rounded-2xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="flex flex-wrap gap-4">
              <Select
                placeholder="Trạng thái"
                allowClear
                size="large"
                style={{ width: 200 }}
                onChange={handleStatusChange}
                options={[
                  { value: null, label: "Tất cả" },
                  { value: "scheduled", label: "Sắp diễn ra" },
                  { value: "completed", label: "Đã hoàn thành" },
                  { value: "cancelled", label: "Đã hủy" },
                ]}
              />
              <RangePicker
                size="large"
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                onChange={handleDateRangeChange}
              />
            </div>
          </Card>

          {/* Table */}
          <Card
            className="shadow-2xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm"
            title={
              <span className="text-xl font-semibold">
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
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng ${total} cuộc họp`,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      <div className="py-8">
                        <p className="text-gray-500 text-lg">
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
          onOk={handleSubmitFeedback}
          onCancel={handleCloseFeedbackModal}
          confirmLoading={feedbackLoading}
          width={600}
          okText="Gửi"
          cancelText="Hủy"
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Input.TextArea
              rows={5}
              placeholder="Nhập nội dung feedback của bạn..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <p className="text-gray-500 text-sm">
              Feedback của bạn sẽ giúp cải thiện chất lượng các cuộc họp tới.
            </p>
          </Space>
        </Modal>
      </div>
    </StudentLayout>
  );
};

export default StudentMeetings;
