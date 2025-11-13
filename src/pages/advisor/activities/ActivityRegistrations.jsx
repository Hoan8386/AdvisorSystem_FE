import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import { Card, Button, Space, Table, Tag, Empty, Tabs, Select } from "antd";
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
  getActivityCancellationRequestsAPI,
  updateCancellationRequestAPI,
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

  // Cancellation requests state
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [loadingCancellations, setLoadingCancellations] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  useEffect(() => {
    fetchActivityInfo();
    fetchRegistrations();
    fetchCancellationRequests();
    // eslint-disable-next-line
  }, [id]);

  const fetchCancellationRequests = async () => {
    try {
      setLoadingCancellations(true);
      const res = await getActivityCancellationRequestsAPI(id);
      if (res && res.data) {
        setCancellationRequests(res.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching cancellation requests:", error);
      toast.error("Lỗi khi tải danh sách yêu cầu hủy");
      setCancellationRequests([]);
    } finally {
      setLoadingCancellations(false);
    }
  };

  const handleApproveCancellation = async (requestId, status) => {
    try {
      setProcessingRequestId(requestId);
      await updateCancellationRequestAPI(id, requestId, status);
      toast.success(
        status === "approved"
          ? "Đã duyệt yêu cầu hủy"
          : "Đã từ chối yêu cầu hủy"
      );
      fetchCancellationRequests();
      fetchRegistrations(); // Refresh registrations list
    } catch (error) {
      console.error("Error updating cancellation request:", error);
      toast.error("Lỗi khi xử lý yêu cầu hủy");
    } finally {
      setProcessingRequestId(null);
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
      width: 30,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "MSSV",
      dataIndex: ["student", "user_code"],
      key: "user_code",
      width: 80,
    },
    {
      title: "Họ và tên",
      dataIndex: ["student", "full_name"],
      key: "full_name",
      width: 200,
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
      width: 80,
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
      width: 80,
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
              onClick={() => navigate(`/advisor/activities/${id}`)}
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
              key: "cancellations",
              label: (
                <span>
                  <FilterOutlined /> Yêu cầu hủy đăng ký
                </span>
              ),
              children: (
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {cancellationRequests.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Tổng yêu cầu hủy
                      </div>
                    </Card>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {
                          cancellationRequests.filter(
                            (r) => r.status === "pending"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">Chờ duyệt</div>
                    </Card>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {
                          cancellationRequests.filter(
                            (r) => r.status === "approved"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">Đã duyệt</div>
                    </Card>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {
                          cancellationRequests.filter(
                            (r) => r.status === "rejected"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">Đã từ chối</div>
                    </Card>
                  </div>

                  {/* Cancellation Requests Table */}
                  <Card
                    style={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
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
                          dataIndex: ["student", "user_code"],
                          key: "student_code",
                          width: 80,
                        },
                        {
                          title: "Họ và tên",
                          dataIndex: ["student", "full_name"],
                          key: "student_name",
                          width: 200,
                          render: (text, record) => (
                            <div>
                              <div className="font-medium">{text}</div>
                              <div className="text-xs text-gray-500">
                                {record.student?.email}
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
                          title: "Lý do hủy",
                          dataIndex: "reason",
                          key: "reason",
                          width: 250,
                          ellipsis: true,
                          render: (text) => (
                            <div className="text-sm">{text}</div>
                          ),
                        },
                        {
                          title: "Thời gian YC",
                          dataIndex: "requested_at",
                          key: "requested_at",
                          width: 150,
                          render: (time) =>
                            dayjs(time).format("DD/MM/YYYY HH:mm"),
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "status",
                          key: "status",
                          width: 80,
                          render: (status) => {
                            const config = {
                              pending: { color: "gold", text: "Chờ duyệt" },
                              approved: { color: "green", text: "Đã duyệt" },
                              rejected: { color: "red", text: "Từ chối" },
                            };
                            return (
                              <Tag color={config[status]?.color}>
                                {config[status]?.text}
                              </Tag>
                            );
                          },
                        },
                        {
                          title: "Thao tác",
                          key: "action",
                          width: 150,
                          align: "center",
                          render: (_, record) =>
                            record.status === "pending" ? (
                              <Space size="small">
                                <Button
                                  type="primary"
                                  size="small"
                                  loading={
                                    processingRequestId === record.request_id
                                  }
                                  onClick={() =>
                                    handleApproveCancellation(
                                      record.request_id,
                                      "approved"
                                    )
                                  }
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  danger
                                  size="small"
                                  loading={
                                    processingRequestId === record.request_id
                                  }
                                  onClick={() =>
                                    handleApproveCancellation(
                                      record.request_id,
                                      "rejected"
                                    )
                                  }
                                >
                                  Từ chối
                                </Button>
                              </Space>
                            ) : (
                              <Tag
                                color={
                                  record.status === "approved"
                                    ? "success"
                                    : "error"
                                }
                              >
                                {record.status === "approved"
                                  ? "Đã xử lý"
                                  : "Đã từ chối"}
                              </Tag>
                            ),
                        },
                      ]}
                      dataSource={cancellationRequests}
                      rowKey="request_id"
                      loading={loadingCancellations}
                      scroll={{ x: 1200 }}
                      pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} yêu cầu`,
                        showSizeChanger: true,
                        showQuickJumper: true,
                      }}
                      locale={{
                        emptyText: (
                          <Empty
                            description="Chưa có yêu cầu hủy nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ),
                      }}
                    />
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </div>
    </AdvisorLayout>
  );
};

export default ActivityRegistrations;
