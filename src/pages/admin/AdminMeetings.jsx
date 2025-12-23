import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Tag,
  Tooltip,
  Spin,
  Empty,
  DatePicker,
  Popconfirm,
} from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Eye, Trash2, Download } from "lucide-react";
import { toast } from "react-toastify";
import { getMeetingsApi, deleteMeetingApi } from "../../services/api.service";
import { downloadMeetingMinutesApi } from "../../services/meeting.service";
import MeetingDetailModal from "../../components/admin/MeetingDetailModal";
import dayjs from "dayjs";

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    class_id: undefined,
    status: undefined,
    from_date: undefined,
    to_date: undefined,
  });
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Extract unique classes for filter
  const [classes, setClasses] = useState([]);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMeetingsApi(filters);

      if (result.success) {
        setMeetings(result.data);

        // Extract unique classes
        const uniqueClasses = [
          ...new Map(
            result.data.map((meeting) => [
              meeting.class.class_id,
              meeting.class,
            ])
          ).values(),
        ];
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Không thể tải danh sách cuộc họp");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Gọi lần đầu tiên khi component mount
    const initialFetch = async () => {
      try {
        setLoading(true);
        const result = await getMeetingsApi({});

        if (result.success) {
          setMeetings(result.data);

          // Extract unique classes
          const uniqueClasses = [
            ...new Map(
              result.data.map((meeting) => [
                meeting.class.class_id,
                meeting.class,
              ])
            ).values(),
          ];
          setClasses(uniqueClasses);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
        toast.error("Không thể tải danh sách cuộc họp");
      } finally {
        setLoading(false);
      }
    };
    initialFetch();
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [filters, fetchMeetings]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
    if (date) {
      const startOfMonth = date.startOf("month").format("YYYY-MM-DD");
      const endOfMonth = date.endOf("month").format("YYYY-MM-DD");
      setFilters((prev) => ({
        ...prev,
        from_date: startOfMonth,
        to_date: endOfMonth,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        from_date: undefined,
        to_date: undefined,
      }));
    }
  };

  const handleResetFilters = () => {
    setSelectedMonth(null);
    setFilters({
      class_id: undefined,
      status: undefined,
      from_date: undefined,
      to_date: undefined,
    });
  };

  const handleViewDetail = (meeting) => {
    setSelectedMeeting(meeting);
    setDetailModalVisible(true);
  };

  const handleDeleteMeeting = (meetingId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa cuộc họp này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteMeetingApi(meetingId);
          toast.success("Xóa cuộc họp thành công");
          fetchMeetings();
        } catch (error) {
          console.error("Error deleting meeting:", error);
          toast.error("Không thể xóa cuộc họp");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDownloadMinutes = async (meeting) => {
    if (!meeting.minutes_file_path) {
      toast.warning("Cuộc họp này chưa có biên bản");
      return;
    }

    try {
      const response = await downloadMeetingMinutesApi(meeting.meeting_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Lấy tên file từ đường dẫn hoặc đặt tên mặc định
      const fileName =
        meeting.minutes_file_path.split("/").pop() || "bien_ban_cuoc_hop.docx";
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Tải biên bản thành công");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        "Lỗi khi tải biên bản: File có thể không tồn tại hoặc bị hỏng."
      );
    }
  };

  const columns = [
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
      width: 200,
      render: (text) => <div className="font-semibold">{text}</div>,
    },
    {
      title: "Cố vấn",
      dataIndex: ["advisor", "full_name"],
      key: "advisor",
      width: 180,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500">
            {record.advisor.user_code}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian họp",
      dataIndex: "meeting_time",
      key: "meeting_time",
      width: 160,
      render: (time) => {
        const formattedTime = dayjs(time).format("DD/MM/YYYY HH:mm");
        return formattedTime;
      },
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 120,
      render: (location) =>
        location || <span className="text-gray-400">-</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          scheduled: { color: "blue", label: "Đã lên lịch" },
          completed: { color: "green", label: "Đã hoàn thành" },
          cancelled: { color: "red", label: "Đã hủy" },
        };
        const config = statusConfig[status] || {
          color: "default",
          label: status,
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Biên bản",
      dataIndex: "minutes_file_path",
      key: "minutes",
      width: 100,
      render: (minutes, record) => {
        if (minutes) {
          return (
            <Tooltip title="Tải biên bản">
              <Button
                type="text"
                size="small"
                onClick={() => handleDownloadMinutes(record)}
              >
                <Download size={16} />
              </Button>
            </Tooltip>
          );
        }
        return <span className="text-gray-400 text-xs">Chưa có</span>;
      },
    },
    {
      title: "Điểm danh",
      dataIndex: "attendees",
      key: "attendance",
      width: 120,
      render: (attendees) => {
        const attended = attendees.filter((a) => a.attended).length;
        const total = attendees.length;
        return (
          <div>
            <div className="font-semibold">
              {attended}/{total}
            </div>
            <div className="text-xs text-gray-500">
              {total > 0 ? ((attended / total) * 100).toFixed(0) : 0}%
            </div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              size="small"
              onClick={() => handleViewDetail(record)}
            >
              <Eye size={16} />
            </Button>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              size="small"
              onClick={() => handleDeleteMeeting(record.meeting_id)}
            >
              <Trash2 size={16} />
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-5 text-gray-900">
        Quản lý cuộc họp
      </h1>

      <Card className="shadow-lg">
        {/* Filters */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-3 items-center">
          <Select
            placeholder="Tất cả lớp"
            allowClear
            style={{ width: 200 }}
            value={filters.class_id}
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
            value={filters.status}
            onChange={(value) => handleFilterChange("status", value)}
            options={[
              { label: "Đã lên lịch", value: "scheduled" },
              { label: "Đã hoàn thành", value: "completed" },
              { label: "Đã hủy", value: "cancelled" },
            ]}
          />
          <DatePicker
            picker="month"
            format="MM/YYYY"
            placeholder="Chọn tháng"
            value={selectedMonth}
            onChange={handleMonthChange}
            allowClear
            style={{ width: 150 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
            Làm mới
          </Button>
        </div>

        {/* Table or Empty State */}
        {meetings.length === 0 && !loading ? (
          <div className="py-5 w-full">
            {filters.class_id && selectedMonth ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 w-full">
                <div className="flex items-start gap-3 mb-4">
                  <ExclamationCircleOutlined className="text-yellow-600 text-xl mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-base">
                      Lớp này chưa tổ chức cuộc họp trong tháng{" "}
                      {selectedMonth.format("MM/YYYY")}
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Tag
                        color="orange"
                        className="text-sm px-3 py-1 mb-2"
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {
                          classes.find((c) => c.class_id === filters.class_id)
                            ?.class_name
                        }
                      </Tag>
                      <div className="text-sm text-gray-700 mt-1">
                        {classes.find((c) => c.class_id === filters.class_id)
                          ?.class_description || "Lớp Đại học"}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="text-gray-700">Sĩ số:</span>{" "}
                        <span className="font-medium">
                          {classes.find((c) => c.class_id === filters.class_id)
                            ?.total_students || 0}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-gray-700">CVHT:</span>{" "}
                        <span className="font-medium">
                          {classes.find((c) => c.class_id === filters.class_id)
                            ?.advisor?.full_name || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Tổng: <strong className="text-gray-800">1</strong> lớp chưa tổ
                  chức họp
                </p>
              </div>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </div>
        ) : (
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
          />
        )}
      </Card>

      {selectedMeeting && (
        <MeetingDetailModal
          visible={detailModalVisible}
          meeting={selectedMeeting}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedMeeting(null);
          }}
          onRefresh={fetchMeetings}
        />
      )}
    </div>
  );
};

export default AdminMeetings;
