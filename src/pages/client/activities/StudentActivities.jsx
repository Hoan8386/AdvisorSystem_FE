import { useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  Card,
  Button,
  Space,
  Tag,
  DatePicker,
  Select,
  Row,
  Col,
  Empty,
  Badge,
  Tooltip,
} from "antd";
import { toast } from "react-toastify";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClearOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getActivitiesAPI } from "../../../services/api.service";

const { RangePicker } = DatePicker;

export const StudentActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null,
  });

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line
  }, [filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.dateRange && filters.dateRange.length === 2) {
        params.from_date = filters.dateRange[0].format("YYYY-MM-DD");
        params.to_date = filters.dateRange[1].format("YYYY-MM-DD");
      }

      const res = await getActivitiesAPI(params);
      if (res && res.data) {
        setActivities(res.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách hoạt động");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewDetail = (activityId) => {
    navigate(`/student/activities/${activityId}`);
  };

  // Kiểm tra xem hoạt động có đang diễn ra không
  const isActivityOngoing = (activity) => {
    const now = dayjs();
    const startTime = dayjs(activity.start_time);
    const endTime = dayjs(activity.end_time);

    // Hoạt động đang diễn ra nếu thời gian hiện tại nằm giữa start và end
    return now.isAfter(startTime) && now.isBefore(endTime);
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
    cancelled: { color: "red", text: "Đã hủy", icon: <CloseCircleOutlined /> },
  };

  const hasActiveFilters = filters.status || filters.dateRange;

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6">
        {/* Header - Enhanced */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 m-0 mb-2 flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl">🎯</span>
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Hoạt động ngoại khóa
              </span>
            </h1>
          </div>
          <Button
            type="primary"
            size="middle"
            onClick={() => navigate("/student/activities/my-registrations")}
            className="shadow-lg hover:shadow-xl transition-all rounded-xl font-medium w-full sm:w-auto"
            style={{
              background: "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
              border: "none",
              height: "40px",
              padding: "0 20px",
            }}
            icon={<StarOutlined />}
          >
            <span className="hidden sm:inline">Hoạt động đã đăng ký</span>
            <span className="sm:hidden">Đã đăng ký</span>
          </Button>
        </div>

        {/* Filters - Enhanced */}
        <Card
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <FilterOutlined className="text-base sm:text-lg" />
              <span className="text-sm sm:text-base">Bộ lọc</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <Select
                placeholder="Chọn trạng thái"
                className="w-full sm:w-48 rounded-lg"
                size="middle"
                allowClear
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
                options={[
                  {
                    label: (
                      <Space>
                        <ClockCircleOutlined style={{ color: "#1677ff" }} />
                        Sắp diễn ra
                      </Space>
                    ),
                    value: "upcoming",
                  },
                  {
                    label: (
                      <Space>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        Đang diễn ra
                      </Space>
                    ),
                    value: "ongoing",
                  },
                  {
                    label: (
                      <Space>
                        <CheckCircleOutlined style={{ color: "#8c8c8c" }} />
                        Đã hoàn thành
                      </Space>
                    ),
                    value: "completed",
                  },
                  {
                    label: (
                      <Space>
                        <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                        Đã hủy
                      </Space>
                    ),
                    value: "cancelled",
                  },
                ]}
              />

              <RangePicker
                placeholder={["Từ ngày", "Đến ngày"]}
                format="DD/MM/YYYY"
                size="middle"
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange("dateRange", dates)}
                className="w-full sm:w-auto rounded-lg"
              />

              {hasActiveFilters && (
                <Button
                  type="text"
                  danger
                  icon={<ClearOutlined />}
                  onClick={() => setFilters({ status: null, dateRange: null })}
                  className="rounded-lg hover:bg-red-50 w-full sm:w-auto"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="text-xs sm:text-sm text-gray-500 font-medium text-center sm:text-left">
              Tìm thấy{" "}
              <strong className="text-blue-600">{activities.length}</strong>{" "}
              hoạt động
            </div>
          </div>
        </Card>

        {/* Activities List - Enhanced */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-500 font-medium">Đang tải hoạt động...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <Card
            style={{
              borderRadius: 16,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
            }}
            bodyStyle={{ padding: "60px 24px" }}
          >
            <Empty
              description={
                <div className="text-center">
                  <p className="text-gray-500 text-base mb-2">
                    {hasActiveFilters
                      ? "Không tìm thấy hoạt động phù hợp"
                      : "Chưa có hoạt động nào"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {hasActiveFilters
                      ? "Thử điều chỉnh bộ lọc để xem thêm hoạt động"
                      : "Các hoạt động mới sẽ được cập nhật sớm"}
                  </p>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {activities.map((activity) => {
              const isOngoing = isActivityOngoing(activity);
              const status = statusConfig[activity.status];

              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={activity.activity_id}>
                  <Card
                    hoverable
                    className="group relative overflow-hidden transition-all duration-300"
                    style={{
                      borderRadius: 16,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      height: "100%",
                    }}
                    bodyStyle={{
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    {/* Decorative gradient bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background:
                          activity.status === "upcoming"
                            ? "linear-gradient(90deg, #1677ff 0%, #0958d9 100%)"
                            : activity.status === "ongoing"
                            ? "linear-gradient(90deg, #52c41a 0%, #389e0d 100%)"
                            : activity.status === "cancelled"
                            ? "linear-gradient(90deg, #ff4d4f 0%, #cf1322 100%)"
                            : "linear-gradient(90deg, #8c8c8c 0%, #595959 100%)",
                      }}
                    />

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <Tag
                        color={status?.color}
                        icon={status?.icon}
                        className="rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {status?.text}
                      </Tag>
                      {isOngoing && (
                        <Badge
                          dot
                          status="processing"
                          className="animate-pulse"
                        >
                          <Tag
                            color="volcano"
                            icon={<FireOutlined />}
                            className="rounded-full px-3 py-1 text-xs font-medium"
                          >
                            Đang diễn ra
                          </Tag>
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <Tooltip title={activity.title}>
                      <h3
                        className="text-lg font-bold mb-3 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors"
                        style={{ minHeight: "56px" }}
                      >
                        {activity.title}
                      </h3>
                    </Tooltip>

                    {/* Description */}
                    {activity.general_description && (
                      <p
                        className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed"
                        style={{ minHeight: "60px" }}
                      >
                        {activity.general_description}
                      </p>
                    )}

                    {/* Info Section */}
                    <div className="space-y-3 mb-4 flex-grow">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CalendarOutlined className="text-blue-500 text-base mt-0.5" />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-500 text-xs font-medium">
                              Bắt đầu
                            </span>
                            <span className="font-semibold text-gray-700">
                              {dayjs(activity.start_time).format(
                                "DD/MM/YYYY HH:mm"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs font-medium">
                              Kết thúc
                            </span>
                            <span className="font-semibold text-gray-700">
                              {dayjs(activity.end_time).format(
                                "DD/MM/YYYY HH:mm"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <EnvironmentOutlined className="text-red-500 text-base" />
                        <Tooltip title={activity.location}>
                          <span className="text-sm text-gray-700 line-clamp-1 flex-1 font-medium">
                            {activity.location}
                          </span>
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <TeamOutlined className="text-green-500 text-base" />
                        <span className="text-sm text-gray-700 line-clamp-1 flex-1 font-medium">
                          {activity.organizer_unit?.unit_name || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Roles Info */}
                    {activity.roles && activity.roles.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-600 font-semibold mb-2 flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          {activity.roles.length} vai trò tham gia
                        </div>
                        <Space size={6} wrap>
                          {activity.roles.slice(0, 2).map((role) => (
                            <Tag
                              key={role.activity_role_id}
                              color="blue"
                              className="rounded-md text-xs m-0"
                            >
                              {role.role_name}
                            </Tag>
                          ))}
                          {activity.roles.length > 2 && (
                            <Tag className="rounded-md text-xs bg-gray-100 border-gray-200 text-gray-600 m-0">
                              +{activity.roles.length - 2} khác
                            </Tag>
                          )}
                        </Space>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={() => handleViewDetail(activity.activity_id)}
                      icon={<EyeOutlined />}
                      className="rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                      style={{
                        background:
                          "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                        border: "none",
                        height: "44px",
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentActivities;
