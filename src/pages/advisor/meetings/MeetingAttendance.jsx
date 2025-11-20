import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Modal,
  Statistic,
  Row,
  Col,
  Progress,
  Divider,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getMeetingDetailApi,
  updateAttendanceApi,
} from "../../../services/meeting.service";

const { confirm } = Modal;

export const MeetingAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
        setAttendees(response.data.attendees || []);
      }
    } catch (error) {
      console.error("Error fetching meeting detail:", error);
      toast.error("Không thể tải thông tin cuộc họp");
      navigate("/advisor/meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, attended) => {
    setAttendees((prev) =>
      prev.map((att) =>
        att.student_id === studentId ? { ...att, attended } : att
      )
    );
    setHasChanges(true);
  };

  const handleSelectAll = (checked) => {
    setAttendees((prev) => prev.map((att) => ({ ...att, attended: checked })));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    confirm({
      title: "Xác nhận điểm danh",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Sau khi lưu điểm danh, cuộc họp sẽ tự động chuyển sang trạng thái{" "}
            <strong>"Đã hoàn thành"</strong>.
          </p>
          <p className="mt-2">Bạn có chắc chắn muốn tiếp tục?</p>
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      width: 500,
      onOk: async () => {
        try {
          setSubmitting(true);
          const attendanceData = attendees.map((att) => ({
            student_id: att.student_id,
            attended: att.attended,
          }));

          await updateAttendanceApi(id, attendanceData);
          toast.success("Điểm danh thành công");
          navigate(`/advisor/meetings/${id}`);
        } catch (error) {
          console.error("Error updating attendance:", error);
          toast.error("Không thể lưu điểm danh");
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const getAttendanceStats = () => {
    const total = attendees.length;
    const present = attendees.filter((a) => a.attended).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, percentage };
  };

  const stats = getAttendanceStats();

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span className="font-semibold text-gray-600">{index + 1}</span>
      ),
    },
    {
      title: "MSSV",
      dataIndex: ["student", "user_code"],
      key: "user_code",
      width: 120,
      render: (text) => <span className="font-mono font-semibold">{text}</span>,
    },
    {
      title: "Họ và tên",
      dataIndex: ["student", "full_name"],
      key: "full_name",
      render: (text, record) => (
        <div>
          <span className="font-semibold text-base">{text}</span>
          {record.student?.position && (
            <Tag color="blue" className="ml-2">
              {record.student.position === "leader"
                ? "Lớp trưởng"
                : record.student.position === "vice_leader"
                ? "Lớp phó"
                : "Bí thư"}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Điểm danh",
      dataIndex: "attended",
      key: "attended",
      width: 120,
      align: "center",
      render: (attended, record) => (
        <Switch
          checked={attended}
          onChange={(checked) =>
            handleAttendanceChange(record.student_id, checked)
          }
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
          size="default"
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "attended",
      key: "status",
      width: 120,
      align: "center",
      render: (attended) =>
        attended ? (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            className="px-3 py-1 text-base"
          >
            Có mặt
          </Tag>
        ) : (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            className="px-3 py-1 text-base"
          >
            Vắng mặt
          </Tag>
        ),
    },
  ];

  if (loading) {
    return (
      <AdvisorLayout>
        <div className="p-6">
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 50,
                minHeight: "400px",
              }}
            >
              <Spin size="large" />
            </div>
          </Card>
        </div>
      </AdvisorLayout>
    );
  }

  return (
    <AdvisorLayout>
      <div className="p-6">
        <Card>
          {/* Header */}
          <div className="mb-5">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/advisor/meetings/${id}`)}
              className="mb-4"
            >
              Quay lại chi tiết
            </Button>
            <h1 className="text-2xl font-bold">
              Điểm danh cuộc họp: {meeting?.title}
            </h1>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-5">
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-blue-500 to-blue-600">
                <Statistic
                  title={
                    <span className="text-white text-opacity-90 text-base">
                      Tổng số sinh viên
                    </span>
                  }
                  value={stats.total}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#ffffff", fontSize: "2.5rem" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-green-500 to-green-600">
                <Statistic
                  title={
                    <span className="text-white text-opacity-90 text-base">
                      Có mặt
                    </span>
                  }
                  value={stats.present}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#ffffff", fontSize: "2.5rem" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-red-500 to-red-600">
                <Statistic
                  title={
                    <span className="text-white text-opacity-90 text-base">
                      Vắng mặt
                    </span>
                  }
                  value={stats.absent}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#ffffff", fontSize: "2.5rem" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-purple-500 to-purple-600">
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={stats.percentage}
                    size={80}
                    strokeColor={{
                      "0%": "#ffffff",
                      "100%": "#ffffff",
                    }}
                    trailColor="rgba(255,255,255,0.3)"
                    format={(percent) => (
                      <span className="text-white font-bold text-xl">
                        {percent}%
                      </span>
                    )}
                  />
                  <div className="mt-2 text-white text-opacity-90 text-base">
                    Tỷ lệ tham dự
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Attendance Table */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                <UserAddOutlined className="mr-2" />
                Danh sách sinh viên
              </h2>
              <Space>
                <Button
                  type="dashed"
                  onClick={() => handleSelectAll(true)}
                  icon={<CheckCircleOutlined />}
                >
                  Chọn tất cả
                </Button>
                <Button
                  type="dashed"
                  onClick={() => handleSelectAll(false)}
                  icon={<CloseCircleOutlined />}
                >
                  Bỏ chọn tất cả
                </Button>
              </Space>
            </div>
            <Table
              columns={columns}
              dataSource={attendees}
              rowKey="meeting_student_id"
              pagination={{
                pageSize: 20,
                showTotal: (total) => `Tổng ${total} sinh viên`,
                showSizeChanger: true,
                pageSizeOptions: ["20", "50", "100"],
              }}
              loading={loading}
            />
          </div>

          <Divider />

          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate(`/advisor/meetings/${id}`)}>
              Hủy
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={!hasChanges}
            >
              Lưu điểm danh
            </Button>
          </div>
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default MeetingAttendance;
