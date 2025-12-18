import { useContext, useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import { Card, Table, Tag, Spin, Empty, Select, Tabs } from "antd";
import { AuthContext } from "../../../components/context/auth.context";
import {
  getStudentPointsAPI,
  getSemestersAPI,
} from "../../../services/api.service";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export const StudentPoints = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pointsData, setPointsData] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    fetchSemesters();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user?.id && selectedSemester) {
      fetchStudentPoints();
    }
    // eslint-disable-next-line
  }, [user, selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const res = await getSemestersAPI();
      if (res && res.data) {
        const semesterOptions = res.data.map((sem) => ({
          value: sem.semester_id,
          label: `${sem.semester_name} - ${sem.academic_year}`,
        }));
        setSemesters(semesterOptions);

        // Tự động chọn học kỳ đầu tiên
        if (semesterOptions.length > 0) {
          setSelectedSemester(semesterOptions[0].value);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách học kỳ");
      console.error(error);
    }
  };

  const fetchStudentPoints = async () => {
    try {
      setLoading(true);
      const res = await getStudentPointsAPI(user.id, selectedSemester);
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

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
  };

  const trainingColumns = [
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center",
      render: (status, record) => {
        if (status === "attended") {
          return <Tag color="success">Đã tham gia</Tag>;
        } else if (status === "absent") {
          return <Tag color="error">Vắng mặt</Tag>;
        }
        return <Tag color="default">{record.status_text}</Tag>;
      },
    },
    {
      title: "Điểm",
      dataIndex: "points_awarded",
      key: "points_awarded",
      width: 100,
      align: "center",
      render: (points, record) => {
        // Nếu vắng mặt thì hiển thị điểm âm với dấu -
        if (record.status === "absent") {
          return (
            <span className="font-bold text-lg text-red-600">
              -{Math.abs(record.actual_points)}
            </span>
          );
        }
        // Trường hợp bình thường không hiển thị dấu
        return (
          <span className="font-bold text-lg text-blue-600">{points}</span>
        );
      },
    },
    {
      title: "Ngày hoạt động",
      dataIndex: "activity_date",
      key: "activity_date",
      width: 150,
      align: "center",
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 200,
    },
  ];

  const socialColumns = [
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center",
      render: (status, record) => {
        if (status === "attended") {
          return <Tag color="success">Đã tham gia</Tag>;
        } else if (status === "absent") {
          return <Tag color="error">Vắng mặt</Tag>;
        }
        return <Tag color="default">{record.status_text}</Tag>;
      },
    },
    {
      title: "Điểm",
      dataIndex: "points_awarded",
      key: "points_awarded",
      width: 100,
      align: "center",
      render: (points, record) => {
        // CTXH: Chỉ hiển thị dấu + khi tham gia (attended)
        if (record.status === "attended") {
          return (
            <span className="font-bold text-lg text-green-600">+{points}</span>
          );
        }
        // Vắng mặt hoặc trạng thái khác không hiển thị dấu
        return (
          <span className="font-bold text-lg text-gray-500">
            {record.actual_points}
          </span>
        );
      },
    },
    {
      title: "Ngày hoạt động",
      dataIndex: "activity_date",
      key: "activity_date",
      width: 150,
      align: "center",
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 200,
    },
  ];

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl">🏆</span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Điểm Rèn Luyện Của Tôi
              </h1>
            </div>
            <Select
              className="w-full sm:w-64"
              placeholder="Chọn học kỳ"
              value={selectedSemester}
              onChange={handleSemesterChange}
              options={semesters}
              size="middle"
            />
          </div>
          {pointsData?.student_info && (
            <div className="text-sm sm:text-base md:text-lg opacity-90 break-words">
              <span className="font-semibold">
                {pointsData.student_info.full_name}
              </span>
              <span className="mx-2">•</span>
              <span>{pointsData.student_info.user_code}</span>
            </div>
          )}
          {pointsData?.filter_info && (
            <div className="mt-2 text-xs sm:text-sm opacity-80">
              📅 {pointsData.filter_info.semester_name} -{" "}
              {pointsData.filter_info.academic_year}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <Card
                className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{
                  borderRadius: 16,
                  border: "2px solid #10b981",
                  background:
                    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600 mb-2">
                  {pointsData.summary?.total_social_points + "/170" || 0}
                </div>
                <div className="text-base sm:text-lg text-gray-700 font-semibold">
                  Điểm Cộng Tác Xã Hội
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Tổng điểm hoạt động CTXH
                </div>
              </Card>
              <Card
                className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{
                  borderRadius: 16,
                  border: "2px solid #3b82f6",
                  background:
                    "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {pointsData.summary?.total_training_points + "/70" || 0}
                </div>
                <div className="text-base sm:text-lg text-gray-700 font-semibold">
                  Điểm Rèn Luyện
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Tổng điểm hoạt động rèn luyện
                </div>
              </Card>
            </div>

            {/* Activities Table */}
            <Card
              className="overflow-x-auto"
              style={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Tabs
                defaultActiveKey="training"
                items={[
                  {
                    key: "training",
                    label: (
                      <span className="text-sm sm:text-base md:text-lg font-semibold">
                        🔥 Rèn luyện (
                        {pointsData.training_activities?.length || 0})
                      </span>
                    ),
                    children:
                      pointsData.training_activities &&
                      pointsData.training_activities.length > 0 ? (
                        <Table
                          columns={trainingColumns}
                          dataSource={pointsData.training_activities}
                          rowKey={(record) => record.activity_id}
                          scroll={{ x: 800 }}
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total) => `Tổng ${total} hoạt động`,
                            responsive: true,
                          }}
                        />
                      ) : (
                        <Empty
                          description="Chưa có hoạt động rèn luyện nào"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ),
                  },
                  {
                    key: "social",
                    label: (
                      <span className="text-sm sm:text-base md:text-lg font-semibold">
                        💚 CTXH ({pointsData.social_activities?.length || 0})
                      </span>
                    ),
                    children:
                      pointsData.social_activities &&
                      pointsData.social_activities.length > 0 ? (
                        <Table
                          columns={socialColumns}
                          dataSource={pointsData.social_activities}
                          rowKey={(record) => record.activity_id}
                          scroll={{ x: 800 }}
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total) => `Tổng ${total} hoạt động`,
                            responsive: true,
                          }}
                        />
                      ) : (
                        <Empty
                          description="Chưa có hoạt động CTXH nào"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ),
                  },
                ]}
              />
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
