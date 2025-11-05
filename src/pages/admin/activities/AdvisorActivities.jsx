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
      const params = {};

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.dateRange) {
        params.from_date = filters.dateRange[0].format("YYYY-MM-DD");
        params.to_date = filters.dateRange[1].format("YYYY-MM-DD");
      }

      const res = await getActivitiesAPI(params);
      if (res && res.success) {
        setActivities(res.data || []);
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
      case "ongoing":
        return "green";
      case "completed":
        return "default";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "ongoing":
        return "Đang diễn ra";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
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
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Thời gian",
      key: "time",
      width: 180,
      render: (_, record) => (
        <div className="text-xs">
          <div className="font-medium text-gray-700">
            {dayjs(record.start_time).format("DD/MM/YYYY")}
          </div>
          <div className="text-gray-500">
            {dayjs(record.start_time).format("HH:mm")} -{" "}
            {dayjs(record.end_time).format("HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Đơn vị tổ chức",
      key: "organizer",
      width: 200,
      render: (_, record) => (
        <span className="text-sm">
          {record.organizer_unit?.unit_name || "N/A"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/activities/${record.activity_id}`)}
            className="flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              borderRadius: "6px",
              fontWeight: 500,
              padding: "0 8px",
              minWidth: "32px",
            }}
          >
            <span className="hidden lg:inline ml-1">Xem</span>
          </Button>
          <Button
            size="small"
            icon={<UsergroupAddOutlined />}
            onClick={() =>
              navigate(`/admin/activities/${record.activity_id}/registrations`)
            }
            className="flex-shrink-0"
            style={{
              borderRadius: "6px",
              fontWeight: 500,
              padding: "0 8px",
              minWidth: "32px",
            }}
          >
            <span className="hidden lg:inline ml-1">ĐK</span>
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/admin/activities/${record.activity_id}/edit`)
            }
            className="flex-shrink-0"
            style={{
              borderRadius: "6px",
              fontWeight: 500,
              padding: "0 8px",
              minWidth: "32px",
            }}
          >
            <span className="hidden lg:inline ml-1">Sửa</span>
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.activity_id)}
            className="flex-shrink-0"
            style={{
              borderRadius: "6px",
              fontWeight: 500,
              padding: "0 8px",
              minWidth: "32px",
            }}
          >
            <span className="hidden lg:inline ml-1">Xoá</span>
          </Button>
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
                  { label: "Đang diễn ra", value: "ongoing" },
                  { label: "Đã hoàn thành", value: "completed" },
                  { label: "Đã hủy", value: "cancelled" },
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
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} hoạt động`,
              }}
            />
          )}
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorActivities;
