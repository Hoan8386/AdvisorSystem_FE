import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Select,
  DatePicker,
  Input,
  Row,
  Col,
  Empty,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getMeetingsApi,
  deleteMeetingApi,
} from "../../../services/meeting.service";
import { getClassesAPI } from "../../../services/api.service";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const AdvisorMeetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    class_id: null,
    status: null,
    from_date: null,
    to_date: null,
    search: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchClasses = async () => {
    try {
      const response = await getClassesAPI();
      if (response?.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      const response = await getMeetingsApi(params);

      if (response?.data) {
        let meetingData = [];

        if (Array.isArray(response.data)) {
          meetingData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          meetingData = response.data.data;
        } else if (response.data.success && response.data.data) {
          meetingData = Array.isArray(response.data.data)
            ? response.data.data
            : [];
        }

        setMeetings(meetingData);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Không thể tải danh sách cuộc họp");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId) => {
    try {
      const response = await deleteMeetingApi(meetingId);
      if (response?.success || response?.data?.success) {
        toast.success("Xóa cuộc họp thành công");
        fetchMeetings();
      } else {
        toast.error(response?.message || "Không thể xóa cuộc họp");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa cuộc họp";
      toast.error(errorMessage);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      scheduled: {
        color: "blue",
        text: "Sắp diễn ra",
        icon: <ClockCircleOutlined />,
      },
      completed: {
        color: "green",
        text: "Đã hoàn thành",
        icon: <CalendarOutlined />,
      },
      cancelled: {
        color: "red",
        text: "Đã hủy",
        icon: <ExclamationCircleOutlined />,
      },
    };
    const config = statusMap[status] || {
      color: "default",
      text: status,
      icon: null,
    };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    // ... (Giữ nguyên các cột)
    {
      title: "Lớp",
      dataIndex: ["class", "class_name"],
      key: "class_name",
      width: 120,
      render: (text) => (
        <Tag color="blue" className="font-semibold">
          {text}
        </Tag>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-800">{text}</div>
          {record.location && (
            <div className="text-xs text-gray-500 mt-1">
              <EnvironmentOutlined className="mr-1" />
              {record.location}
            </div>
          )}
          {record.meeting_link && (
            <div className="text-xs text-blue-500 mt-1">
              <LinkOutlined className="mr-1" />
              Họp online
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "meeting_time",
      key: "meeting_time",
      width: 100,
      render: (text, record) => (
        <div>
          <div className="flex items-center gap-1 text-sm">
            <CalendarOutlined className="text-blue-600" />
            <span className="font-medium">
              {dayjs(text).format("DD/MM/YYYY")}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <ClockCircleOutlined className="mr-1" />
            {dayjs(text).format("HH:mm")}
            {record.end_time && ` - ${dayjs(record.end_time).format("HH:mm")}`}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Điểm danh",
      key: "attendance",
      width: 120,
      align: "center",
      render: (_, record) => {
        const attended =
          record.attendees?.filter((a) => a.attended).length || 0;
        const total = record.attendees?.length || 0;
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

        return (
          <div>
            <div className="text-sm font-semibold text-blue-600">
              {attended}/{total}
            </div>
            <div className="text-xs text-gray-500">{percentage}%</div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,

      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/advisor/meetings/${record.meeting_id}`)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/advisor/meetings/${record.meeting_id}/edit`)
            }
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa cuộc họp này?"
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => handleDelete(record.meeting_id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      from_date: dates?.[0] ? dates[0].format("YYYY-MM-DD") : null,
      to_date: dates?.[1] ? dates[1].format("YYYY-MM-DD") : null,
    });
  };

  return (
    <AdvisorLayout>
      <div className="p-6">
        <Card>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h1 className="text-2xl font-bold">Quản lý Cuộc họp</h1>
              <p className="text-gray-500 mt-1">
                Tạo, quản lý và theo dõi các cuộc họp lớp
              </p>
            </div>
            <Space>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => navigate("/advisor/meetings/statistics")}
              >
                Thống kê
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/advisor/meetings/create")}
              >
                Tạo cuộc họp
              </Button>
            </Space>
          </div>

          {/* Filters */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-3 items-center">
            <Select
              placeholder="Tất cả lớp"
              allowClear
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange("class_id", value)}
              options={classes.map((c) => ({
                label: c.class_name,
                value: c.class_id,
              }))}
            />
            <Select
              placeholder="Tất cả trạng thái"
              allowClear
              style={{ width: 180 }}
              onChange={(value) => handleFilterChange("status", value)}
              options={[
                { label: "Sắp diễn ra", value: "scheduled" },
                { label: "Đã hoàn thành", value: "completed" },
                { label: "Đã hủy", value: "cancelled" },
              ]}
            />
            <DatePicker.RangePicker
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              onChange={handleDateRangeChange}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchMeetings}>
              Làm mới
            </Button>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={meetings}
            loading={loading}
            rowKey="meeting_id"
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} cuộc họp`,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <div className="py-8">
                      <p className="text-gray-500 text-lg mb-3">
                        Chưa có cuộc họp nào
                      </p>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/advisor/meetings/create")}
                      >
                        Tạo cuộc họp đầu tiên
                      </Button>
                    </div>
                  }
                />
              ),
            }}
          />
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorMeetings;
