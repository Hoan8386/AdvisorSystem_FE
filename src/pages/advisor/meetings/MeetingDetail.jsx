import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Table,
  Modal,
  Input,
  Upload,
  Tabs,
  Timeline,
  Divider,
  Progress,
  Badge,
  Empty,
  Checkbox,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileWordOutlined,
  MessageOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserAddOutlined,
  LinkOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getMeetingDetailApi,
  downloadMeetingMinutesApi,
  uploadMeetingMinutesApi,
  deleteMeetingMinutesApi,
  exportMeetingMinutesApi,
  sendMeetingFeedbackApi,
  getMeetingFeedbacksApi,
  updateAttendanceApi,
} from "../../../services/meeting.service";
import dayjs from "dayjs";

const { TextArea } = Input;
const { confirm } = Modal;

export const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    fetchMeetingDetail();
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMeetingDetail = async () => {
    try {
      setLoading(true);
      const response = await getMeetingDetailApi(id);
      if (response?.data) {
        setMeeting(response.data);
      }
    } catch (error) {
      console.error("Error fetching meeting detail:", error);
      toast.error("Không thể tải thông tin cuộc họp");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await getMeetingFeedbacksApi(id);
      if (response?.data) {
        setFeedbacks(response.data);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  const handleDownloadMinutes = async () => {
    try {
      const response = await downloadMeetingMinutesApi(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BienBan_${meeting?.class?.class_name}_${dayjs(
          meeting?.meeting_time
        ).format("DDMMYYYY")}.docx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Tải biên bản thành công");
    } catch (error) {
      console.error("Error downloading minutes:", error);
      toast.error("Không thể tải biên bản");
    }
  };

  const handleExportMinutes = async () => {
    try {
      const response = await exportMeetingMinutesApi(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BienBan_${meeting?.class?.class_name}_${dayjs(
          meeting?.meeting_time
        ).format("DDMMYYYY")}.docx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Xuất biên bản thành công");
      fetchMeetingDetail();
    } catch (error) {
      console.error("Error exporting minutes:", error);
      toast.error("Không thể xuất biên bản");
    }
  };

  const handleUploadMinutes = async (file) => {
    try {
      setUploadLoading(true);
      await uploadMeetingMinutesApi(id, file);
      toast.success("Upload biên bản thành công");
      fetchMeetingDetail();
      return false;
    } catch (error) {
      console.error("Error uploading minutes:", error);
      toast.error("Không thể upload biên bản");
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteMinutes = () => {
    confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn xóa biên bản này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteMeetingMinutesApi(id);
          toast.success("Xóa biên bản thành công");
          fetchMeetingDetail();
        } catch (error) {
          console.error("Error deleting minutes:", error);
          toast.error("Không thể xóa biên bản");
        }
      },
    });
  };

  const handleSendFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.warning("Vui lòng nhập nội dung feedback");
      return;
    }

    try {
      await sendMeetingFeedbackApi(id, feedbackContent);
      toast.success("Gửi feedback thành công");
      setFeedbackModalVisible(false);
      setFeedbackContent("");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Không thể gửi feedback");
    }
  };

  const handleMarkAttendance = async (studentId, attended) => {
    try {
      setAttendanceLoading(true);
      await updateAttendanceApi(id, [
        {
          student_id: studentId,
          attended: attended,
        },
      ]);
      toast.success(
        attended ? "Đánh dấu có mặt thành công" : "Đánh dấu vắng mặt thành công"
      );
      // Update local state instead of refetching
      setMeeting((prev) => ({
        ...prev,
        attendees: prev.attendees.map((a) =>
          a.student_id === studentId ? { ...a, attended } : a
        ),
      }));
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Không thể cập nhật điểm danh");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleMarkAllAttendance = async (attended) => {
    try {
      setAttendanceLoading(true);
      const attendances = meeting?.attendees?.map((a) => ({
        student_id: a.student_id,
        attended: attended,
      }));
      await updateAttendanceApi(id, attendances);
      toast.success(
        attended
          ? "Đánh dấu tất cả có mặt thành công"
          : "Đánh dấu tất cả vắng mặt thành công"
      );
      // Update local state instead of refetching
      setMeeting((prev) => ({
        ...prev,
        attendees: prev.attendees.map((a) => ({ ...a, attended })),
      }));
    } catch (error) {
      console.error("Error marking all attendance:", error);
      toast.error("Không thể cập nhật điểm danh tất cả");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      scheduled: {
        color: "blue",
        text: "Sắp diễn ra",
        icon: <CalendarOutlined />,
      },
      completed: {
        color: "green",
        text: "Đã hoàn thành",
        icon: <CheckCircleOutlined />,
      },
      cancelled: {
        color: "red",
        text: "Đã hủy",
        icon: <CloseCircleOutlined />,
      },
    };
    const config = statusMap[status] || {
      color: "default",
      text: status,
      icon: null,
    };
    return (
      <Tag
        color={config.color}
        icon={config.icon}
        className="text-lg px-4 py-2"
      >
        {config.text}
      </Tag>
    );
  };

  const attendeeColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "MSSV",
      dataIndex: ["student", "user_code"],
      key: "user_code",
      width: 100,
    },
    {
      title: "Họ và tên",
      dataIndex: ["student", "full_name"],
      key: "full_name",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Vị trí",
      dataIndex: ["student", "position"],
      key: "position",
      width: 130,
      align: "center",
      render: (position) => {
        if (!position) return "-";
        return (
          <Tag color="blue">
            {position === "leader"
              ? "Lớp trưởng"
              : position === "vice_leader"
              ? "Lớp phó"
              : position === "secretary"
              ? "Bí thư"
              : "Thành viên"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "attended",
      key: "attended",
      width: 120,
      align: "center",
      render: (attended) =>
        attended ? (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            className="px-3 py-1"
          >
            Có mặt
          </Tag>
        ) : (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            className="px-3 py-1"
          >
            Vắng mặt
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            loading={attendanceLoading}
            onClick={() => handleMarkAttendance(record.student_id, true)}
          >
            Có mặt
          </Button>
          <Button
            danger
            size="small"
            loading={attendanceLoading}
            onClick={() => handleMarkAttendance(record.student_id, false)}
          >
            Vắng
          </Button>
        </Space>
      ),
    },
  ];

  const attendanceRate =
    meeting?.attendees?.length > 0
      ? Math.round(
          ((meeting.attendees.filter((a) => a.attended).length || 0) /
            meeting.attendees.length) *
            100
        )
      : 0;

  const tabItems = [
    {
      key: "info",
      label: (
        <span className="text-base">
          <FileTextOutlined className="mr-2" />
          Thông tin cuộc họp
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Tiêu đề" span={2}>
              <span className="font-semibold text-lg">{meeting?.title}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              <Tag color="blue" className="text-base px-3 py-1">
                {meeting?.class?.class_name}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(meeting?.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian bắt đầu">
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-blue-600" />
                <span className="font-medium">
                  {dayjs(meeting?.meeting_time).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian kết thúc">
              {meeting?.end_time ? (
                <span className="font-medium">
                  {dayjs(meeting.end_time).format("DD/MM/YYYY HH:mm")}
                </span>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm" span={2}>
              <div className="flex items-center gap-2">
                <EnvironmentOutlined className="text-red-600" />
                <span className="font-medium">{meeting?.location || "-"}</span>
              </div>
            </Descriptions.Item>
            {meeting?.meeting_link && (
              <Descriptions.Item label="Link họp online" span={2}>
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <LinkOutlined />
                  {meeting.meeting_link}
                </a>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Nội dung họp" span={2}>
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {meeting?.summary || "Chưa có nội dung"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ý kiến lớp" span={2}>
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {meeting?.class_feedback || "Chưa có ý kiến"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Giảng viên chủ nhiệm" span={2}>
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-blue-600" />
                <span className="font-medium">
                  {meeting?.advisor?.full_name}
                </span>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "attendance",
      label: (
        <span className="text-base">
          <TeamOutlined className="mr-2" />
          Danh sách tham dự
          <Badge
            count={`${
              meeting?.attendees?.filter((a) => a.attended).length || 0
            }/${meeting?.attendees?.length || 0}`}
            className="ml-2"
            style={{ backgroundColor: "#52c41a" }}
          />
        </span>
      ),
      children: (
        <div>
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Progress
                  type="circle"
                  percent={attendanceRate}
                  size={120}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                />
                <div className="mt-4 text-lg font-semibold text-gray-700">
                  Tỷ lệ tham dự
                </div>
              </div>
              <div className="flex flex-col justify-center items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  Điểm danh nhanh
                </h3>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={attendanceLoading}
                    onClick={() => handleMarkAllAttendance(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 border-0"
                  >
                    Tất cả có mặt
                  </Button>
                  <Button
                    danger
                    size="large"
                    block
                    loading={attendanceLoading}
                    onClick={() => handleMarkAllAttendance(false)}
                  >
                    Tất cả vắng mặt
                  </Button>
                </Space>
              </div>
            </div>
          </Card>
          <Table
            columns={attendeeColumns}
            dataSource={meeting?.attendees || []}
            rowKey="meeting_student_id"
            pagination={false}
            className="shadow-md rounded-lg"
          />
        </div>
      ),
    },
    {
      key: "minutes",
      label: (
        <span className="text-base">
          <FileWordOutlined className="mr-2" />
          Biên bản
        </span>
      ),
      children: (
        <div className="space-y-4">
          {meeting?.minutes_file_path ? (
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-lg">
              <div className="text-center space-y-4">
                <div className="text-green-600 text-6xl">
                  <FileWordOutlined />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Biên bản cuộc họp
                  </h3>
                  <Tag color="green" className="text-base px-3 py-1">
                    Đã có biên bản
                  </Tag>
                </div>
                <Space size="middle">
                  <Button
                    type="primary"
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadMinutes}
                    className="bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-lg"
                  >
                    Tải biên bản
                  </Button>
                  <Button
                    danger
                    size="large"
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteMinutes}
                  >
                    Xóa biên bản
                  </Button>
                </Space>
              </div>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-lg">
              <Empty
                description={
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg mb-4">
                      Chưa có biên bản
                    </p>
                    <Space
                      direction="vertical"
                      size="middle"
                      className="w-full"
                    >
                      <Button
                        type="primary"
                        size="large"
                        icon={<FileWordOutlined />}
                        onClick={handleExportMinutes}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg"
                      >
                        Xuất biên bản tự động
                      </Button>
                      <Upload
                        beforeUpload={handleUploadMinutes}
                        showUploadList={false}
                        accept=".doc,.docx,.pdf"
                      >
                        <Button
                          size="large"
                          icon={<UploadOutlined />}
                          loading={uploadLoading}
                          className="shadow-md"
                        >
                          Upload biên bản thủ công
                        </Button>
                      </Upload>
                    </Space>
                  </div>
                }
              />
            </Card>
          )}
        </div>
      ),
    },
    {
      key: "feedback",
      label: (
        <span className="text-base">
          <MessageOutlined className="mr-2" />
          Phản hồi
          <Badge count={feedbacks.length} className="ml-2" />
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Button
            type="primary"
            icon={<MessageOutlined />}
            onClick={() => setFeedbackModalVisible(true)}
            size="large"
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg"
          >
            Gửi phản hồi mới
          </Button>

          {feedbacks.length > 0 ? (
            <Timeline
              items={feedbacks.map((fb) => ({
                color: "blue",
                children: (
                  <Card
                    size="small"
                    className="mb-2 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-base">
                          {fb.student?.full_name}
                        </span>
                        {fb.student?.position && (
                          <Tag color="blue" className="ml-2">
                            {fb.student.position === "leader"
                              ? "Lớp trưởng"
                              : fb.student.position === "vice_leader"
                              ? "Lớp phó"
                              : "Bí thư"}
                          </Tag>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {dayjs(fb.created_at).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {fb.feedback_content}
                    </p>
                  </Card>
                ),
              }))}
            />
          ) : (
            <Empty
              description={
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg mb-2">
                    Chưa có phản hồi nào
                  </p>
                  <p className="text-gray-400 text-sm">
                    Hãy là người đầu tiên gửi phản hồi
                  </p>
                </div>
              }
            />
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdvisorLayout>
      <div className="p-6">
        <Card>
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/advisor/meetings")}
                className="mb-4"
              >
                Quay lại danh sách
              </Button>
              <h1 className="text-2xl font-bold">Chi tiết cuộc họp</h1>
            </div>
            <Space>
              <Button
                icon={<UserAddOutlined />}
                onClick={() => navigate(`/advisor/meetings/${id}/attendance`)}
              >
                Điểm danh
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/advisor/meetings/${id}/edit`)}
              >
                Chỉnh sửa
              </Button>
            </Space>
          </div>

          {/* Content */}
          <Tabs items={tabItems} size="large" />

          {/* Feedback Modal */}
          <Modal
            title={
              <span className="text-lg font-semibold">
                <MessageOutlined className="mr-2" />
                Gửi Feedback
              </span>
            }
            open={feedbackModalVisible}
            onCancel={() => {
              setFeedbackModalVisible(false);
              setFeedbackContent("");
            }}
            onOk={handleSendFeedback}
            okText="Gửi"
            cancelText="Hủy"
            width={600}
          >
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-2">
                Chia sẻ ý kiến của bạn về cuộc họp, biên bản hoặc các nội dung
                liên quan
              </p>
            </div>
            <TextArea
              rows={6}
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="Nhập nội dung phản hồi của bạn..."
              maxLength={500}
              showCount
            />
          </Modal>
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default MeetingDetail;
