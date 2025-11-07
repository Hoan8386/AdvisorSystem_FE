import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  getActivitiesAPI,
  deleteActivityAPI,
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
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UsergroupAddOutlined,
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
    status: null,
    dateRange: null,
  });

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await getActivitiesAPI();

      if (res && res.success) {
        let filteredData = res.data || [];

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
            const startTime = dayjs(activity.start_time);
            const endTime = dayjs(activity.end_time);

            // Hoạt động nằm trong khoảng thời gian nếu:
            // - Bắt đầu trong khoảng thời gian, HOẶC
            // - Kết thúc trong khoảng thời gian, HOẶC
            // - Bắt đầu trước và kết thúc sau khoảng thời gian
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

  const handleDelete = async (activityId) => {
    Modal.confirm({
      title: "Xoá hoạt động",
      content: "Bạn chắc chắn muốn xoá hoạt động này?",
      okText: "Xoá",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await deleteActivityAPI(activityId);
          if (res && res.success) {
            toast.success("Hoạt động đã được xoá");
            fetchActivities();
          }
        } catch (error) {
          toast.error(error?.message || "Lỗi khi xoá hoạt động");
        }
      },
    });
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
        const startDate = dayjs(record.start_time);
        const endDate = dayjs(record.end_time);
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
            onClick={() => navigate(`/admin/activities/${record.activity_id}`)}
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
            icon={<UsergroupAddOutlined />}
            onClick={() =>
              navigate(`/admin/activities/${record.activity_id}/registrations`)
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
              navigate(`/admin/activities/${record.activity_id}/edit`)
            }
            title="Chỉnh sửa"
            style={{
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.activity_id)}
            title="Xóa"
            style={{
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          />
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
            onClick={() => navigate("/admin/activities/create")}
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
    </AdvisorLayout>
  );
};

export default AdvisorActivities;
