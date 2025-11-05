import { useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  Card,
  Button,
  Space,
  Descriptions,
  Tag,
  Modal,
  Select,
  Divider,
  Alert,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getActivityDetailAPI,
  registerActivityAPI,
} from "../../../services/api.service";

export const StudentActivityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      const res = await getActivityDetailAPI(id);
      console.log("Activity detail response:", res);
      if (res && res.data) {
        setActivity(res.data);
        console.log("Activity data:", res.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu hoạt động");
      console.error("Fetch activity error:", error);
      navigate("/student/activities");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    console.log("handleRegister called");
    console.log("selectedRoleId in handler:", selectedRoleId);

    if (!selectedRoleId) {
      console.log("No role selected, showing warning");
      toast.warning("Vui lòng chọn vai trò muốn đăng ký");
      return;
    }

    console.log("Opening modal confirm...");
    setConfirmModalVisible(true);
  };

  const handleConfirmRegister = async () => {
    try {
      setRegistering(true);
      setConfirmModalVisible(false);
      console.log("Registering with role ID:", selectedRoleId);
      const res = await registerActivityAPI(selectedRoleId);
      console.log("Registration response:", res);
      if (res && res.success) {
        toast.success("Đăng ký hoạt động thành công!");
        setSelectedRoleId(null);
        fetchActivityDetail(); // Refresh to update registration status
      } else {
        toast.error(res?.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Lỗi khi đăng ký hoạt động"
      );
    } finally {
      setRegistering(false);
    }
  };

  const statusConfig = {
    upcoming: {
      color: "blue",
      text: "Sắp diễn ra",
      icon: <ClockCircleOutlined />,
    },
    ongoing: {
      color: "green",
      text: "Đang diễn ra",
      icon: <CheckCircleOutlined />,
    },
    completed: {
      color: "default",
      text: "Đã hoàn thành",
      icon: <CheckCircleOutlined />,
    },
    cancelled: { color: "red", text: "Đã hủy" },
  };

  const pointTypeLabels = {
    ctxh: "Cộng tác xã hội",
    ren_luyen: "Rèn luyện",
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Đang tải...</div>
        </div>
      </StudentLayout>
    );
  }

  if (!activity) {
    return null;
  }

  // Check if student already registered
  const alreadyRegistered = activity.roles?.some(
    (role) => role.student_registration_status
  );

  // Check if activity is available for registration
  const canRegister =
    !alreadyRegistered &&
    (activity.status === "upcoming" || activity.status === "ongoing");

  console.log("Can register:", canRegister);
  console.log("Already registered:", alreadyRegistered);
  console.log("Activity status:", activity.status);

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/student/activities")}
            size="large"
          />
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            📋 Chi tiết hoạt động
          </h1>
        </div>

        {/* Main Info */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">{activity.title}</h2>
            <Tag
              color={statusConfig[activity.status]?.color}
              icon={statusConfig[activity.status]?.icon}
            >
              {statusConfig[activity.status]?.text}
            </Tag>
          </div>

          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered>
            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined className="mr-2" />
                  Thời gian bắt đầu
                </span>
              }
            >
              {dayjs(activity.start_time).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined className="mr-2" />
                  Thời gian kết thúc
                </span>
              }
            >
              {dayjs(activity.end_time).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <EnvironmentOutlined className="mr-2" />
                  Địa điểm
                </span>
              }
            >
              {activity.location}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <UserOutlined className="mr-2" />
                  Người phụ trách
                </span>
              }
            >
              {activity.advisor?.user_name || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <TeamOutlined className="mr-2" />
                  Đơn vị tổ chức
                </span>
              }
              span={2}
            >
              {activity.organizer_unit?.unit_name || "N/A"}
            </Descriptions.Item>

            {activity.general_description && (
              <Descriptions.Item label="Mô tả chung" span={3}>
                <div className="whitespace-pre-wrap">
                  {activity.general_description}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Registration Status Alert */}
        {alreadyRegistered && (
          <Alert
            message="Bạn đã đăng ký hoạt động này"
            description="Bạn có thể xem chi tiết đăng ký trong trang 'Hoạt động đã đăng ký'"
            type="info"
            showIcon
            icon={<CheckCircleOutlined />}
            action={
              <Button
                size="small"
                type="primary"
                onClick={() => navigate("/student/activities/my-registrations")}
              >
                Xem đăng ký
              </Button>
            }
          />
        )}

        {activity.status === "cancelled" && (
          <Alert
            message="Hoạt động đã bị hủy"
            description="Hoạt động này đã bị hủy và không thể đăng ký"
            type="error"
            showIcon
          />
        )}

        {activity.status === "completed" && !alreadyRegistered && (
          <Alert
            message="Hoạt động đã kết thúc"
            description="Hoạt động này đã hoàn thành và không thể đăng ký thêm"
            type="warning"
            showIcon
          />
        )}

        {/* Roles and Registration */}
        <Card
          title={
            <span className="text-lg font-semibold">
              👥 Vai trò trong hoạt động
            </span>
          }
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Space direction="vertical" size="large" className="w-full">
            {activity.roles?.map((role) => (
              <Card
                key={role.activity_role_id}
                size="small"
                style={{
                  background: role.student_registration_status
                    ? "#f0f9ff"
                    : "#fafafa",
                  borderRadius: 8,
                  border: role.student_registration_status
                    ? "1px solid #91d5ff"
                    : "1px solid #e5e7eb",
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-grow">
                    <h4 className="font-bold text-base mb-1">
                      {role.role_name}
                      {role.student_registration_status && (
                        <Tag color="green" className="ml-2">
                          Đã đăng ký
                        </Tag>
                      )}
                    </h4>
                    {role.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>

                {role.requirements && (
                  <div className="mb-3">
                    <span className="text-gray-600 font-medium text-sm">
                      Yêu cầu:{" "}
                    </span>
                    <span className="text-gray-700 text-sm">
                      {role.requirements}
                    </span>
                  </div>
                )}

                <Space size="middle" wrap>
                  <Tag color="green" icon={<TrophyOutlined />}>
                    {role.points_awarded} điểm
                  </Tag>
                  <Tag color="blue">{pointTypeLabels[role.point_type]}</Tag>
                  <Tag
                    color={
                      role.available_slots === 0
                        ? "red"
                        : role.available_slots <= 5
                        ? "orange"
                        : "cyan"
                    }
                  >
                    {role.max_slots
                      ? `${role.registrations_count || 0}/${
                          role.max_slots
                        } slot`
                      : `${role.registrations_count || 0} đã đăng ký`}
                  </Tag>
                  {role.available_slots === 0 && role.max_slots && (
                    <Tag color="red">Đã hết chỗ</Tag>
                  )}
                </Space>
              </Card>
            ))}
          </Space>

          {canRegister && (
            <>
              <Divider />
              <div className="space-y-4">
                <div>
                  <label className="font-medium mb-2 block">
                    Chọn vai trò muốn đăng ký:
                  </label>
                  <Select
                    placeholder="Chọn vai trò"
                    style={{ width: "100%", maxWidth: 400 }}
                    size="large"
                    value={selectedRoleId}
                    onChange={(value) => {
                      console.log("Selected role changed to:", value);
                      setSelectedRoleId(value);
                    }}
                    options={(() => {
                      const filteredRoles = activity.roles
                        ?.filter(
                          (role) =>
                            !role.student_registration_status &&
                            (role.available_slots > 0 || !role.max_slots)
                        )
                        .map((role) => ({
                          label: `${role.role_name} (${role.points_awarded} điểm)`,
                          value: role.activity_role_id,
                        }));
                      console.log("Available role options:", filteredRoles);
                      return filteredRoles;
                    })()}
                  />
                </div>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    console.log("Button clicked!");
                    console.log("Selected role ID:", selectedRoleId);
                    handleRegister();
                  }}
                  loading={registering}
                  disabled={!selectedRoleId}
                  style={{
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                    border: "none",
                  }}
                >
                  Đăng ký tham gia
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Confirmation Modal */}
        <Modal
          title="Xác nhận đăng ký"
          open={confirmModalVisible}
          onOk={handleConfirmRegister}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Đăng ký"
          cancelText="Hủy"
          confirmLoading={registering}
        >
          {selectedRoleId && activity.roles && (
            <div>
              <p>
                Bạn có chắc chắn muốn đăng ký vai trò{" "}
                <strong>
                  {
                    activity.roles.find(
                      (r) => r.activity_role_id === selectedRoleId
                    )?.role_name
                  }
                </strong>
                ?
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Điểm thưởng:{" "}
                {
                  activity.roles.find(
                    (r) => r.activity_role_id === selectedRoleId
                  )?.points_awarded
                }{" "}
                điểm{" "}
                {activity.roles.find(
                  (r) => r.activity_role_id === selectedRoleId
                )?.point_type === "ctxh"
                  ? "Cộng tác xã hội"
                  : "Rèn luyện"}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </StudentLayout>
  );
};

export default StudentActivityDetail;
