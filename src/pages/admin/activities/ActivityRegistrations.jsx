import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Select,
  Empty,
  Tabs,
  Modal,
  Descriptions,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  FilterOutlined,
  TeamOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getActivityRegistrationsAPI,
  getActivityDetailAPI,
  getClassesAPI,
  getClassSummaryPointsAPI,
  getStudentPointsAPI,
} from "../../../services/api.service";

export const ActivityRegistrations = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("registrations");

  // Class tab state
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingClass, setLoadingClass] = useState(false);

  // Student detail modal
  const [studentDetailVisible, setStudentDetailVisible] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

  useEffect(() => {
    fetchActivityInfo();
    fetchRegistrations();
    fetchClasses();
    // eslint-disable-next-line
  }, [id]);

  const fetchClasses = async () => {
    try {
      const res = await getClassesAPI();
      if (res && res.data) {
        setClasses(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Lỗi khi tải danh sách lớp");
    }
  };

  const fetchClassSummary = async (classId) => {
    try {
      setLoadingClass(true);
      const res = await getClassSummaryPointsAPI(classId);
      if (res && res.data) {
        setClassStudents(res.data.students || []);
      }
    } catch (error) {
      console.error("Error fetching class summary:", error);
      toast.error("Lỗi khi tải danh sách sinh viên");
      setClassStudents([]);
    } finally {
      setLoadingClass(false);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    if (classId) {
      fetchClassSummary(classId);
    } else {
      setClassStudents([]);
    }
  };

  const handleViewStudentDetail = async (studentId) => {
    try {
      setLoadingStudentDetail(true);
      setStudentDetailVisible(true);
      const res = await getStudentPointsAPI(studentId);
      if (res && res.data) {
        setSelectedStudentDetail(res.data);
      }
    } catch (error) {
      console.error("Error fetching student detail:", error);
      toast.error("Lỗi khi tải thông tin sinh viên");
    } finally {
      setLoadingStudentDetail(false);
    }
  };

  const fetchActivityInfo = async () => {
    try {
      const res = await getActivityDetailAPI(id);
      if (res && res.data) {
        setActivity(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await getActivityRegistrationsAPI(id);
      if (res && res.data) {
        // API trả về { activity, total_registrations, registrations }
        setRegistrations(res.data.registrations || []);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đăng ký");
      console.error(error);
      setRegistrations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    registered: { color: "blue", text: "Đã đăng ký" },
    attended: { color: "green", text: "Đã tham gia" },
    absent: { color: "red", text: "Vắng mặt" },
    cancelled: { color: "default", text: "Đã hủy" },
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "MSSV",
      dataIndex: ["student", "student_id"],
      key: "student_id",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: ["student", "full_name"],
      key: "full_name",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.student?.email}</div>
        </div>
      ),
    },
    {
      title: "SĐT",
      dataIndex: ["student", "phone_number"],
      key: "phone_number",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Vai trò",
      dataIndex: "role_name",
      key: "role_name",
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Thời gian ĐK",
      dataIndex: "registration_time",
      key: "registration_time",
      width: 150,
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={statusConfig[status]?.color}>
          {statusConfig[status]?.text}
        </Tag>
      ),
    },
  ];

  // Ensure registrations is always an array
  const registrationsList = Array.isArray(registrations) ? registrations : [];

  const filteredRegistrations = selectedRole
    ? registrationsList.filter((r) => r.role_name === selectedRole)
    : registrationsList;

  return (
    <AdvisorLayout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/admin/activities/${id}`)}
              size="large"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 m-0">
                👥 Danh sách đăng ký
              </h1>
              {activity && (
                <p className="text-gray-500 text-sm mt-1 mb-0">
                  {activity.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "registrations",
              label: (
                <span>
                  <TeamOutlined /> Danh sách đăng ký
                </span>
              ),
              children: (
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {registrationsList.length}
                      </div>
                      <div className="text-sm text-gray-600">Tổng đăng ký</div>
                    </Card>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {
                          registrationsList.filter(
                            (r) => r.status === "attended"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">Đã tham gia</div>
                    </Card>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {
                          registrationsList.filter(
                            (r) => r.status === "registered"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">Đã đăng ký</div>
                    </Card>
                  </div>

                  {/* Filter */}
                  <Card
                    style={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Space size="middle" className="mb-4">
                      <FilterOutlined />
                      <span className="font-medium">Lọc theo vai trò:</span>
                      <Select
                        placeholder="Tất cả vai trò"
                        style={{ width: 200 }}
                        allowClear
                        value={selectedRole}
                        onChange={setSelectedRole}
                        options={(() => {
                          const uniqueRoles = [
                            ...new Set(
                              registrationsList.map((r) => r.role_name)
                            ),
                          ];
                          return uniqueRoles.map((roleName) => ({
                            label: roleName,
                            value: roleName,
                          }));
                        })()}
                      />
                    </Space>

                    <Table
                      columns={columns}
                      dataSource={filteredRegistrations}
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
                            description="Chưa có đăng ký nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ),
                      }}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: "classes",
              label: (
                <span>
                  <TeamOutlined /> Lớp học
                </span>
              ),
              children: (
                <div className="space-y-4">
                  {/* Class Filter */}
                  <Card
                    style={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Space size="middle" className="mb-4">
                      <FilterOutlined />
                      <span className="font-medium">Chọn lớp:</span>
                      <Select
                        placeholder="Chọn lớp học"
                        style={{ width: 300 }}
                        allowClear
                        value={selectedClass}
                        onChange={handleClassChange}
                        options={classes.map((cls) => ({
                          label: `${cls.class_name} (${
                            cls.total_students || 0
                          } sinh viên)`,
                          value: cls.class_id,
                        }))}
                      />
                    </Space>

                    {selectedClass && (
                      <Table
                        columns={[
                          {
                            title: "STT",
                            key: "index",
                            width: 60,
                            align: "center",
                            render: (_, __, index) => index + 1,
                          },
                          {
                            title: "MSSV",
                            dataIndex: "user_code",
                            key: "user_code",
                            width: 120,
                          },
                          {
                            title: "Họ và tên",
                            dataIndex: "full_name",
                            key: "full_name",
                          },
                          {
                            title: "Điểm rèn luyện",
                            dataIndex: "total_training_points",
                            key: "total_training_points",
                            width: 150,
                            align: "center",
                            render: (points) => (
                              <Tag color="blue" className="text-base px-3 py-1">
                                {points || 0}
                              </Tag>
                            ),
                          },
                          {
                            title: "Điểm CTXH",
                            dataIndex: "total_social_points",
                            key: "total_social_points",
                            width: 150,
                            align: "center",
                            render: (points) => (
                              <Tag
                                color="green"
                                className="text-base px-3 py-1"
                              >
                                {points || 0}
                              </Tag>
                            ),
                          },
                          {
                            title: "Thao tác",
                            key: "action",
                            width: 120,
                            align: "center",
                            render: (_, record) => (
                              <Button
                                type="link"
                                icon={<EyeOutlined />}
                                onClick={() =>
                                  handleViewStudentDetail(record.student_id)
                                }
                              >
                                Xem chi tiết
                              </Button>
                            ),
                          },
                        ]}
                        dataSource={classStudents}
                        rowKey="student_id"
                        loading={loadingClass}
                        pagination={{
                          pageSize: 10,
                          showTotal: (total) => `Tổng ${total} sinh viên`,
                          showSizeChanger: true,
                        }}
                        locale={{
                          emptyText: (
                            <Empty
                              description="Chưa có dữ liệu"
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                          ),
                        }}
                      />
                    )}

                    {!selectedClass && (
                      <Empty
                        description="Vui lòng chọn lớp để xem danh sách sinh viên"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </Card>
                </div>
              ),
            },
          ]}
        />

        {/* Student Detail Modal */}
        <Modal
          title="Chi tiết điểm sinh viên"
          open={studentDetailVisible}
          onCancel={() => {
            setStudentDetailVisible(false);
            setSelectedStudentDetail(null);
          }}
          footer={null}
          width={900}
        >
          {loadingStudentDetail ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : selectedStudentDetail ? (
            <div className="space-y-4">
              {/* Student Info */}
              <Card size="small" title="Thông tin sinh viên">
                <Descriptions column={2}>
                  <Descriptions.Item label="MSSV">
                    {selectedStudentDetail.student_info?.user_code}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ tên">
                    {selectedStudentDetail.student_info?.full_name}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card size="small" className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedStudentDetail.summary?.total_training_points || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Tổng điểm rèn luyện
                  </div>
                </Card>
                <Card size="small" className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {selectedStudentDetail.summary?.total_social_points || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Tổng điểm CTXH
                  </div>
                </Card>
              </div>

              {/* Activities */}
              <Card size="small" title="Danh sách hoạt động đã tham gia">
                <Table
                  columns={[
                    {
                      title: "Hoạt động",
                      dataIndex: "activity_title",
                      key: "activity_title",
                    },
                    {
                      title: "Vai trò",
                      dataIndex: "role_name",
                      key: "role_name",
                      width: 150,
                      render: (text) => <Tag color="blue">{text}</Tag>,
                    },
                    {
                      title: "Điểm",
                      dataIndex: "points_awarded",
                      key: "points_awarded",
                      width: 100,
                      align: "center",
                      render: (points) => (
                        <Tag color="orange" className="font-bold">
                          +{points}
                        </Tag>
                      ),
                    },
                    {
                      title: "Loại điểm",
                      dataIndex: "point_type",
                      key: "point_type",
                      width: 120,
                      render: (type) => (
                        <Tag color={type === "ren_luyen" ? "blue" : "green"}>
                          {type === "ren_luyen" ? "Rèn luyện" : "CTXH"}
                        </Tag>
                      ),
                    },
                    {
                      title: "Ngày tham gia",
                      dataIndex: "activity_date",
                      key: "activity_date",
                      width: 150,
                      render: (date) => dayjs(date).format("DD/MM/YYYY"),
                    },
                  ]}
                  dataSource={selectedStudentDetail.activities || []}
                  rowKey={(record, index) => index}
                  pagination={false}
                  scroll={{ y: 300 }}
                  locale={{
                    emptyText: (
                      <Empty
                        description="Chưa tham gia hoạt động nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                  }}
                />
              </Card>
            </div>
          ) : null}
        </Modal>
      </div>
    </AdvisorLayout>
  );
};

export default ActivityRegistrations;
