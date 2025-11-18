import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  Space,
  Empty,
  Spin,
  Divider,
  Badge,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckOutlined,
  PercentageOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { getMeetingStatisticsApi } from "../../../services/meeting.service";

export const MeetingStatistics = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await getMeetingStatisticsApi();
      console.log("Statistics Response:", response);

      // Response structure: { success: true, data: {...} }
      if (response?.success && response?.data) {
        console.log("Setting statistics:", response.data);
        setStatistics(response.data);
      } else if (response?.data?.success && response?.data?.data) {
        console.log(
          "Setting statistics from nested success path:",
          response.data.data
        );
        setStatistics(response.data.data);
      } else if (response?.data?.data) {
        console.log("Setting statistics from data path:", response.data.data);
        setStatistics(response.data.data);
      } else {
        console.log("No data found in response:", response);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Không thể tải thống kê cuộc họp");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const StatisticCard = ({
    // eslint-disable-next-line no-unused-vars
    icon: IconComponent,
    title,
    value,
    suffix,
    color,
  }) => (
    <Card
      hoverable
      style={{
        borderTop: `4px solid ${color}`,
        height: "100%",
      }}
    >
      <Row gutter={16} align="middle">
        <Col>
          <div
            style={{
              fontSize: 32,
              color: color,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconComponent />
          </div>
        </Col>
        <Col flex="auto">
          <div style={{ color: "#8c8c8c", fontSize: 12, marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#262626" }}>
            {value}
            {suffix && <span style={{ fontSize: 16 }}>{suffix}</span>}
          </div>
        </Col>
      </Row>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 50,
            minHeight: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <Card>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>Không có dữ liệu thống kê</p>
          </div>
        </Card>
      </div>
    );
  }

  const {
    total_meetings = 0,
    scheduled = 0,
    completed = 0,
    cancelled = 0,
    with_minutes = 0,
    attendance = {},
  } = statistics;

  const {
    total_attendees = 0,
    attended_count = 0,
    attendance_rate = 0,
  } = attendance;

  return (
    <AdvisorLayout>
      <div className="p-6">
        <Card>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                className="mb-4"
              >
                Quay lại
              </Button>
              <h1 className="text-2xl font-bold">
                <BarChartOutlined style={{ marginRight: 12 }} />
                Thống kê Cuộc Họp
              </h1>
            </div>
            <Button type="primary" onClick={fetchStatistics} loading={loading}>
              Làm mới
            </Button>
          </div>

          {/* Meeting Statistics Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
              <CalendarOutlined style={{ marginRight: 8 }} />
              Tổng Quan Cuộc Họp
            </h2>
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <StatisticCard
                  icon={CalendarOutlined}
                  title="Tổng Cuộc Họp"
                  value={total_meetings}
                  color="#1890ff"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Tooltip title="Cuộc họp đã được lên lịch nhưng chưa diễn ra">
                  <StatisticCard
                    icon={ClockCircleOutlined}
                    title="Đã Lên Lịch"
                    value={scheduled}
                    color="#faad14"
                  />
                </Tooltip>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Tooltip title="Cuộc họp đã hoàn thành">
                  <StatisticCard
                    icon={CheckCircleOutlined}
                    title="Hoàn Thành"
                    value={completed}
                    color="#52c41a"
                  />
                </Tooltip>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Tooltip title="Cuộc họp đã bị hủy">
                  <StatisticCard
                    icon={CloseCircleOutlined}
                    title="Đã Hủy"
                    value={cancelled}
                    color="#ff4d4f"
                  />
                </Tooltip>
              </Col>
            </Row>

            {/* Meeting Progress */}
            <Divider />
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card type="inner" title="Tỷ Lệ Hoàn Thành">
                  <div style={{ marginBottom: 16 }}>
                    <Progress
                      type="circle"
                      percent={
                        total_meetings > 0
                          ? Math.round((completed / total_meetings) * 100)
                          : 0
                      }
                      format={(percent) => `${percent}%`}
                      strokeColor="#52c41a"
                    />
                  </div>
                  <div style={{ textAlign: "center", color: "#8c8c8c" }}>
                    {completed} / {total_meetings} cuộc họp
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card type="inner" title="Cuộc Họp Có Biên Bản">
                  <div style={{ marginBottom: 16 }}>
                    <Progress
                      type="circle"
                      percent={
                        total_meetings > 0
                          ? Math.round((with_minutes / total_meetings) * 100)
                          : 0
                      }
                      format={(percent) => `${percent}%`}
                      strokeColor="#1890ff"
                    />
                  </div>
                  <div style={{ textAlign: "center", color: "#8c8c8c" }}>
                    {with_minutes} / {total_meetings} cuộc họp
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Attendance Statistics Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
              <TeamOutlined style={{ marginRight: 8 }} />
              Thống Kê Điểm Danh
            </h2>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatisticCard
                  icon={TeamOutlined}
                  title="Tổng Người Tham Dự"
                  value={total_attendees}
                  color="#722ed1"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatisticCard
                  icon={CheckOutlined}
                  title="Đã Tham Dự"
                  value={attended_count}
                  color="#13c2c2"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatisticCard
                  icon={PercentageOutlined}
                  title="Tỷ Lệ Tham Dự"
                  value={attendance_rate.toFixed(2)}
                  suffix="%"
                  color="#eb2f96"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{
                    borderTop: "4px solid #fa8c16",
                    height: "100%",
                  }}
                >
                  <Row gutter={16} align="middle">
                    <Col>
                      <div
                        style={{
                          fontSize: 32,
                          color: "#fa8c16",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Badge status="error" />
                      </div>
                    </Col>
                    <Col flex="auto">
                      <div
                        style={{
                          color: "#8c8c8c",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        Vắng Mặt
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: "bold",
                          color: "#262626",
                        }}
                      >
                        {total_attendees - attended_count}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* Attendance Rate Detail */}
            <Divider />
            <Row gutter={16}>
              <Col xs={24}>
                <Card type="inner">
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span>Tỷ Lệ Điểm Danh</span>
                      <span style={{ fontWeight: "bold" }}>
                        {attendance_rate.toFixed(2)}%
                      </span>
                    </div>
                    <Progress
                      percent={attendance_rate}
                      strokeColor={{
                        "0%": "#ff4d4f",
                        "50%": "#faad14",
                        "100%": "#52c41a",
                      }}
                      format={() => ""}
                    />
                  </div>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col xs={24} sm={12}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                          Tổng người cần điểm danh
                        </div>
                        <div style={{ fontSize: 20, fontWeight: "bold" }}>
                          {total_attendees}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                          Đã điểm danh
                        </div>
                        <div style={{ fontSize: 20, fontWeight: "bold" }}>
                          {attended_count}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Summary Section */}
          <Divider />
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Tóm Tắt</h2>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                ✓ Tổng cộng <strong>{total_meetings} cuộc họp</strong> trong hệ
                thống
              </div>
              <div>
                ✓ <strong>{completed} cuộc họp</strong> (
                {total_meetings > 0
                  ? ((completed / total_meetings) * 100).toFixed(0)
                  : 0}
                %) đã hoàn thành
              </div>
              <div>
                ✓ <strong>{with_minutes} cuộc họp</strong> (
                {total_meetings > 0
                  ? ((with_minutes / total_meetings) * 100).toFixed(0)
                  : 0}
                %) có biên bản
              </div>
              <div>
                ✓ Tỷ lệ tham dự: <strong>{attendance_rate.toFixed(2)}%</strong>{" "}
                ({attended_count}/{total_attendees})
              </div>
            </Space>
          </div>
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default MeetingStatistics;
