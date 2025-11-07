import { useContext, useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import { Card, Table, Tag, Spin, Empty } from "antd";
import { AuthContext } from "../../../components/context/auth.context";
import { getStudentPointsAPI } from "../../../services/api.service";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export const StudentPoints = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pointsData, setPointsData] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchStudentPoints();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchStudentPoints = async () => {
    try {
      setLoading(true);
      const res = await getStudentPointsAPI(user.id);
      if (res && res.data) {
        setPointsData(res.data);
      }
    } catch (error) {
      console.error("Error fetching student points:", error);
      toast.error("Lỗi khi tải điểm rèn luyện");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên hoạt động",
      dataIndex: "activity_title",
      key: "activity_title",
    },
    {
      title: "Vai trò",
      dataIndex: "role_name",
      key: "role_name",
      width: 200,
    },
    {
      title: "Loại điểm",
      dataIndex: "point_type",
      key: "point_type",
      width: 120,
      align: "center",
      render: (type) => (
        <Tag color={type === "ren_luyen" ? "blue" : "green"}>
          {type === "ren_luyen" ? "Rèn luyện" : "CTXH"}
        </Tag>
      ),
    },
    {
      title: "Điểm",
      dataIndex: "points_awarded",
      key: "points_awarded",
      width: 100,
      align: "center",
      render: (points) => (
        <span className="font-bold text-lg text-blue-600">+{points}</span>
      ),
    },
    {
      title: "Ngày hoạt động",
      dataIndex: "activity_date",
      key: "activity_date",
      width: 150,
      align: "center",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🏆</span>
            <h1 className="text-3xl font-bold">Điểm Rèn Luyện Của Tôi</h1>
          </div>
          {pointsData?.student_info && (
            <div className="text-lg opacity-90">
              <span className="font-semibold">
                {pointsData.student_info.full_name}
              </span>
              <span className="mx-2">•</span>
              <span>{pointsData.student_info.user_code}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Đang tải điểm rèn luyện..." />
          </div>
        ) : pointsData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{
                  borderRadius: 16,
                  border: "2px solid #3b82f6",
                  background:
                    "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                }}
              >
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {pointsData.summary?.total_training_points || 0}
                </div>
                <div className="text-lg text-gray-700 font-semibold">
                  Điểm Rèn Luyện
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Tổng điểm hoạt động rèn luyện
                </div>
              </Card>

              <Card
                className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{
                  borderRadius: 16,
                  border: "2px solid #10b981",
                  background:
                    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                }}
              >
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {pointsData.summary?.total_social_points || 0}
                </div>
                <div className="text-lg text-gray-700 font-semibold">
                  Điểm Cộng Tác Xã Hội
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Tổng điểm hoạt động CTXH
                </div>
              </Card>
            </div>

            {/* Activities Table */}
            <Card
              title={
                <span className="text-xl font-bold">
                  Chi Tiết Các Hoạt Động ({pointsData.activities?.length || 0})
                </span>
              }
              style={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {pointsData.activities && pointsData.activities.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={pointsData.activities}
                  rowKey={(record, index) => index}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng ${total} hoạt động`,
                  }}
                  locale={{
                    emptyText: "Chưa có hoạt động nào",
                  }}
                />
              ) : (
                <Empty
                  description="Bạn chưa tham gia hoạt động nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </>
        ) : (
          <Card>
            <Empty
              description="Không có dữ liệu điểm rèn luyện"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentPoints;
