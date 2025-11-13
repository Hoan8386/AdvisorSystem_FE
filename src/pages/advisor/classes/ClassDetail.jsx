import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Descriptions,
  Empty,
  Spin,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getClassSummaryPointsAPI,
  getStudentPointsAPI,
} from "../../../services/api.service";

export const ClassDetail = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Student detail modal
  const [studentDetailVisible, setStudentDetailVisible] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

  const fetchClassSummary = async () => {
    try {
      setLoading(true);
      const res = await getClassSummaryPointsAPI(classId);
      if (res && res.data) {
        setClassData({
          class_name: res.data.class_name,
          total_students: res.data.total_students,
        });
        setStudents(res.data.students || []);
      }
    } catch (error) {
      console.error("Error fetching class summary:", error);
      toast.error("Lỗi khi tải thông tin lớp");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchClassSummary();
    }
    // eslint-disable-next-line
  }, [classId]);

  const handleViewStudentDetail = async (studentId) => {
    try {
      setLoadingStudentDetail(true);
      setStudentDetailVisible(true);
      const res = await getStudentPointsAPI(studentId);
      if (res && res.data) {
        setSelectedStudentDetail(res.data);
      }
    } catch (error) {
      console.error("Error fetching student detail:", error);
      toast.error("Lỗi khi tải thông tin sinh viên");
    } finally {
      setLoadingStudentDetail(false);
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
      title: "MSSV",
      dataIndex: "user_code",
      key: "user_code",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Điểm rèn luyện",
      dataIndex: "total_training_points",
      key: "total_training_points",
      width: 150,
      align: "center",
      render: (points) => (
        <Tag color="blue" className="text-base px-3 py-1">
          {points || 0}
        </Tag>
      ),
      sorter: (a, b) =>
        (a.total_training_points || 0) - (b.total_training_points || 0),
    },
    {
      title: "Điểm CTXH",
      dataIndex: "total_social_points",
      key: "total_social_points",
      width: 150,
      align: "center",
      render: (points) => (
        <Tag color="green" className="text-base px-3 py-1">
          {points || 0}
        </Tag>
      ),
      sorter: (a, b) =>
        (a.total_social_points || 0) - (b.total_social_points || 0),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewStudentDetail(record.student_id)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <AdvisorLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/advisor/classes")}
              size="large"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 m-0">
                👥 {classData?.class_name || "Lớp học"}
              </h1>
              <p className="text-gray-500 text-sm mt-1 mb-0">
                Quản lý điểm sinh viên
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {classData && (
          <Card
            size="small"
            className="text-center"
            style={{ maxWidth: 300, marginBottom: "20px" }}
          >
            <div className="text-2xl font-bold text-blue-600">
              {classData.total_students}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-2 mt-2">
              <UserOutlined /> Tổng sinh viên
            </div>
          </Card>
        )}

        {/* Students Table */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="Đang tải danh sách sinh viên..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={students}
              rowKey="student_id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng ${total} sinh viên`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description="Chưa có sinh viên nào trong lớp"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          )}
        </Card>

        {/* Student Detail Modal */}
        <Modal
          title="Chi tiết điểm sinh viên"
          open={studentDetailVisible}
          onCancel={() => {
            setStudentDetailVisible(false);
            setSelectedStudentDetail(null);
          }}
          footer={null}
          width={900}
        >
          {loadingStudentDetail ? (
            <div className="text-center py-8">
              <Spin tip="Đang tải thông tin..." />
            </div>
          ) : selectedStudentDetail ? (
            <div className="space-y-4">
              {/* Student Info */}
              <Card size="small" title="Thông tin sinh viên">
                <Descriptions column={2}>
                  <Descriptions.Item label="MSSV">
                    {selectedStudentDetail.student_info?.user_code}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ tên">
                    {selectedStudentDetail.student_info?.full_name}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card size="small" className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedStudentDetail.summary?.total_training_points || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Tổng điểm rèn luyện
                  </div>
                </Card>
                <Card size="small" className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {selectedStudentDetail.summary?.total_social_points || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Tổng điểm CTXH
                  </div>
                </Card>
              </div>

              {/* Activities */}
              <Card size="small" title="Danh sách hoạt động đã tham gia">
                <Table
                  columns={[
                    {
                      title: "Hoạt động",
                      dataIndex: "activity_title",
                      key: "activity_title",
                    },
                    {
                      title: "Vai trò",
                      dataIndex: "role_name",
                      key: "role_name",
                      width: 150,
                      render: (text) => <Tag color="blue">{text}</Tag>,
                    },
                    {
                      title: "Điểm",
                      dataIndex: "points_awarded",
                      key: "points_awarded",
                      width: 100,
                      align: "center",
                      render: (points) => (
                        <Tag color="orange" className="font-bold">
                          +{points}
                        </Tag>
                      ),
                    },
                    {
                      title: "Loại điểm",
                      dataIndex: "point_type",
                      key: "point_type",
                      width: 120,
                      render: (type) => (
                        <Tag color={type === "ren_luyen" ? "blue" : "green"}>
                          {type === "ren_luyen" ? "Rèn luyện" : "CTXH"}
                        </Tag>
                      ),
                    },
                    {
                      title: "Ngày tham gia",
                      dataIndex: "activity_date",
                      key: "activity_date",
                      width: 150,
                      render: (date) => dayjs(date).format("DD/MM/YYYY"),
                    },
                  ]}
                  dataSource={selectedStudentDetail.activities || []}
                  rowKey={(record, index) => index}
                  pagination={false}
                  scroll={{ y: 300 }}
                  locale={{
                    emptyText: (
                      <Empty
                        description="Chưa tham gia hoạt động nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                  }}
                />
              </Card>
            </div>
          ) : null}
        </Modal>
      </div>
    </AdvisorLayout>
  );
};

export default ClassDetail;
