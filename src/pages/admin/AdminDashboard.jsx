import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { getDashboardOverviewApi } from "../../services/api.service";

export const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);
      const result = await getDashboardOverviewApi();

      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      toast.error("Không thể tải dữ liệu bảng điều khiển");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Bảng điều khiển</h1>
      {dashboardData && (
        <p className="text-gray-600 mb-5 text-lg">{dashboardData.unit_name}</p>
      )}

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border-0"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <Statistic
                title={<span className="text-white/90">Tổng số lớp</span>}
                value={dashboardData?.total_classes || 0}
                prefix={<TeamOutlined style={{ color: "#fff" }} />}
                valueStyle={{ color: "#fff", fontSize: "28px" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border-0"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <Statistic
                title={<span className="text-white/90">Tổng số sinh viên</span>}
                value={dashboardData?.total_students || 0}
                prefix={<UserOutlined style={{ color: "#fff" }} />}
                valueStyle={{ color: "#fff", fontSize: "28px" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border-0"
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <Statistic
                title={<span className="text-white/90">Tổng số môn học</span>}
                value={dashboardData?.total_courses || 0}
                prefix={<BookOutlined style={{ color: "#fff" }} />}
                valueStyle={{ color: "#fff", fontSize: "28px" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border-0"
              style={{
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              }}
            >
              <Statistic
                title={
                  <span className="text-white/90">Tổng số giảng viên</span>
                }
                value={dashboardData?.total_advisors || 0}
                prefix={<UserOutlined style={{ color: "#fff" }} />}
                valueStyle={{ color: "#fff", fontSize: "28px" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24}>
            <Card className="shadow-lg rounded-lg border-0">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chào mừng đến Hệ thống Quản lý Cố vấn
                </h2>
                {dashboardData && (
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Đơn vị:</span>{" "}
                      {dashboardData.unit_name}
                    </p>
                    <p className="text-gray-600">
                      Bảng điều khiển này cung cấp cái nhìn tổng quan về các chỉ
                      số quan trọng của đơn vị. Bạn có thể quản lý lớp học, học
                      kỳ, môn học, giảng viên và xem các báo cáo chi tiết.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AdminDashboard;
