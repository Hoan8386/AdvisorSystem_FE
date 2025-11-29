import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  getActivitiesAPI,
  deleteActivityAPI,
  getActivityDetailAPI,
} from "../../../services/api.service";
import {
  Button,
  Table,
  Modal,
  Card,
  Space,
  Empty,
  Tag,
  Select,
  DatePicker,
  Popconfirm,
  Input,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";

const { RangePicker } = DatePicker;

dayjs.locale("vi");

export const AdvisorActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    status: null,
    dateRange: null,
  });
  const [classesModalVisible, setClassesModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await getActivitiesAPI();

      if (res && res.success) {
        let filteredData = res.data || [];

        // Lọc theo tiêu đề
        if (filters.title) {
          filteredData = filteredData.filter((activity) =>
            activity.title.toLowerCase().includes(filters.title.toLowerCase())
          );
        }

        // Lọc theo trạng thái
        if (filters.status) {
          filteredData = filteredData.filter(
            (activity) => activity.status === filters.status
          );
        }

        // Lọc theo khoảng thời gian
        if (filters.dateRange && filters.dateRange.length === 2) {
          const fromDate = filters.dateRange[0].startOf("day");
          const toDate = filters.dateRange[1].endOf("day");

          filteredData = filteredData.filter((activity) => {
            // Cũng cần xử lý múi giờ khi lọc để chính xác
            const startRaw = activity.start_time
              ? activity.start_time.replace("Z", "")
              : null;
            const endRaw = activity.end_time
              ? activity.end_time.replace("Z", "")
              : null;

            const startTime = dayjs(startRaw);
            const endTime = dayjs(endRaw);

            return (
              (startTime.isAfter(fromDate) && startTime.isBefore(toDate)) ||
              (endTime.isAfter(fromDate) && endTime.isBefore(toDate)) ||
              (startTime.isBefore(fromDate) && endTime.isAfter(toDate))
            );
          });
        }

        setActivities(filteredData);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách hoạt động");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClasses = async (activityId) => {
    try {
      setLoadingClasses(true);
      setClassesModalVisible(true);
      const res = await getActivityDetailAPI(activityId);
      if (res && res.data) {
        setSelectedActivity(res.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách lớp");
      console.error(error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleDelete = async (activityId) => {
    try {
      const res = await deleteActivityAPI(activityId);
      toast.success(res?.data?.message || "Hoạt động đã được xoá thành công");
      await fetchActivities();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Lỗi khi xoá hoạt động"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "blue";
      case "completed":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "completed":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 250,
      ellipsis: true,
      render: (text) => <span className="font-semibold text-sm">{text}</span>,
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 150,
      ellipsis: true,
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: "Thời gian",
      key: "time",
      width: 250,
      render: (_, record) => {
        // --- SỬA LỖI HIỂN THỊ GIỜ TẠI ĐÂY ---
        // Xóa chữ 'Z' (UTC marker) để Dayjs hiểu là giờ Local và không cộng thêm 7h
        const startRaw = record.start_time
          ? record.start_time.replace("Z", "")
          : null;
        const endRaw = record.end_time
          ? record.end_time.replace("Z", "")
          : null;

        const startDate = dayjs(startRaw);
        const endDate = dayjs(endRaw);
        const isSameDay =
          startDate.format("DD/MM/YYYY") === endDate.format("DD/MM/YYYY");

        return (
          <div className="text-xs whitespace-nowrap">
            <span className="font-medium text-gray-700">
              {startDate.format("DD/MM/YYYY")} {startDate.format("HH:mm")}
            </span>
            <span className="text-gray-500 mx-1">→</span>
            <span className="text-gray-600">
              {!isSameDay && `${endDate.format("DD/MM/YYYY")} `}
              {endDate.format("HH:mm")}
            </span>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="text-xs">
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 160,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(`/advisor/activities/${record.activity_id}`)
            }
            title="Xem chi tiết"
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          />
          <Button
            size="small"
            icon={<TeamOutlined />}
            onClick={() => handleViewClasses(record.activity_id)}
            title="Xem lớp tham gia"
            style={{
              borderRadius: "6px",
              padding: "4px 8px",
              color: "#52c41a",
              borderColor: "#52c41a",
            }}
          />
          <Button
            size="small"
            icon={<UsergroupAddOutlined />}
            onClick={() =>
              navigate(
                `/advisor/activities/${record.activity_id}/registrations`
              )
            }
            title="Danh sách đăng ký"
            style={{
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          />
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/advisor/activities/${record.activity_id}/edit`)
            }
            title="Chỉnh sửa"
            style={{
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          />
          <Popconfirm
            title="Xoá hoạt động"
            description="Bạn chắc chắn muốn xoá hoạt động này?"
            onConfirm={() => handleDelete(record.activity_id)}
            okText="Xoá"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              title="Xóa"
              style={{
                borderRadius: "6px",
                padding: "4px 8px",
              }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <AdvisorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý hoạt động ngoại khóa
          </h1>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/advisor/activities/create")}
            style={{
              background: "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            Tạo hoạt động mới
          </Button>
        </div>

        {/* Filters */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Space wrap size="middle">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tìm kiếm tiêu đề
              </label>
              <Input
                placeholder="Nhập tiêu đề hoạt động"
                style={{ width: 250 }}
                value={filters.title}
                onChange={(e) =>
                  setFilters({ ...filters, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Trạng thái
              </label>
              <Select
                style={{ width: 200 }}
                placeholder="Tất cả trạng thái"
                allowClear
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { label: "Sắp diễn ra", value: "upcoming" },
                  { label: "Đã hoàn thành", value: "completed" },
                ]}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Khoảng thời gian
              </label>
              <RangePicker
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                value={filters.dateRange}
                onChange={(dates) =>
                  setFilters({ ...filters, dateRange: dates })
                }
              />
            </div>
          </Space>
        </Card>

        {/* Table */}
        <Card
          style={{
            borderRadius: 12,
            marginTop: "20px",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {activities.length === 0 && !loading ? (
            <Empty description="Chưa có hoạt động nào" />
          ) : (
            <Table
              columns={columns}
              dataSource={activities}
              rowKey="activity_id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} hoạt động`,
              }}
              size="middle"
            />
          )}
        </Card>
      </div>

      {/* Modal xem lớp tham gia */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined style={{ color: "#52c41a" }} />
            <span>Lớp tham gia hoạt động</span>
          </div>
        }
        open={classesModalVisible}
        onCancel={() => {
          setClassesModalVisible(false);
          setSelectedActivity(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setClassesModalVisible(false);
              setSelectedActivity(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {loadingClasses ? (
          <div className="text-center py-8">
            <Space direction="vertical">
              <div className="text-gray-500">Đang tải...</div>
            </Space>
          </div>
        ) : selectedActivity ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {selectedActivity.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {selectedActivity.general_description}
              </p>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 text-gray-700">
                Danh sách lớp ({selectedActivity.classes?.length || 0} lớp)
              </h4>
              {selectedActivity.classes &&
              selectedActivity.classes.length > 0 ? (
                <div className="space-y-2">
                  {selectedActivity.classes.map((cls) => (
                    <div
                      key={cls.class_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TeamOutlined className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {cls.class_name}
                          </div>
                          {cls.description && (
                            <div className="text-xs text-gray-500">
                              {cls.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <Tag color="green">Đã chọn</Tag>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  description="Chưa có lớp nào được chọn"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </AdvisorLayout>
  );
};

export default AdvisorActivities;
