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
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const { RangePicker } = DatePicker;

export const AdvisorMeetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [classesWithoutMeetings, setClassesWithoutMeetings] = useState([]);

  const [filters, setFilters] = useState({
    class_id: null,
    status: null,
    month: null,
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

      console.log("📦 Full response:", response);
      console.log(
        "📦 response type:",
        typeof response,
        "isArray:",
        Array.isArray(response)
      );

      if (response) {
        let meetingData = [];

        // Response sau khi qua interceptor: { success, data, classes_without_meetings }
        if (Array.isArray(response)) {
          console.log("✅ Branch 1: response is Array directly");
          meetingData = response;
          setClassesWithoutMeetings([]);
        } else if (response.data && Array.isArray(response.data)) {
          console.log("✅ Branch 2: response.data is Array");
          meetingData = response.data;

          console.log(
            "🔍 Checking response.classes_without_meetings:",
            response.classes_without_meetings
          );
          console.log(
            "🔍 Is Array:",
            Array.isArray(response.classes_without_meetings)
          );
          console.log("🔍 Length:", response.classes_without_meetings?.length);

          // Lưu classes_without_meetings từ response gốc (cùng cấp với data)
          if (
            response.classes_without_meetings &&
            Array.isArray(response.classes_without_meetings)
          ) {
            console.log(
              "✅ Setting classes without meetings:",
              response.classes_without_meetings
            );
            setClassesWithoutMeetings(response.classes_without_meetings);
          } else {
            console.log("❌ No classes_without_meetings in response");
            setClassesWithoutMeetings([]);
          }
        } else if (response.success && response.data) {
          console.log("✅ Branch 3: response.success exists");
          meetingData = Array.isArray(response.data) ? response.data : [];

          if (
            response.classes_without_meetings &&
            Array.isArray(response.classes_without_meetings)
          ) {
            console.log(
              "✅ Setting classes without meetings (branch 3):",
              response.classes_without_meetings
            );
            setClassesWithoutMeetings(response.classes_without_meetings);
          } else {
            console.log(
              "❌ No classes_without_meetings in response (branch 3)"
            );
            setClassesWithoutMeetings([]);
          }
        }

        console.log("📊 Meeting data:", meetingData);
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
      render: (text, record) => {
        // Bỏ 'Z' để parse như local time thay vì UTC
        const localMeetingTime = text?.replace("Z", "").replace(".000000", "");
        const localEndTime = record.end_time
          ?.replace("Z", "")
          .replace(".000000", "");

        return (
          <div>
            <div className="flex items-center gap-1 text-sm">
              <CalendarOutlined className="text-blue-600" />
              <span className="font-medium">
                {dayjs(localMeetingTime).format("DD/MM/YYYY")}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <ClockCircleOutlined className="mr-1" />
              {dayjs(localMeetingTime).format("HH:mm")}
              {localEndTime && ` - ${dayjs(localEndTime).format("HH:mm")}`}
            </div>
          </div>
        );
      },
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

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
    if (date) {
      const monthStr = date.format("YYYY-MM");
      setFilters({
        ...filters,
        month: monthStr,
      });
    } else {
      setFilters({
        ...filters,
        month: null,
      });
    }
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
            <DatePicker
              picker="month"
              format="MM/YYYY"
              placeholder="Chọn tháng"
              value={selectedMonth}
              onChange={handleMonthChange}
              allowClear
              style={{ width: 150 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSelectedMonth(null);
                setFilters({
                  class_id: null,
                  status: null,
                  month: null,
                });
                setTimeout(() => fetchMeetings(), 0);
              }}
            >
              Làm mới
            </Button>
          </div>

          {/* Classes Without Meetings - Hiển thị trước bảng */}
          {console.log("=== DEBUG INFO ===")}
          {console.log("selectedMonth:", selectedMonth)}
          {console.log("classesWithoutMeetings:", classesWithoutMeetings)}
          {console.log(
            "classesWithoutMeetings.length:",
            classesWithoutMeetings.length
          )}
          {console.log(
            "Condition result:",
            selectedMonth && classesWithoutMeetings.length > 0
          )}
          {console.log("==================")}
          {selectedMonth && classesWithoutMeetings.length > 0 && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <ExclamationCircleOutlined className="text-yellow-600 text-xl mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-base">
                    Các lớp chưa có cuộc họp trong tháng{" "}
                    {selectedMonth.format("MM/YYYY")}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {classesWithoutMeetings.map((cls) => (
                  <div
                    key={cls.class_id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag
                            color="orange"
                            className="text-sm px-3 py-1"
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {cls.class_name}
                          </Tag>
                        </div>
                        <div className="text-sm text-gray-700">
                          {cls.description || "Không có mô tả"}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="text-gray-700">Sĩ số:</span>{" "}
                          <span className="font-medium">
                            {cls.students_count || 0}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="text-gray-700">CVHT:</span>{" "}
                          <span className="font-medium">
                            {cls.advisor?.full_name || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-4">
                Tổng:{" "}
                <strong className="text-gray-800">
                  {classesWithoutMeetings.length}
                </strong>{" "}
                lớp chưa tổ chức họp
              </p>
            </div>
          )}

          {/* Table */}
          {meetings.length === 0 && !loading ? (
            <Empty
              description={
                <div>
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
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorMeetings;
