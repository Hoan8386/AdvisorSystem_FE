import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../components/context/auth.context";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import { getAdvisorStatisticsApi } from "../../../services/api.service";
import { Card, Row, Col, Statistic, Spin, Alert, Button } from "antd";
import {
  TeamOutlined,
  BellOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ReloadOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvisorStats = async () => {
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

    fetchAdvisorStats();
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

        {/* Statistics Cards - Main */}
        {stats && (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng lớp"
                  value={stats.total_classes}
                  prefix={<FileTextOutlined className="text-blue-500" />}
                  valueStyle={{ color: "#1890ff", fontSize: "28px" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng sinh viên"
                  value={stats.total_students}
                  prefix={<TeamOutlined className="text-green-500" />}
                  valueStyle={{ color: "#52c41a", fontSize: "28px" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng hoạt động"
                  value={stats.total_activities}
                  prefix={<HeartOutlined className="text-red-500" />}
                  valueStyle={{ color: "#ff4d4f", fontSize: "28px" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng thông báo"
                  value={stats.total_notifications}
                  prefix={<BellOutlined className="text-orange-500" />}
                  valueStyle={{ color: "#faad14", fontSize: "28px" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Second Row - Total Meetings */}
        {stats && (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng cuộc họp"
                  value={stats.total_meetings}
                  prefix={<CalendarOutlined className="text-purple-500" />}
                  valueStyle={{ color: "#722ed1", fontSize: "28px" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Classes Detail Section */}
        {stats?.classes_detail && stats.classes_detail.length > 0 && (
          <Card title="Chi tiết lớp quản lý" className="shadow-lg">
            <Row gutter={[16, 16]}>
              {stats.classes_detail.map((classDetail, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    hoverable
                    className="text-center shadow-md hover:shadow-lg transition-shadow cursor-pointer"
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

export default AdvisorDashboard;
