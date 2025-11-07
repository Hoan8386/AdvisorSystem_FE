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
  Modal,
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

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            🎯 Hoạt động ngoại khóa
          </h1>
          <Button
            type="primary"
            onClick={() => navigate("/student/activities/my-registrations")}
            style={{
              background: "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
              border: "none",
            }}
          >
            Hoạt động đã đăng ký
          </Button>
        </div>

        {/* Filters */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <Space size="middle" wrap>
            <FilterOutlined />
            <span className="font-medium">Bộ lọc:</span>

            <Select
              placeholder="Trạng thái"
              style={{ width: 160 }}
              allowClear
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              options={[
                { label: "Sắp diễn ra", value: "upcoming" },
                { label: "Đang diễn ra", value: "ongoing" },
                { label: "Đã hoàn thành", value: "completed" },
                { label: "Đã hủy", value: "cancelled" },
              ]}
            />

            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange("dateRange", dates)}
            />

            {(filters.status || filters.dateRange) && (
              <Button
                type="link"
                onClick={() => setFilters({ status: null, dateRange: null })}
              >
                Xóa bộ lọc
              </Button>
            )}
          </Space>
        </Card>

        {/* Activities List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-500">Đang tải...</div>
          </div>
        ) : activities.length === 0 ? (
          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Empty
              description="Chưa có hoạt động nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {activities.map((activity) => (
              <Col xs={24} sm={12} lg={8} key={activity.activity_id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* Status Badge */}
                  <div className="mb-3">
                    <Tag
                      color={statusConfig[activity.status]?.color}
                      icon={statusConfig[activity.status]?.icon}
                    >
                      {statusConfig[activity.status]?.text}
                    </Tag>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg font-bold mb-3 line-clamp-2"
                    style={{ minHeight: "56px" }}
                  >
                    {activity.title}
                  </h3>

                  {/* Description */}
                  {activity.general_description && (
                    <p
                      className="text-gray-600 text-sm mb-3 line-clamp-2"
                      style={{ minHeight: "40px" }}
                    >
                      {activity.general_description}
                    </p>
                  )}

                  {/* Info */}
                  <Space
                    direction="vertical"
                    size="small"
                    className="mb-4 flex-grow"
                  >
                    <div className="flex items-center text-gray-600 text-sm">
                      <CalendarOutlined className="mr-2" />
                      <span>
                        {dayjs(activity.start_time).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <EnvironmentOutlined className="mr-2" />
                      <span className="line-clamp-1">{activity.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <TeamOutlined className="mr-2" />
                      <span>{activity.organizer_unit?.unit_name || "N/A"}</span>
                    </div>
                  </Space>

                  {/* Roles Info */}
                  {activity.roles && activity.roles.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">
                        {activity.roles.length} vai trò
                      </div>
                      <Space size={4} wrap>
                        {activity.roles.slice(0, 2).map((role) => (
                          <Tag
                            key={role.activity_role_id}
                            color="blue"
                            className="text-xs"
                          >
                            {role.role_name}
                          </Tag>
                        ))}
                        {activity.roles.length > 2 && (
                          <Tag className="text-xs">
                            +{activity.roles.length - 2} khác
                          </Tag>
                        )}
                      </Space>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    type="primary"
                    block
                    onClick={() => handleViewDetail(activity.activity_id)}
                    style={{
                      background:
                        "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                      border: "none",
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentActivities;
