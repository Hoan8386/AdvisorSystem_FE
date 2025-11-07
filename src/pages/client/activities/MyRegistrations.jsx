import { useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Input,
  Empty,
  Tooltip,
  Alert,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  getMyRegistrationsAPI,
  createCancellationRequestAPI,
} from "../../../services/api.service";

const { TextArea } = Input;

export const MyRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const res = await getMyRegistrationsAPI();
      if (res && res.data) {
        setRegistrations(res.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đăng ký");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCancel = (registration) => {
    setSelectedRegistration(registration);
    setCancelModalVisible(true);
    setCancelReason("");
  };

  const handleSubmitCancelRequest = async () => {
    if (!cancelReason.trim()) {
      toast.warning("Vui lòng nhập lý do hủy đăng ký");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createCancellationRequestAPI(
        selectedRegistration.registration_id,
        cancelReason
      );

      if (res && res.success) {
        toast.success("Gửi yêu cầu hủy đăng ký thành công");
        setCancelModalVisible(false);
        setSelectedRegistration(null);
        setCancelReason("");
        fetchMyRegistrations();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi gửi yêu cầu hủy");
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    registered: {
      color: "blue",
      text: "Đã đăng ký",
      icon: <ClockCircleOutlined />,
    },
    attended: {
      color: "green",
      text: "Đã tham gia",
      icon: <CheckCircleOutlined />,
    },
    absent: {
      color: "red",
      text: "Vắng mặt",
      icon: <CloseCircleOutlined />,
    },
    cancelled: {
      color: "default",
      text: "Đã hủy",
      icon: <CloseCircleOutlined />,
    },
  };

  const pointTypeLabels = {
    ctxh: "Cộng tác xã hội",
    ren_luyen: "Rèn luyện",
  };

  const columns = [
    {
      title: "Hoạt động",
      dataIndex: "activity_title",
      key: "activity_title",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Space size={4} className="mt-1">
            <CalendarOutlined className="text-gray-400" />
            <span className="text-xs text-gray-500">
              {dayjs(record.activity_start_time).format("DD/MM/YYYY HH:mm")}
            </span>
          </Space>
          <div className="mt-1">
            <Space size={4}>
              <EnvironmentOutlined className="text-gray-400" />
              <span className="text-xs text-gray-500">
                {record.activity_location}
              </span>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role_name",
      key: "role_name",
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Điểm thưởng",
      key: "points",
      width: 180,
      render: (_, record) => (
        <Space>
          <Tag color="green" icon={<TrophyOutlined />}>
            {record.points_awarded} điểm
          </Tag>
          <Tag color="cyan">{pointTypeLabels[record.point_type]}</Tag>
        </Space>
      ),
    },

    {
      title: "Ngày đăng ký",
      dataIndex: "registration_time",
      key: "registration_time",
      width: 150,
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => (
        <Tag
          color={statusConfig[status]?.color}
          icon={statusConfig[status]?.icon}
        >
          {statusConfig[status]?.text}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {record.status === "registered" && (
            <Tooltip title="Yêu cầu hủy đăng ký">
              <Button
                type="text"
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleRequestCancel(record)}
              >
                Hủy
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Stats
  const stats = {
    total: registrations.length,
    registered: registrations.filter((r) => r.status === "registered").length,
    attended: registrations.filter((r) => r.status === "attended").length,
    cancelled: registrations.filter((r) => r.status === "cancelled").length,
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/student/activities")}
              size="large"
            />
            <h1 className="text-2xl font-bold text-gray-900 m-0">
              📝 Hoạt động đã đăng ký
            </h1>
          </div>
          <Button
            onClick={() =>
              navigate("/student/activities/my-cancellation-requests")
            }
          >
            Xem yêu cầu hủy
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Tổng đăng ký</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.registered}
            </div>
            <div className="text-sm text-gray-600">Chờ tham gia</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.attended}
            </div>
            <div className="text-sm text-gray-600">Đã tham gia</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.cancelled}
            </div>
            <div className="text-sm text-gray-600">Đã hủy</div>
          </Card>
        </div>

        {/* Table */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Table
            columns={columns}
            dataSource={registrations}
            rowKey="registration_id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} đăng ký`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Bạn chưa đăng ký hoạt động nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    onClick={() => navigate("/student/activities")}
                  >
                    Xem hoạt động
                  </Button>
                </Empty>
              ),
            }}
          />
        </Card>

        {/* Help */}
        <Card
          size="small"
          style={{
            background: "#f0f9ff",
            borderRadius: 8,
            border: "1px solid #bae6fd",
          }}
        >
          <div style={{ fontSize: 13, color: "#0369a1" }}>
            <strong>💡 Lưu ý:</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
              <li>Bạn chỉ có thể hủy đăng ký khi trạng thái là "Đã đăng ký"</li>
              <li>Yêu cầu hủy cần được giảng viên phụ trách phê duyệt</li>
              <li>
                Điểm thưởng chỉ được cộng khi bạn tham gia và được điểm danh
              </li>
            </ul>
          </div>
        </Card>

        {/* Cancel Modal */}
        <Modal
          title="Yêu cầu hủy đăng ký"
          open={cancelModalVisible}
          onOk={handleSubmitCancelRequest}
          onCancel={() => {
            setCancelModalVisible(false);
            setSelectedRegistration(null);
            setCancelReason("");
          }}
          okText="Gửi yêu cầu"
          cancelText="Đóng"
          confirmLoading={submitting}
          width={600}
        >
          {selectedRegistration && (
            <div className="space-y-4">
              <div>
                <div className="font-medium mb-2">Thông tin hoạt động:</div>
                <Card size="small" style={{ background: "#fafafa" }}>
                  <div className="font-bold">
                    {selectedRegistration.activity_title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Vai trò: {selectedRegistration.role_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Thời gian:{" "}
                    {dayjs(selectedRegistration.activity_start_time).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </div>
                </Card>
              </div>

              <div>
                <div className="font-medium mb-2">
                  Lý do hủy đăng ký: <span className="text-red-500">*</span>
                </div>
                <TextArea
                  placeholder="Vui lòng nhập lý do hủy đăng ký (tối thiểu 10 ký tự)..."
                  rows={4}
                  maxLength={500}
                  showCount
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <Alert
                message="Lưu ý"
                description="Yêu cầu hủy của bạn sẽ được gửi đến giảng viên phụ trách để xem xét. Bạn sẽ nhận được thông báo khi yêu cầu được duyệt hoặc từ chối."
                type="info"
                showIcon
              />
            </div>
          )}
        </Modal>
      </div>
    </StudentLayout>
  );
};

export default MyRegistrations;
