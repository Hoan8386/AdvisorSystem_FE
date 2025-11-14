import { useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  Card,
  Select,
  Table,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Tag,
  Alert,
} from "antd";
import { toast } from "react-toastify";
import {
  TrophyOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FireOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import {
  getMySemesterReportAPI,
  getSemestersAPI,
} from "../../../services/api.service";
import dayjs from "dayjs";

export const MySemesterReport = () => {
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

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
          fetchReport(semesterOptions[0].value);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách học kỳ");
      console.error(error);
    }
  };

  const fetchReport = async (semesterId) => {
    try {
      setLoading(true);
      const res = await getMySemesterReportAPI(semesterId);
      if (res && res.success) {
        setReportData(res.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setReportData(null);
        toast.info("Chưa có báo cáo học kỳ này");
      } else {
        toast.error("Lỗi khi tải báo cáo học kỳ");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
    fetchReport(value);
  };

  const getGradeColor = (grade) => {
    if (grade >= 8.5) return "success";
    if (grade >= 7.0) return "blue";
    if (grade >= 5.5) return "warning";
    return "error";
  };

  const getOutcomeColor = (outcome) => {
    if (outcome === "Học tiếp") return "success";
    if (outcome === "Cảnh cáo học vụ") return "warning";
    return "error";
  };

  const columns = [
    {
      title: "Mã môn",
      dataIndex: "course_code",
      key: "course_code",
      width: 100,
    },
    {
      title: "Tên môn học",
      dataIndex: "course_name",
      key: "course_name",
      ellipsis: true,
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center",
    },
    {
      title: "Điểm (Thang 10)",
      dataIndex: "grade_10",
      key: "grade_10",
      width: 120,
      align: "center",
      render: (grade) => {
        const gradeValue =
          typeof grade === "number" ? grade : parseFloat(grade);
        return (
          <Tag color={getGradeColor(gradeValue)} style={{ fontWeight: 600 }}>
            {!isNaN(gradeValue) ? gradeValue.toFixed(1) : "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "Điểm chữ",
      dataIndex: "grade_letter",
      key: "grade_letter",
      width: 100,
      align: "center",
      render: (letter) => (
        <span style={{ fontWeight: 600, fontSize: 16 }}>{letter || "-"}</span>
      ),
    },
    {
      title: "Điểm (Thang 4)",
      dataIndex: "grade_4",
      key: "grade_4",
      width: 120,
      align: "center",
      render: (grade) => {
        const gradeValue =
          typeof grade === "number" ? grade : parseFloat(grade);
        return (
          <span style={{ fontWeight: 500 }}>
            {!isNaN(gradeValue) ? gradeValue.toFixed(1) : "N/A"}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (status) =>
        status === "passed" ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đạt
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Chưa đạt
          </Tag>
        ),
    },
  ];

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              📊 Báo cáo học kỳ
            </h1>
            <Select
              style={{ width: 250 }}
              placeholder="Chọn học kỳ"
              value={selectedSemester}
              onChange={handleSemesterChange}
              options={semesters}
              size="large"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spin size="large" />
            </div>
          ) : reportData ? (
            <>
              {/* Thông tin sinh viên */}
              <Card
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  marginBottom: "12px",
                }}
              >
                <div className="mb-2">
                  <h3 className="text-lg font-semibold mb-2">
                    Thông tin sinh viên
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-600">Họ và tên:</span>
                      <span className="ml-2 font-semibold">
                        {reportData.student_info.full_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">MSSV:</span>
                      <span className="ml-2 font-semibold">
                        {reportData.student_info.user_code}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Lớp:</span>
                      <span className="ml-2 font-semibold">
                        {reportData.student_info.class_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Học kỳ:</span>
                      <span className="ml-2 font-semibold">
                        {reportData.semester_info.semester_name} -{" "}
                        {reportData.semester_info.academic_year}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Thống kê điểm */}
              <Row gutter={[12, 12]} style={{ marginBottom: "12px" }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "white" }}>GPA (Thang 4)</span>
                      }
                      value={reportData.report.gpa_4_scale}
                      precision={2}
                      valueStyle={{ color: "white", fontWeight: 700 }}
                      prefix={<TrophyOutlined />}
                      suffix={<span style={{ fontSize: 14 }}>/ 4.0</span>}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      background:
                        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "white" }}>CPA (Thang 4)</span>
                      }
                      value={reportData.report.cpa_4_scale}
                      precision={2}
                      valueStyle={{ color: "white", fontWeight: 700 }}
                      prefix={<TrophyOutlined />}
                      suffix={<span style={{ fontSize: 14 }}>/ 4.0</span>}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      background:
                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "white" }}>Điểm rèn luyện</span>
                      }
                      value={reportData.report.training_point_summary}
                      valueStyle={{ color: "white", fontWeight: 700 }}
                      prefix={<FireOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      background:
                        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: "white" }}>Điểm CTXH</span>}
                      value={reportData.report.social_point_summary}
                      valueStyle={{ color: "white", fontWeight: 700 }}
                      prefix={<HeartOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Thông tin tín chỉ và kết quả */}
              <Card
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  marginBottom: "12px",
                }}
              >
                <Row gutter={[16, 12]}>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Tín chỉ đăng ký"
                      value={reportData.report.credits_registered}
                      prefix={<BookOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Tín chỉ đạt"
                      value={reportData.report.credits_passed}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <div>
                      <div className="text-gray-500 text-sm mb-2">Kết quả</div>
                      <Tag
                        color={getOutcomeColor(reportData.report.outcome)}
                        style={{ fontSize: 16, padding: "8px 16px" }}
                      >
                        {reportData.report.outcome}
                      </Tag>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Bảng điểm các môn học */}
              <Card
                title={
                  <span className="text-lg font-semibold">
                    Điểm các môn học ({reportData.course_grades?.length || 0}{" "}
                    môn)
                  </span>
                }
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {reportData.course_grades &&
                reportData.course_grades.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={reportData.course_grades}
                    rowKey={(record) => record.course_code}
                    pagination={false}
                    scroll={{ x: 800 }}
                  />
                ) : (
                  <Empty description="Chưa có điểm môn học" />
                )}
              </Card>
            </>
          ) : (
            <Card
              style={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Empty description="Chưa có báo cáo học kỳ này" />
            </Card>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default MySemesterReport;
