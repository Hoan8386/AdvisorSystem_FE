import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../components/context/auth.context";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import { getAdvisorStatisticsApi } from "../../../services/api.service";
import { Card, Row, Col, Statistic, Spin, Button, Alert } from "antd";
import {
  TeamOutlined,
  BellOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ReloadOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export const AdvisorHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (user?.id) {
          const res = await getAdvisorStatisticsApi(user.id);
          if (res && res.success) {
            setStats(res.data);
          }
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu thống kê");
        console.error("Error fetching advisor stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      if (user?.id) {
        const res = await getAdvisorStatisticsApi(user.id);
        if (res && res.success) {
          setStats(res.data);
        }
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu thống kê");
      console.error("Error fetching advisor stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdvisorLayout>
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      </AdvisorLayout>
    );
  }

  return (
    <AdvisorLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">
              Xin chào, {user?.full_name}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {dayjs().format("dddd, DD MMMM YYYY")}
            </p>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Error Alert */}
        {error && <Alert message={error} type="error" closable />}

        {/* Statistics Cards - SỬ DỤNG GRID ĐỂ FULL WIDTH 100% */}
        {stats && (
          // Thay đổi: Sử dụng grid của Tailwind thay vì Row/Col của Antd để chia 5 cột đều nhau
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {/* 1. Tổng lớp */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow h-full w-full">
              <Statistic
                title="Tổng lớp"
                value={stats.total_classes}
                prefix={<FileTextOutlined className="text-blue-500" />}
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </Card>

            {/* 2. Tổng sinh viên */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow h-full w-full">
              <Statistic
                title="Tổng sinh viên"
                value={stats.total_students}
                prefix={<TeamOutlined className="text-green-500" />}
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
              />
            </Card>

            {/* 3. Tổng hoạt động */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow h-full w-full">
              <Statistic
                title="Tổng hoạt động"
                value={stats.total_activities}
                prefix={<HeartOutlined className="text-red-500" />}
                valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
              />
            </Card>

            {/* 4. Tổng thông báo */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow h-full w-full">
              <Statistic
                title="Tổng thông báo"
                value={stats.total_notifications}
                prefix={<BellOutlined className="text-orange-500" />}
                valueStyle={{ color: "#faad14", fontSize: "24px" }}
              />
            </Card>

            {/* 5. Tổng cuộc họp */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow h-full w-full">
              <Statistic
                title="Tổng cuộc họp"
                value={stats.total_meetings}
                prefix={<CalendarOutlined className="text-purple-500" />}
                valueStyle={{ color: "#722ed1", fontSize: "24px" }}
              />
            </Card>
          </div>
        )}

        {/* Classes Detail Section */}
        {stats?.classes_detail && stats.classes_detail.length > 0 && (
          <Card title="Chi tiết lớp quản lý" className="shadow-lg w-full">
            <Row gutter={[16, 16]}>
              {stats.classes_detail.map((classDetail, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    hoverable
                    className="text-center shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                    onClick={() => navigate("/advisor/classes")}
                  >
                    <h3 className="text-xl font-bold mb-4 text-blue-600">
                      {classDetail.class_name}
                    </h3>
                    <Statistic
                      title="Sinh viên"
                      value={classDetail.student_count}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorHome;
