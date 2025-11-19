import {
  Modal,
  Tabs,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Empty,
  Spin,
  Button,
  Space,
  Input,
} from "antd";
import { Download, Trash2, Save, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { updateMeetingAttendanceApi } from "../../services/api.service";
import dayjs from "dayjs";

const MeetingDetailModal = ({ visible, meeting, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize attendance data when meeting changes
  if (meeting && !attendanceData) {
    setAttendanceData(
      meeting.attendees.map((attendee) => ({
        student_id: attendee.student_id,
        attended: attendee.attended,
        meeting_student_id: attendee.meeting_student_id,
        student: attendee.student,
      }))
    );
  }

  const handleAttendanceChange = (index) => {
    const newData = [...attendanceData];
    newData[index].attended = !newData[index].attended;
    setAttendanceData(newData);
    setHasChanges(true);
  };

  const handleSaveAttendance = async () => {
    try {
      setLoading(true);
      await updateMeetingAttendanceApi(meeting.meeting_id, {
        attendances: attendanceData.map((item) => ({
          student_id: item.student_id,
          attended: item.attended,
        })),
      });
      toast.success("Cập nhật điểm danh thành công");
      setHasChanges(false);
      onRefresh();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Không thể cập nhật điểm danh");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMinutes = async () => {
    if (!meeting.minutes_file_path) {
      toast.warning("Cuộc họp này chưa có biên bản");
      return;
    }

    const link = document.createElement("a");
    link.href = `/storage/${meeting.minutes_file_path}`;
    link.download = meeting.minutes_file_path.split("/").pop();
    link.click();
  };

  const attendanceColumns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã sinh viên",
      dataIndex: ["student", "user_code"],
      key: "user_code",
      width: 120,
    },
    {
      title: "Họ tên",
      dataIndex: ["student", "full_name"],
      key: "full_name",
      width: 200,
    },
    {
      title: "Chức vụ",
      dataIndex: ["student", "position"],
      key: "position",
      width: 120,
      render: (position) => {
        const positionConfig = {
          leader: { color: "red", label: "Lớp trưởng" },
          vice_leader: { color: "orange", label: "Lớp phó" },
          secretary: { color: "blue", label: "Bí thư Đoàn" },
          member: { color: "default", label: "Thành viên" },
        };
        const config = positionConfig[position] || {
          color: "default",
          label: position,
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Điểm danh",
      dataIndex: "attended",
      key: "attended",
      width: 120,
      render: (attended, _, index) => (
        <Button
          type={attended ? "primary" : "default"}
          size="small"
          onClick={() => handleAttendanceChange(index)}
        >
          {attended ? "✓ Có mặt" : "✗ Vắng"}
        </Button>
      ),
    },
  ];

  const feedbackColumns = [
    {
      title: "Sinh viên",
      dataIndex: ["student", "full_name"],
      key: "full_name",
      width: 200,
    },
    {
      title: "Nội dung",
      dataIndex: "feedback_content",
      key: "feedback_content",
      ellipsis: true,
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
  ];

  if (!meeting) return null;

  const attended = attendanceData
    ? attendanceData.filter((a) => a.attended).length
    : 0;
  const total = attendanceData ? attendanceData.length : 0;

  return (
    <Modal
      title={`Chi tiết cuộc họp: ${meeting.title}`}
      visible={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Tab Thông tin chung */}
          <Tabs.TabPane tab="Thông tin chung" key="info">
            <div className="space-y-4">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic
                      title="Lớp"
                      value={meeting.class.class_name}
                      valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic
                      title="Cố vấn"
                      value={meeting.advisor.full_name}
                      valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card>
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold">Tiêu đề:</label>
                    <p className="text-gray-700">{meeting.title}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Trạng thái:</label>
                    <p>
                      <Tag
                        color={
                          meeting.status === "completed"
                            ? "green"
                            : meeting.status === "scheduled"
                            ? "blue"
                            : "red"
                        }
                      >
                        {meeting.status === "completed"
                          ? "Đã hoàn thành"
                          : meeting.status === "scheduled"
                          ? "Đã lên lịch"
                          : "Đã hủy"}
                      </Tag>
                    </p>
                  </div>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <label className="font-semibold">
                        Thời gian bắt đầu:
                      </label>
                      <p className="text-gray-700">
                        {dayjs(meeting.meeting_time).format("DD/MM/YYYY HH:mm")}
                      </p>
                    </Col>
                    <Col xs={24} sm={12}>
                      <label className="font-semibold">
                        Thời gian kết thúc:
                      </label>
                      <p className="text-gray-700">
                        {meeting.end_time
                          ? dayjs(meeting.end_time).format("DD/MM/YYYY HH:mm")
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <div>
                    <label className="font-semibold">Địa điểm:</label>
                    <p className="text-gray-700">{meeting.location || "-"}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Link họp:</label>
                    <p className="text-gray-700">
                      {meeting.meeting_link ? (
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {meeting.meeting_link}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold">Nội dung họp:</label>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {meeting.summary || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold">Ý kiến lớp:</label>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {meeting.class_feedback || "-"}
                    </p>
                  </div>

                  {meeting.minutes_file_path && (
                    <div>
                      <label className="font-semibold">Biên bản:</label>
                      <p>
                        <Button type="primary" onClick={handleDownloadMinutes}>
                          <Download className="inline mr-2" size={16} />
                          Tải biên bản
                        </Button>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </Tabs.TabPane>

          {/* Tab Điểm danh */}
          <Tabs.TabPane
            tab={`Điểm danh (${attended}/${total})`}
            key="attendance"
          >
            <div className="space-y-4">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Tổng sinh viên"
                      value={total}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Có mặt"
                      value={attended}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Tỷ lệ"
                      value={
                        total > 0 ? ((attended / total) * 100).toFixed(1) : 0
                      }
                      suffix="%"
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Card>
                </Col>
              </Row>

              {attendanceData && attendanceData.length > 0 ? (
                <>
                  <Table
                    columns={attendanceColumns}
                    dataSource={attendanceData}
                    rowKey="meeting_student_id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                  {hasChanges && (
                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        onClick={handleSaveAttendance}
                        loading={loading}
                      >
                        <Save className="inline mr-2" size={16} />
                        Lưu thay đổi
                      </Button>
                      <Button
                        onClick={() => {
                          setAttendanceData(
                            meeting.attendees.map((attendee) => ({
                              student_id: attendee.student_id,
                              attended: attendee.attended,
                              meeting_student_id: attendee.meeting_student_id,
                              student: attendee.student,
                            }))
                          );
                          setHasChanges(false);
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Empty description="Không có sinh viên để điểm danh" />
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default MeetingDetailModal;
