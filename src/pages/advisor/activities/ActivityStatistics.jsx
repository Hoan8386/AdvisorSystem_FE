import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import { Card, Button, Statistic, Row, Col, Progress, Tag, Empty } from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getActivityDetailAPI,
  getAttendanceStatisticsAPI,
} from "../../../services/api.service";

export const ActivityStatistics = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch activity detail
      const actRes = await getActivityDetailAPI(id);
      if (actRes && actRes.data) {
        setActivity(actRes.data);
      }

      // Fetch statistics
      const statsRes = await getAttendanceStatisticsAPI(id);
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      const errorMsg =
        error?.response?.status === 403
          ? "Bạn không có quyền xem thống kê này"
          : error?.response?.status === 404
          ? "Hoạt động không tồn tại"
          : error?.message ||
            "Lỗi khi tải thống kê điểm danh. Vui lòng thử lại.";
      toast.error(errorMsg);
      console.error(error);
      navigate(`/advisor/activities/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    upcoming: { color: "blue", text: "Sắp diễn ra" },
    ongoing: { color: "green", text: "Đang diễn ra" },
    completed: { color: "default", text: "Đã hoàn thành" },
    cancelled: { color: "red", text: "Đã hủy" },
  };

  if (loading) {
    return (
      <AdvisorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Đang tải...</div>
        </div>
      </AdvisorLayout>
    );
  }

  if (!activity || !stats) {
    return (
      <AdvisorLayout>
        <Empty description="Không có dữ liệu" />
      </AdvisorLayout>
    );
  }

  const attendanceRate = stats?.statistics?.attendance_rate || 0;
  const totalAttended =
    (stats?.statistics?.attended || 0) + (stats?.statistics?.absent || 0);

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
                📊 Thống kê điểm danh
              </h1>
              <p className="text-gray-500 text-sm mt-1 mb-0">
                {activity.title}
              </p>
            </div>
          </div>
          <Tag color={statusConfig[activity.status]?.color}>
            {statusConfig[activity.status]?.text}
          </Tag>
        </div>

        {/* Activity Info */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div className="flex items-center gap-3">
                <CalendarOutlined className="text-lg text-blue-500" />
                <div>
                  <div className="text-xs text-gray-600">Thời gian bắt đầu</div>
                  <div className="font-semibold">
                    {dayjs(activity.start_time).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="flex items-center gap-3">
                <CalendarOutlined className="text-lg text-red-500" />
                <div>
                  <div className="text-xs text-gray-600">
                    Thời gian kết thúc
                  </div>
                  <div className="font-semibold">
                    {dayjs(activity.end_time).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Statistic
              title="Tổng đăng ký"
              value={stats?.statistics?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>

          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Statistic
              title="Đã tham gia"
              value={stats?.statistics?.attended || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>

          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Statistic
              title="Vắng mặt"
              value={stats?.statistics?.absent || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>

          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Statistic
              title="Chưa điểm danh"
              value={stats?.statistics?.registered || 0}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </div>

        {/* Attendance Rate */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div className="text-center">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tỷ lệ tham gia
              </h3>
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {attendanceRate}%
              </div>
              <div className="text-sm text-gray-600">
                {stats?.statistics?.attended || 0} /{" "}
                {totalAttended > 0
                  ? totalAttended
                  : stats?.statistics?.total || 0}{" "}
                người
              </div>
            </div>
            <Progress
              type="circle"
              percent={attendanceRate}
              width={150}
              strokeColor={{
                "0%": "#f5222d",
                "50%": "#faad14",
                "100%": "#52c41a",
              }}
              format={(percent) => `${percent}%`}
            />
          </div>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <Card
            title="Chi tiết trạng thái"
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Tổng đăng ký</span>
                <Tag color="blue">{stats?.statistics?.total || 0}</Tag>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Đã tham gia</span>
                <Tag color="green">{stats?.statistics?.attended || 0}</Tag>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium">Vắng mặt</span>
                <Tag color="red">{stats?.statistics?.absent || 0}</Tag>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Chưa điểm danh</span>
                <Tag color="gold">{stats?.statistics?.registered || 0}</Tag>
              </div>
              {stats?.statistics?.cancelled > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                  <span className="font-medium">Đã hủy</span>
                  <Tag>{stats?.statistics?.cancelled || 0}</Tag>
                </div>
              )}
            </div>
          </Card>

          <Card
            title="Tóm tắt"
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  Tỷ lệ tham gia:
                </div>
                <Progress
                  percent={attendanceRate}
                  strokeColor={
                    attendanceRate >= 80
                      ? "#52c41a"
                      : attendanceRate >= 60
                      ? "#faad14"
                      : "#ff4d4f"
                  }
                  format={(percent) => `${percent}%`}
                />
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  Tổng số người được kiểm tra
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalAttended > 0
                    ? totalAttended
                    : stats?.statistics?.total || 0}
                </div>
              </div>
              {stats?.statistics?.cancelled > 0 && (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">
                    Số người đã hủy đăng ký
                  </div>
                  <div className="text-2xl font-bold text-gray-600">
                    {stats?.statistics?.cancelled}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdvisorLayout>
  );
};

export default ActivityStatistics;
