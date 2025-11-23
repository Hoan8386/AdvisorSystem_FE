import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Empty,
  Tabs,
  Modal,
  Checkbox,
  Select,
  Statistic,
  Row,
  Col,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAvailableStudentsAPI,
  assignStudentsAPI,
  unassignStudentAPI,
  getActivityDetailAPI,
} from "../../../services/api.service";

export const AssignStudents = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [activityData, setActivityData] = useState(null);

  // States cho các danh sách sinh viên
  const [availableStudents, setAvailableStudents] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]); // Đã đăng ký tham gia hoạt động này
  const [busyStudents, setBusyStudents] = useState([]); // Bận (trùng lịch, lý do khác)

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [activityRoles, setActivityRoles] = useState([]);

  useEffect(() => {
    fetchActivityDetail();
    fetchAvailableStudents();
    // eslint-disable-next-line
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      const res = await getActivityDetailAPI(id);
      if (res && res.data) {
        setActivityRoles(res.data.roles || []);
      }
    } catch (error) {
      console.error("Error fetching activity detail:", error);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      setLoading(true);
      const res = await getAvailableStudentsAPI(id);
      if (res && res.data) {
        setActivityData(res.data);
        setAvailableStudents(res.data.available_students || []);

        // Xử lý danh sách unavailable dựa trên lý do
        const unavailableList = res.data.unavailable_students || [];

        // Lọc những sinh viên đã đăng ký tham gia hoạt động NÀY
        // Dựa vào text "Đã đăng ký" trong reason_cannot_assign (dựa trên JSON mẫu)
        const registered = unavailableList.filter(
          (s) =>
            s.reason_cannot_assign &&
            s.reason_cannot_assign.toLowerCase().includes("đã đăng ký")
        );

        // Những sinh viên còn lại là Bận (Trùng môn, lý do khác...)
        const busy = unavailableList.filter(
          (s) =>
            !s.reason_cannot_assign ||
            !s.reason_cannot_assign.toLowerCase().includes("đã đăng ký")
        );

        setRegisteredStudents(registered);
        setBusyStudents(busy);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi khi tải danh sách sinh viên"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudents = async () => {
    if (!selectedRole) {
      toast.warning("Vui lòng chọn vai trò");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sinh viên");
      return;
    }

    try {
      setAssigning(true);
      const assignments = selectedStudents.map((studentId) => ({
        student_id: studentId,
        activity_role_id: selectedRole,
      }));

      const res = await assignStudentsAPI(id, assignments);

      if (res && res.data) {
        const { total_assigned, total_skipped, skipped } = res.data;

        if (total_skipped > 0) {
          const skippedNames = skipped
            .map((s) => `${s.student_name} (${s.reason})`)
            .join("\n");
          Modal.warning({
            title: "Kết quả phân công",
            content: (
              <div>
                <p>
                  ✅ Đã phân công: <strong>{total_assigned}</strong> sinh viên
                </p>
                <p>
                  ⚠️ Bỏ qua: <strong>{total_skipped}</strong> sinh viên
                </p>
                <div className="mt-2">
                  <strong>Chi tiết:</strong>
                  <pre
                    style={{
                      fontSize: "12px",
                      marginTop: "8px",
                      background: "#f5f5f5",
                      padding: 8,
                    }}
                  >
                    {skippedNames}
                  </pre>
                </div>
              </div>
            ),
            width: 500,
          });
        } else {
          toast.success(`Đã phân công thành công ${total_assigned} sinh viên!`);
        }

        setSelectedStudents([]);
        setSelectedRole(null);
        fetchAvailableStudents();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error?.response?.data?.message || "Lỗi khi phân công sinh viên"
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (registrationId, studentName) => {
    // Lưu ý: Vì JSON mới không có registration_id trong list unavailable,
    // bạn cần đảm bảo API trả về registration_id hoặc xử lý logic này ở backend.
    // Ở đây giả định nếu cần unassign thì phải có ID.
    if (!registrationId) {
      toast.error("Không tìm thấy mã đăng ký để hủy");
      return;
    }

    try {
      await unassignStudentAPI(id, registrationId);
      toast.success(`Đã hủy phân công sinh viên "${studentName}" thành công`);
      fetchAvailableStudents();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi hủy phân công");
    }
  };

  const getRoleName = (roleId) => {
    const role = activityRoles.find((r) => r.activity_role_id === roleId);
    return role?.role_name || "";
  };

  // --- CỘT CHO BẢNG AVAILABLE ---
  const availableColumns = [
    {
      title: (
        <Checkbox
          checked={
            selectedStudents.length === availableStudents.length &&
            availableStudents.length > 0
          }
          indeterminate={
            selectedStudents.length > 0 &&
            selectedStudents.length < availableStudents.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents(availableStudents.map((s) => s.student_id));
            } else {
              setSelectedStudents([]);
            }
          }}
        />
      ),
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedStudents.includes(record.student_id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents([...selectedStudents, record.student_id]);
            } else {
              setSelectedStudents(
                selectedStudents.filter((id) => id !== record.student_id)
              );
            }
          }}
        />
      ),
    },
    { title: "MSSV", dataIndex: "user_code", key: "user_code", width: 120 },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    { title: "Lớp", dataIndex: "class_name", key: "class_name", width: 120 },
    {
      title: "Điểm RL",
      dataIndex: "training_point",
      key: "training_point",
      width: 100,
      align: "center",
      render: (point) => (
        <Tag color="blue" icon={<TrophyOutlined />}>
          {point || 0}
        </Tag>
      ),
    },
    {
      title: "Điểm CTXH",
      dataIndex: "social_point",
      key: "social_point",
      width: 100,
      align: "center",
      render: (point) => (
        <Tag color="green" icon={<TrophyOutlined />}>
          {point || 0}
        </Tag>
      ),
    },
  ];

  // --- CỘT CHO BẢNG ĐÃ ĐĂNG KÝ ---
  const registeredColumns = [
    { title: "MSSV", dataIndex: "user_code", key: "user_code", width: 120 },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    { title: "Lớp", dataIndex: "class_name", key: "class_name", width: 120 },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => (
        <Tag color="blue" icon={<CheckCircleOutlined />}>
          Đã tham gia
        </Tag>
      ),
    },
    {
      title: "Vai trò / Ghi chú",
      dataIndex: "reason_cannot_assign",
      key: "reason",
      render: (text) => <span className="text-sm text-gray-600">{text}</span>,
    },
    // Bỏ cột thao tác nếu JSON không trả về registration_id để unassign
  ];

  // --- CỘT CHO BẢNG BẬN / TRÙNG LỊCH (MỚI) ---
  const busyColumns = [
    { title: "MSSV", dataIndex: "user_code", key: "user_code", width: 120 },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    { title: "Lớp", dataIndex: "class_name", key: "class_name", width: 120 },
    {
      title: "Lý do bận",
      dataIndex: "reason_cannot_assign",
      key: "reason",
      render: (text) => (
        <Tag color="volcano" icon={<WarningOutlined />}>
          {text}
        </Tag>
      ),
    },
  ];

  return (
    <AdvisorLayout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/advisor/activities/${id}`)}
              size="large"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 m-0">
                👥 Phân công sinh viên
              </h1>
              {activityData?.activity && (
                <p className="text-gray-500 text-sm mt-1 mb-0">
                  {activityData.activity.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {activityData?.summary && (
          <Card>
            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Tổng sinh viên"
                  value={activityData.summary.total_students}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Có thể phân công"
                  value={activityData.summary.available_count}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Đã tham gia"
                  value={registeredStudents.length}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Bận / Trùng lịch"
                  value={busyStudents.length}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Assignment Section */}
        {activityRoles.length > 0 && (
          <Card
            style={{
              marginTop: "20px",
              borderRadius: 16,
              border: "2px solid #e6f4ff",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.1)",
              background: "linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%)",
            }}
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-blue-200">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <UserAddOutlined style={{ fontSize: 20, color: "#fff" }} />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-800">
                    Phân công sinh viên
                  </div>
                  <div className="text-xs text-gray-500">
                    Làm theo 3 bước dưới đây để phân công sinh viên vào hoạt
                    động
                  </div>
                </div>
              </div>

              {/* Step 1: Select Role */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <span className="font-semibold text-base text-gray-800">
                    Chọn vai trò cần phân công
                  </span>
                </div>
                <Select
                  size="large"
                  placeholder="-- Chọn vai trò cho sinh viên --"
                  style={{ width: "100%" }}
                  value={selectedRole}
                  onChange={setSelectedRole}
                  options={activityRoles.map((role) => ({
                    label: `${role.role_name} (${
                      role.points_awarded
                    } điểm - Đã có ${role.registrations_count || 0}/${
                      role.max_slots || "∞"
                    } sinh viên)`,
                    value: role.activity_role_id,
                  }))}
                />
              </div>

              {/* Step 2: Select Students */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      selectedRole
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`font-semibold text-base ${
                      selectedRole ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    Chọn sinh viên từ bảng bên dưới
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-sm text-gray-600 mb-2">
                    💡 <strong>Hướng dẫn:</strong> Tick vào ô checkbox bên cạnh
                    tên sinh viên ở tab "Có thể phân công".
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-600">Đã chọn: </span>
                      <span className="font-bold text-2xl text-blue-600">
                        {selectedStudents.length}
                      </span>
                      <span className="text-gray-600"> sinh viên</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vai trò: </span>
                      <span className="font-semibold text-base text-gray-800">
                        {selectedRole ? getRoleName(selectedRole) : "Chưa chọn"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Submit */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      selectedRole && selectedStudents.length > 0
                        ? "bg-gradient-to-br from-green-500 to-green-600"
                        : "bg-gray-300"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`font-semibold text-base ${
                      selectedRole && selectedStudents.length > 0
                        ? "text-gray-800"
                        : "text-gray-400"
                    }`}
                  >
                    Xác nhận phân công
                  </span>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<UserAddOutlined />}
                  onClick={handleAssignStudents}
                  loading={assigning}
                  disabled={!selectedRole || selectedStudents.length === 0}
                  style={{
                    height: 50,
                    fontWeight: 600,
                    fontSize: 16,
                    background:
                      !selectedRole || selectedStudents.length === 0
                        ? undefined
                        : "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                    border: "none",
                  }}
                  block
                >
                  {!selectedRole
                    ? "Vui lòng chọn vai trò (Bước 1)"
                    : selectedStudents.length === 0
                    ? "Vui lòng chọn sinh viên (Bước 2)"
                    : `✓ Phân công ${selectedStudents.length} sinh viên`}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Students Table Tabs */}
        <Card
          style={{
            marginTop: "20px",
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "available",
                label: `Có thể phân công (${availableStudents.length})`,
                children: (
                  <Table
                    columns={availableColumns}
                    dataSource={availableStudents}
                    rowKey="student_id"
                    loading={loading}
                    scroll={{ x: 900 }}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `Tổng ${total} sinh viên`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          description="Không có sinh viên nào"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ),
                    }}
                  />
                ),
              },
              {
                key: "registered",
                label: `Đã tham gia (${registeredStudents.length})`,
                children: (
                  <Table
                    columns={registeredColumns}
                    dataSource={registeredStudents}
                    rowKey="student_id"
                    loading={loading}
                    scroll={{ x: 900 }}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `Tổng ${total} sinh viên`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          description="Chưa có sinh viên nào đăng ký"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ),
                    }}
                  />
                ),
              },
              {
                key: "busy",
                label: (
                  <span className="text-red-500">
                    <WarningOutlined /> Bận / Trùng lịch ({busyStudents.length})
                  </span>
                ),
                children: (
                  <Table
                    columns={busyColumns}
                    dataSource={busyStudents}
                    rowKey="student_id"
                    loading={loading}
                    scroll={{ x: 900 }}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `Tổng ${total} sinh viên`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          description="Không có sinh viên bận"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ),
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default AssignStudents;
