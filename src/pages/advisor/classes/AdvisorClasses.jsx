import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import { Card, Row, Col, Empty, Spin, Tag, Descriptions } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getClassesAPI } from "../../../services/api.service";
import { toast } from "react-toastify";

export const AdvisorClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getClassesAPI();

      // Response structure: response.data = { success: true, data: [...], message: "..." }
      if (response?.data?.success) {
        setClasses(response.data.data || []);
      } else if (response?.data) {
        // Fallback: nếu data trả về trực tiếp là array
        setClasses(Array.isArray(response.data) ? response.data : []);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Lỗi khi tải danh sách lớp");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classId) => {
    navigate(`/advisor/classes/${classId}`);
  };

  return (
    <AdvisorLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4 ">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-2">
              <TeamOutlined /> Lớp học quản lý
            </h1>
            <p className="text-gray-500 text-sm mt-1 mb-0">
              Danh sách các lớp bạn đang quản lý
            </p>
          </div>
        </div>

        {/* Stats */}
        <Card
          size="small"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            color: "white",
            marginBottom: "20px",
          }}
        >
          <div className="flex items-center justify-between ">
            <div>
              <div className="text-3xl font-bold">{classes.length}</div>
              <div className="text-sm opacity-90 mt-1">Tổng số lớp quản lý</div>
            </div>
            <TeamOutlined style={{ fontSize: 48, opacity: 0.3 }} />
          </div>
        </Card>

        {/* Classes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Đang tải danh sách lớp..." />
          </div>
        ) : classes.length === 0 ? (
          <Card>
            <Empty
              description="Bạn chưa quản lý lớp nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {classes.map((cls) => (
              <Col xs={24} sm={12} lg={8} key={cls.class_id}>
                <Card
                  hoverable
                  onClick={() => handleClassClick(cls.class_id)}
                  style={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    height: "100%",
                    transition: "all 0.3s ease",
                  }}
                  bodyStyle={{ padding: "20px" }}
                  className="hover:shadow-lg"
                >
                  <div className="space-y-4">
                    {/* Class Header */}
                    <div className="flex items-start gap-3">
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 20,
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        {cls.class_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-bold text-gray-900 m-0 truncate"
                          title={cls.class_name}
                        >
                          {cls.class_name}
                        </h3>
                        {cls.description && (
                          <p
                            className="text-sm text-gray-500 m-0 mt-1"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                            title={cls.description}
                          >
                            {cls.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Faculty Info */}
                    {cls.faculty && (
                      <div
                        style={{
                          padding: "10px 12px",
                          background: "#f0f9ff",
                          borderRadius: 8,
                          borderLeft: "3px solid #3b82f6",
                        }}
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <BankOutlined style={{ color: "#3b82f6" }} />
                          <span className="text-gray-700 font-medium">
                            {cls.faculty.unit_name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Advisor Info */}
                    {cls.advisor && (
                      <div
                        style={{
                          padding: "10px 12px",
                          background: "#fef3c7",
                          borderRadius: 8,
                          borderLeft: "3px solid #f59e0b",
                        }}
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <IdcardOutlined style={{ color: "#f59e0b" }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-700 font-medium truncate">
                              {cls.advisor.full_name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {cls.advisor.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Student Count - Hidden for now, will be shown in detail page */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px",
                        background: "#f9fafb",
                        borderRadius: 8,
                      }}
                    >
                      <UserOutlined
                        style={{ color: "#667eea", fontSize: 18 }}
                      />
                      <span className="text-sm text-gray-600">
                        Xem chi tiết lớp học
                      </span>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorClasses;
