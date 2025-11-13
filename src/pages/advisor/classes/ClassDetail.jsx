import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Spin,
  Empty,
  Descriptions,
  Row,
  Col,
  Statistic,
  Modal,
  Select,
  Collapse,
  Space,
  Divider,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  EyeOutlined,
  WarningOutlined,
  ReloadOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  getClassDetailAPI,
  getClassStudentsAPI,
  getSemestersAPI,
  getSemesterReportsAPI,
  getStudentGradesAPI,
  getCourseStudentsAPI,
  getStudentPointsAPI,
  getStudentSemesterReportAPI,
  getAtRiskStudentsAPI,
  createAcademicWarningsAPI,
  getClassStatisticsAPI,
  batchUpdateSemesterReportsAPI,
  getWarningsCreatedAPI,
} from "../../../services/api.service";

const { Option } = Select;

export const ClassDetail = () => {
  const navigate = useNavigate();
  const { classId } = useParams();

  // Basic state
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);

  // Semester state
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [semesterReports, setSemesterReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportStatistics, setReportStatistics] = useState(null);

  // Modal state
  const [studentGradeModalVisible, setStudentGradeModalVisible] =
    useState(false);
  const [selectedStudentGrades, setSelectedStudentGrades] = useState(null);
  const [loadingStudentGrades, setLoadingStudentGrades] = useState(false);

  const [courseStudentsModalVisible, setCourseStudentsModalVisible] =
    useState(false);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState(null);
  const [loadingCourseStudents, setLoadingCourseStudents] = useState(false);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);

  // Modal state for student points (training and social activities)
  const [studentPointsModalVisible, setStudentPointsModalVisible] =
    useState(false);
  const [selectedStudentPoints, setSelectedStudentPoints] = useState(null);
  const [loadingStudentPoints, setLoadingStudentPoints] = useState(false);

  // Academic Monitoring state
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loadingAtRisk, setLoadingAtRisk] = useState(false);
  const [academicStatistics, setAcademicStatistics] = useState(null);
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [selectedWarningStudents, setSelectedWarningStudents] = useState([]);
  const [loadingBatchUpdate, setLoadingBatchUpdate] = useState(false);
  const [loadingCreateWarnings, setLoadingCreateWarnings] = useState(false);

  // Warnings modal state
  const [warningsModalVisible, setWarningsModalVisible] = useState(false);
  const [warningsList, setWarningsList] = useState([]);
  const [loadingWarnings, setLoadingWarnings] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchClassStudents();
      fetchSemesters();
    }
  }, [classId]);

  useEffect(() => {
    if (selectedSemester) {
      fetchSemesterReports();
      fetchAtRiskStudents();
      fetchAcademicStatistics();
    }
  }, [selectedSemester]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await getClassDetailAPI(classId);

      if (response?.success) {
        setClassData(response.data?.class || response.data);
      }
    } catch (error) {
      console.error("Error fetching class detail:", error);
      toast.error("Không thể tải thông tin lớp");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async () => {
    try {
      const response = await getClassStudentsAPI(classId);
      console.log("Class students response:", response);

      if (response?.success) {
        const studentsData = response.data?.students || response.data || [];
        console.log("Students data:", studentsData);
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await getSemestersAPI();

      if (response?.success) {
        const semestersData = response.data || [];
        setSemesters(semestersData);
        if (semestersData.length > 0) {
          // Auto-select latest semester
          setSelectedSemester(semestersData[0].semester_id);
        }
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchSemesterReports = async () => {
    try {
      setLoadingReports(true);
      const response = await getSemesterReportsAPI(selectedSemester);
      console.log("Semester reports response:", response);

      if (response?.success) {
        const reportsData = response.data?.reports || [];
        setSemesterReports(reportsData);

        // Calculate statistics
        const stats = {
          total: reportsData.length,
          passed: reportsData.filter((r) => r.outcome === "Học tiếp").length,
          warned: reportsData.filter(
            (r) => r.outcome && r.outcome.includes("Cảnh cáo")
          ).length,
          noGrade: reportsData.filter((r) => r.outcome === "Chưa có điểm")
            .length,
        };
        setReportStatistics(stats);
      }
    } catch (error) {
      console.error("Error fetching semester reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleViewStudentGrades = async (student) => {
    if (!selectedSemester) {
      toast.warning("Vui lòng chọn học kỳ trước");
      return;
    }

    try {
      setLoadingStudentGrades(true);
      setStudentGradeModalVisible(true);
      setSelectedStudentGrades(null);

      console.log("Fetching grades for:", {
        student_id: student.student_id,
        semester_id: selectedSemester,
      });

      const response = await getStudentGradesAPI(
        student.student_id,
        selectedSemester
      );

      console.log("Student grades response:", response);

      if (response?.success) {
        setSelectedStudentGrades(response.data);
      } else {
        toast.error("Không có dữ liệu điểm");
      }
    } catch (error) {
      console.error("Error fetching student grades:", error);
      toast.error("Không thể tải điểm sinh viên");
    } finally {
      setLoadingStudentGrades(false);
    }
  };

  const handleViewCourseStudents = async (courseId, courseInfo) => {
    try {
      setLoadingCourseStudents(true);
      setCourseStudentsModalVisible(true);
      setSelectedCourseStudents(null);
      setSelectedCourseInfo(courseInfo);

      const response = await getCourseStudentsAPI(courseId);

      if (response?.success) {
        setSelectedCourseStudents(response.data);
      }
    } catch (error) {
      console.error("Error fetching course students:", error);
      toast.error("Không thể tải danh sách sinh viên môn học");
    } finally {
      setLoadingCourseStudents(false);
    }
  };

  // Handle view student points (training and social activities)
  const handleViewStudentPoints = async (studentId) => {
    if (!selectedSemester) {
      toast.warning("Vui lòng chọn học kỳ trước");
      return;
    }

    try {
      setLoadingStudentPoints(true);
      setStudentPointsModalVisible(true);

      const response = await getStudentPointsAPI(studentId, selectedSemester);
      console.log("Student points response:", response);

      if (response?.success) {
        setSelectedStudentPoints(response.data);
      }
    } catch (error) {
      console.error("Error fetching student points:", error);
      toast.error("Không thể tải thông tin điểm rèn luyện");
    } finally {
      setLoadingStudentPoints(false);
    }
  };

  // Fetch at-risk students
  const fetchAtRiskStudents = async () => {
    if (!selectedSemester) return;

    try {
      setLoadingAtRisk(true);
      const response = await getAtRiskStudentsAPI(selectedSemester);
      console.log("At-risk students response:", response);

      if (response?.success) {
        setAtRiskStudents(response.data.at_risk_students || []);
      }
    } catch (error) {
      console.error("Error fetching at-risk students:", error);
      toast.error("Không thể tải danh sách sinh viên nguy cơ");
    } finally {
      setLoadingAtRisk(false);
    }
  };

  // Fetch academic statistics
  const fetchAcademicStatistics = async () => {
    if (!selectedSemester) return;

    try {
      setLoadingStatistics(true);
      const response = await getClassStatisticsAPI(selectedSemester);
      console.log("Academic statistics response:", response);

      if (response?.success) {
        setAcademicStatistics(response.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Không thể tải thống kê học vụ");
    } finally {
      setLoadingStatistics(false);
    }
  };

  // Create academic warnings
  const handleCreateWarnings = async () => {
    if (selectedWarningStudents.length === 0) {
      toast.warning("Vui lòng chọn sinh viên cần tạo cảnh cáo");
      return;
    }

    try {
      setLoadingCreateWarnings(true);
      const response = await createAcademicWarningsAPI({
        semester_id: selectedSemester,
        student_ids: selectedWarningStudents,
      });

      if (response?.success) {
        const { total_created, errors } = response.data;

        // Hiển thị thông báo dựa trên kết quả
        if (total_created > 0) {
          toast.success(`Đã tạo ${total_created} cảnh cáo học vụ thành công`);
        }

        // Hiển thị các lỗi/cảnh báo (nếu có)
        if (errors && errors.length > 0) {
          if (total_created === 0) {
            // Nếu không tạo được cảnh cáo nào
            toast.warning("Không thể tạo cảnh cáo");
          }
          errors.forEach((err) => {
            toast.warning(err);
          });
        }

        setSelectedWarningStudents([]);
        fetchAtRiskStudents(); // Refresh list
      }
    } catch (error) {
      console.error("Error creating warnings:", error);
      toast.error("Không thể tạo cảnh cáo học vụ");
    } finally {
      setLoadingCreateWarnings(false);
    }
  };

  // Fetch warnings list
  const fetchWarnings = async () => {
    try {
      setLoadingWarnings(true);
      const response = await getWarningsCreatedAPI();
      console.log("Warnings response:", response);

      if (response?.success) {
        setWarningsList(response.data.warnings || []);
      }
    } catch (error) {
      console.error("Error fetching warnings:", error);
      toast.error("Không thể tải danh sách cảnh cáo");
    } finally {
      setLoadingWarnings(false);
    }
  };

  // Handle view warnings
  const handleViewWarnings = () => {
    setWarningsModalVisible(true);
    fetchWarnings();
  };

  // Batch update semester reports
  const handleBatchUpdate = async () => {
    if (!selectedSemester) {
      toast.warning("Vui lòng chọn học kỳ");
      return;
    }

    Modal.confirm({
      title: "Xác nhận cập nhật hàng loạt",
      content: "Bạn có chắc muốn cập nhật báo cáo học kỳ cho tất cả sinh viên?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoadingBatchUpdate(true);
          const response = await batchUpdateSemesterReportsAPI({
            class_id: classId,
            semester_id: selectedSemester,
          });

          if (response?.success) {
            const { summary } = response.data;
            toast.success(
              `Cập nhật thành công ${summary.success_count}/${summary.total_processed} sinh viên`
            );
            if (summary.error_count > 0) {
              toast.warning(`Có ${summary.error_count} sinh viên bị lỗi`);
            }
            fetchSemesterReports(); // Refresh reports
          }
        } catch (error) {
          console.error("Error batch updating:", error);
          toast.error("Không thể cập nhật báo cáo hàng loạt");
        } finally {
          setLoadingBatchUpdate(false);
        }
      },
    });
  };

  const getGradeColor = (grade) => {
    if (grade >= 8.5) return "text-green-600";
    if (grade >= 7.0) return "text-blue-600";
    if (grade >= 5.5) return "text-yellow-600";
    if (grade >= 4.0) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusTag = (status) => {
    const statusMap = {
      passed: { color: "success", text: "Đạt" },
      failed: { color: "error", text: "Không đạt" },
      studying: { color: "processing", text: "Đang học" },
    };
    const config = statusMap[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Student table columns
  const studentColumns = [
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
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      width: 130,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          active: { color: "success", text: "Đang học" },
          inactive: { color: "default", text: "Không hoạt động" },
          graduated: { color: "blue", text: "Đã tốt nghiệp" },
          suspended: { color: "error", text: "Đình chỉ" },
        };
        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewStudentGrades(record)}
            size="small"
            disabled={!selectedSemester}
            loading={loadingStudentGrades}
          >
            Xem điểm
          </Button>
          <Button
            type="link"
            icon={<TrophyOutlined />}
            onClick={() => handleViewStudentPoints(record.student_id)}
            size="small"
            disabled={!selectedSemester}
            loading={loadingStudentPoints}
          >
            Điểm RL & CTXH
          </Button>
        </Space>
      ),
    },
  ];

  // Student grades modal columns
  const studentGradeColumns = [
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
      width: 250,
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center",
    },
    {
      title: "Điểm (10)",
      dataIndex: "grade_10",
      key: "grade_10",
      width: 100,
      align: "center",
      render: (grade) => {
        const numGrade = grade ? Number(grade) : 0;
        return (
          <span className={`font-bold ${getGradeColor(numGrade)}`}>
            {numGrade.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Điểm chữ",
      dataIndex: "grade_letter",
      key: "grade_letter",
      width: 100,
      align: "center",
      render: (letter) => <Tag color="blue">{letter || "F"}</Tag>,
    },
    {
      title: "Điểm (4)",
      dataIndex: "grade_4",
      key: "grade_4",
      width: 90,
      align: "center",
      render: (grade) => {
        const numGrade = grade ? Number(grade) : 0;
        return <span className="font-semibold">{numGrade.toFixed(1)}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() =>
            handleViewCourseStudents(record.grade_id, {
              course_code: record.course_code,
              course_name: record.course_name,
            })
          }
          disabled
          loading={loadingCourseStudents}
        >
          Xem lớp
        </Button>
      ),
    },
  ];

  // Course students modal columns
  const courseStudentColumns = [
    {
      title: "MSSV",
      dataIndex: "user_code",
      key: "user_code",
      width: 110,
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      width: 180,
    },
    {
      title: "Lớp",
      dataIndex: "class_name",
      key: "class_name",
      width: 100,
    },
    {
      title: "Điểm (10)",
      dataIndex: "grade_value",
      key: "grade_value",
      width: 100,
      align: "center",
      render: (grade) => {
        const numGrade = grade ? Number(grade) : 0;
        return (
          <span className={`font-bold ${getGradeColor(numGrade)}`}>
            {numGrade.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Điểm chữ",
      dataIndex: "grade_letter",
      key: "grade_letter",
      width: 100,
      align: "center",
      render: (letter) => <Tag color="blue">{letter || "F"}</Tag>,
    },
    {
      title: "Điểm (4)",
      dataIndex: "grade_4_scale",
      key: "grade_4_scale",
      width: 90,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
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
              <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-2">
                <TeamOutlined />
                {classData?.class_name || "Lớp học"}
              </h1>
              <p className="text-gray-500 text-sm mt-1 mb-0">
                Quản lý thông tin lớp học và điểm sinh viên
              </p>
            </div>
          </div>
          {/* Semester Selector */}
          {semesters.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Học kỳ:</span>
              <Select
                value={selectedSemester}
                onChange={setSelectedSemester}
                style={{ width: 220 }}
                placeholder="Chọn học kỳ"
              >
                {semesters.map((sem) => (
                  <Option key={sem.semester_id} value={sem.semester_id}>
                    {sem.semester_name} - {sem.academic_year}
                  </Option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Đang tải thông tin lớp..." />
          </div>
        ) : (
          <>
            {/* Class Info Cards */}
            {classData && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: 12,
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "rgba(255,255,255,0.9)" }}>
                          Tổng sinh viên
                        </span>
                      }
                      value={students.length}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: "#fff", fontWeight: "bold" }}
                    />
                  </Card>
                </Col>

                {classData.description && (
                  <Col xs={24} sm={12} lg={18}>
                    <Card
                      style={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
                    >
                      <div className="text-sm text-gray-600">
                        <strong>Mô tả:</strong> {classData.description}
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>
            )}

            {/* Semester Reports and Statistics */}
            {selectedSemester && (
              <Card
                title={
                  <span className="flex items-center gap-2">
                    <FileTextOutlined />
                    Báo cáo học kỳ
                  </span>
                }
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {reportStatistics && (
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {reportStatistics.total}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Tổng sinh viên
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {reportStatistics.passed}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Học tiếp
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {reportStatistics.warned}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Cảnh cáo
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {reportStatistics.noGrade}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Nghĩ học
                        </div>
                      </Card>
                    </Col>
                  </Row>
                )}

                <Divider />

                <Spin spinning={loadingReports}>
                  <Table
                    columns={[
                      {
                        title: "MSSV",
                        dataIndex: ["student", "user_code"],
                        key: "user_code",
                        width: 110,
                      },
                      {
                        title: "Họ và tên",
                        dataIndex: ["student", "full_name"],
                        key: "full_name",
                        width: 180,
                      },
                      {
                        title: "GPA (10)",
                        dataIndex: "gpa",
                        key: "gpa",
                        width: 100,
                        align: "center",
                        render: (gpa) => {
                          const numGpa = gpa ? Number(gpa) : 0;
                          return (
                            <span
                              className={`font-bold ${getGradeColor(numGpa)}`}
                            >
                              {numGpa.toFixed(2)}
                            </span>
                          );
                        },
                      },
                      {
                        title: "GPA (4)",
                        dataIndex: "gpa_4_scale",
                        key: "gpa_4_scale",
                        width: 100,
                        align: "center",
                        render: (gpa) => {
                          const numGpa = gpa ? Number(gpa) : 0;
                          return (
                            <span className="font-semibold">
                              {numGpa.toFixed(2)}
                            </span>
                          );
                        },
                      },
                      {
                        title: "TC đăng ký",
                        dataIndex: "credits_registered",
                        key: "credits_registered",
                        width: 110,
                        align: "center",
                      },
                      {
                        title: "TC đạt",
                        dataIndex: "credits_passed",
                        key: "credits_passed",
                        width: 90,
                        align: "center",
                      },
                      {
                        title: "Kết quả",
                        dataIndex: "outcome",
                        key: "outcome",
                        width: 160,
                        render: (outcome) => {
                          if (!outcome) {
                            return <Tag color="default">Chưa đánh giá</Tag>;
                          }

                          // Check for specific outcomes
                          if (outcome === "Học tiếp") {
                            return <Tag color="success">Học tiếp</Tag>;
                          }
                          if (outcome === "Chưa có điểm") {
                            return <Tag color="default">Chưa có điểm</Tag>;
                          }
                          if (outcome.includes("Cảnh cáo")) {
                            return <Tag color="warning">{outcome}</Tag>;
                          }
                          if (outcome.includes("thôi học")) {
                            return <Tag color="error">{outcome}</Tag>;
                          }

                          // Default
                          return <Tag color="default">{outcome}</Tag>;
                        },
                      },
                      {
                        title: "Thao tác",
                        key: "action",
                        width: 120,
                        render: (_, record) => (
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() =>
                              handleViewStudentGrades(record.student)
                            }
                            size="small"
                            loading={loadingStudentGrades}
                          >
                            Xem điểm
                          </Button>
                        ),
                      },
                    ]}
                    dataSource={semesterReports}
                    rowKey={(record) =>
                      record.student?.student_id || record.student?.user_code
                    }
                    scroll={{ x: 1200 }}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `Tổng ${total} sinh viên`,
                      showSizeChanger: true,
                    }}
                    locale={{
                      emptyText: (
                        <Empty description="Chưa có báo cáo học kỳ này" />
                      ),
                    }}
                  />
                </Spin>
              </Card>
            )}

            {/* Students List */}
            <Card
              title={
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <UserOutlined />
                  Danh sách sinh viên ({students.length})
                </span>
              }
              style={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Table
                columns={studentColumns}
                dataSource={students}
                rowKey="student_id"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `Tổng ${total} sinh viên`,
                  showSizeChanger: true,
                }}
                locale={{
                  emptyText: (
                    <Empty description="Chưa có sinh viên nào trong lớp" />
                  ),
                }}
              />
            </Card>

            {/* Academic Statistics */}
            {selectedSemester && academicStatistics && (
              <Card
                title={
                  <Space>
                    <BarChartOutlined />
                    <span>Thống kê học vụ</span>
                    <Button
                      type="primary"
                      size="small"
                      icon={<ReloadOutlined />}
                      loading={loadingBatchUpdate}
                      onClick={handleBatchUpdate}
                    >
                      Cập nhật hàng loạt
                    </Button>
                  </Space>
                }
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="Giỏi"
                        value={academicStatistics.statistics?.excellent || 0}
                        valueStyle={{ color: "#52c41a" }}
                        suffix={`/ ${academicStatistics.total_students}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {academicStatistics.percentages?.excellent?.toFixed(1)}%
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="Khá"
                        value={academicStatistics.statistics?.good || 0}
                        valueStyle={{ color: "#1890ff" }}
                        suffix={`/ ${academicStatistics.total_students}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {academicStatistics.percentages?.good?.toFixed(1)}%
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="Trung bình"
                        value={academicStatistics.statistics?.average || 0}
                        valueStyle={{ color: "#faad14" }}
                        suffix={`/ ${academicStatistics.total_students}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {academicStatistics.percentages?.average?.toFixed(1)}%
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="Yếu"
                        value={academicStatistics.statistics?.weak || 0}
                        valueStyle={{ color: "#ff7a45" }}
                        suffix={`/ ${academicStatistics.total_students}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {academicStatistics.percentages?.weak?.toFixed(1)}%
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="Kém"
                        value={academicStatistics.statistics?.poor || 0}
                        valueStyle={{ color: "#f5222d" }}
                        suffix={`/ ${academicStatistics.total_students}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {academicStatistics.percentages?.poor?.toFixed(1)}%
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="Bị cảnh cáo"
                        value={academicStatistics.statistics?.warned || 0}
                        valueStyle={{ color: "#fa8c16" }}
                        suffix={`/ ${academicStatistics.total_students}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {academicStatistics.percentages?.warned?.toFixed(1)}%
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="Nguy cơ bỏ học"
                        value={academicStatistics.statistics?.dropout_risk || 0}
                        valueStyle={{ color: "#cf1322" }}
                        suffix={`/ ${academicStatistics.total_students}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {academicStatistics.percentages?.dropout_risk?.toFixed(
                          1
                        )}
                        %
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>
            )}

            {/* At-Risk Students */}
            {selectedSemester && atRiskStudents.length > 0 && (
              <Card
                title={
                  <Space>
                    <AlertOutlined />
                    <span>Sinh viên có nguy cơ ({atRiskStudents.length})</span>
                    <Button
                      type="default"
                      size="small"
                      icon={<FileTextOutlined />}
                      onClick={handleViewWarnings}
                      loading={loadingWarnings}
                    >
                      Xem danh sách cảnh cáo
                    </Button>
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<WarningOutlined />}
                      disabled={selectedWarningStudents.length === 0}
                      onClick={handleCreateWarnings}
                      loading={loadingCreateWarnings}
                    >
                      Tạo cảnh cáo ({selectedWarningStudents.length})
                    </Button>
                  </Space>
                }
                style={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <Spin spinning={loadingAtRisk}>
                  <Table
                    rowSelection={{
                      selectedRowKeys: selectedWarningStudents,
                      onChange: (selectedKeys) => {
                        setSelectedWarningStudents(selectedKeys);
                      },
                    }}
                    columns={[
                      {
                        title: "MSSV",
                        dataIndex: "user_code",
                        key: "user_code",
                        width: 100,
                      },
                      {
                        title: "Họ tên",
                        dataIndex: "full_name",
                        key: "full_name",
                        width: 180,
                      },
                      {
                        title: "CPA (4.0)",
                        dataIndex: "cpa_4_scale",
                        key: "cpa_4_scale",
                        width: 100,
                        align: "center",
                        render: (cpa) => {
                          const numCpa = cpa ? Number(cpa) : 0;
                          const color =
                            numCpa >= 3.6
                              ? "green"
                              : numCpa >= 3.0
                              ? "blue"
                              : numCpa >= 2.0
                              ? "orange"
                              : "red";
                          return <Tag color={color}>{numCpa.toFixed(2)}</Tag>;
                        },
                      },
                      {
                        title: "Ngưỡng",
                        dataIndex: "warning_threshold",
                        key: "warning_threshold",
                        width: 90,
                        align: "center",
                        render: (threshold) => {
                          const numThreshold = threshold
                            ? Number(threshold)
                            : 0;
                          return numThreshold.toFixed(2);
                        },
                      },
                      {
                        title: "Mức độ",
                        dataIndex: "risk_level",
                        key: "risk_level",
                        width: 110,
                        render: (level) => {
                          const config = {
                            critical: { color: "red", text: "Rất cao" },
                            high: { color: "orange", text: "Cao" },
                            medium: { color: "gold", text: "Trung bình" },
                            low: { color: "blue", text: "Thấp" },
                          };
                          const c = config[level] || {
                            color: "default",
                            text: level,
                          };
                          return <Tag color={c.color}>{c.text}</Tag>;
                        },
                      },
                      {
                        title: "Môn rớt",
                        dataIndex: "failed_courses_count",
                        key: "failed_courses_count",
                        width: 90,
                        align: "center",
                        render: (count) => (
                          <Tag color={count > 0 ? "red" : "default"}>
                            {count}
                          </Tag>
                        ),
                      },
                      {
                        title: "Lý do nguy cơ",
                        dataIndex: "risk_reasons",
                        key: "risk_reasons",
                        render: (reasons) => (
                          <ul className="list-disc list-inside text-xs">
                            {reasons?.slice(0, 2).map((reason, idx) => (
                              <li key={idx} className="text-red-600">
                                {reason}
                              </li>
                            ))}
                          </ul>
                        ),
                      },
                    ]}
                    dataSource={atRiskStudents}
                    rowKey="student_id"
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `Tổng ${total} sinh viên`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty description="Không có sinh viên nguy cơ" />
                      ),
                    }}
                  />
                </Spin>
              </Card>
            )}
          </>
        )}

        {/* Student Grades Detail Modal */}
        <Modal
          title={
            <Space>
              <BookOutlined />
              <span>Chi tiết điểm sinh viên</span>
            </Space>
          }
          open={studentGradeModalVisible}
          onCancel={() => {
            setStudentGradeModalVisible(false);
            setSelectedStudentGrades(null);
          }}
          footer={null}
          width={1000}
        >
          {loadingStudentGrades ? (
            <div className="text-center py-8">
              <Spin tip="Đang tải điểm..." />
            </div>
          ) : selectedStudentGrades ? (
            <div className="space-y-4">
              {/* Student Info */}
              <Card size="small" title="Thông tin sinh viên">
                <Descriptions column={2}>
                  <Descriptions.Item label="MSSV">
                    {selectedStudentGrades.student_info?.user_code}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ tên">
                    {selectedStudentGrades.student_info?.full_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lớp">
                    {selectedStudentGrades.student_info?.class_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedStudentGrades.student_info?.email}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Summary */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedStudentGrades.summary?.total_courses || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Tổng môn học
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedStudentGrades.summary?.passed_courses || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Môn đã đạt</div>
                  </Card>
                </Col>
              </Row>

              {/* Grades Table */}
              <Card size="small" title="Danh sách điểm">
                <Table
                  columns={studentGradeColumns}
                  dataSource={selectedStudentGrades.grades || []}
                  rowKey={(record, index) => index}
                  pagination={false}
                  scroll={{ y: 400 }}
                  locale={{
                    emptyText: <Empty description="Chưa có điểm" />,
                  }}
                />
              </Card>
            </div>
          ) : null}
        </Modal>

        {/* Course Students Modal */}
        <Modal
          title={
            <Space>
              <TeamOutlined />
              <span>Danh sách sinh viên môn học</span>
              {selectedCourseInfo && (
                <Tag color="blue">
                  {selectedCourseInfo.course_code} -{" "}
                  {selectedCourseInfo.course_name}
                </Tag>
              )}
            </Space>
          }
          open={courseStudentsModalVisible}
          onCancel={() => {
            setCourseStudentsModalVisible(false);
            setSelectedCourseStudents(null);
            setSelectedCourseInfo(null);
          }}
          footer={null}
          width={1000}
        >
          {loadingCourseStudents ? (
            <div className="text-center py-8">
              <Spin tip="Đang tải danh sách..." />
            </div>
          ) : selectedCourseStudents ? (
            <div className="space-y-4">
              {/* Statistics */}
              {selectedCourseStudents.statistics && (
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCourseStudents.statistics.total_students}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Tổng SV</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCourseStudents.statistics.passed_students}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Đạt</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedCourseStudents.statistics.failed_students}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Không đạt
                      </div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedCourseStudents.statistics.pass_rate?.toFixed(
                          1
                        )}
                        %
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Tỷ lệ đạt
                      </div>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Students Table */}
              <Table
                columns={courseStudentColumns}
                dataSource={selectedCourseStudents.students || []}
                rowKey={(record) => record.student_id || record.user_code}
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `Tổng ${total} sinh viên`,
                }}
                scroll={{ y: 400 }}
                locale={{
                  emptyText: <Empty description="Chưa có sinh viên đăng ký" />,
                }}
              />
            </div>
          ) : null}
        </Modal>

        {/* Student Points (Training & Social Activities) Modal */}
        <Modal
          title={
            <Space>
              <TrophyOutlined />
              <span>Điểm rèn luyện & Công tác xã hội</span>
            </Space>
          }
          open={studentPointsModalVisible}
          onCancel={() => {
            setStudentPointsModalVisible(false);
            setSelectedStudentPoints(null);
          }}
          footer={null}
          width={1200}
        >
          {loadingStudentPoints ? (
            <div className="text-center py-8">
              <Spin tip="Đang tải thông tin..." />
            </div>
          ) : selectedStudentPoints ? (
            <div className="space-y-4">
              {/* Student Info */}
              <Card size="small" title="Thông tin sinh viên">
                <Descriptions column={3}>
                  <Descriptions.Item label="MSSV">
                    {selectedStudentPoints.student_info?.user_code}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ tên">
                    {selectedStudentPoints.student_info?.full_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Học kỳ">
                    {selectedStudentPoints.filter_info?.semester_name} -{" "}
                    {selectedStudentPoints.filter_info?.academic_year}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Summary Statistics */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title="Tổng điểm rèn luyện"
                      value={
                        selectedStudentPoints.summary?.total_training_points ||
                        0
                      }
                      valueStyle={{ color: "#3f8600" }}
                      prefix={<TrophyOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title="Tổng điểm CTXH"
                      value={
                        selectedStudentPoints.summary?.total_social_points || 0
                      }
                      valueStyle={{ color: "#1890ff" }}
                      prefix={<TrophyOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Training Activities */}
              <Card
                size="small"
                title={
                  <Space>
                    <TrophyOutlined />
                    <span>Hoạt động rèn luyện</span>
                    <Tag color="green">
                      {selectedStudentPoints.training_activities?.length || 0}{" "}
                      hoạt động
                    </Tag>
                  </Space>
                }
              >
                <Table
                  columns={[
                    {
                      title: "Tên hoạt động",
                      dataIndex: "activity_title",
                      key: "activity_title",
                      width: 250,
                    },
                    {
                      title: "Vai trò",
                      dataIndex: "role_name",
                      key: "role_name",
                      width: 150,
                      render: (role) => <Tag color="blue">{role}</Tag>,
                    },
                    {
                      title: "Điểm",
                      dataIndex: "points_awarded",
                      key: "points_awarded",
                      width: 80,
                      align: "center",
                      render: (points) => (
                        <Tag color="green" className="font-semibold">
                          {points}
                        </Tag>
                      ),
                    },
                    {
                      title: "Ngày diễn ra",
                      dataIndex: "activity_date",
                      key: "activity_date",
                      width: 120,
                      align: "center",
                    },
                    {
                      title: "Địa điểm",
                      dataIndex: "location",
                      key: "location",
                      width: 150,
                    },
                    {
                      title: "Thời gian đăng ký",
                      dataIndex: "registration_time",
                      key: "registration_time",
                      width: 150,
                      align: "center",
                    },
                  ]}
                  dataSource={selectedStudentPoints.training_activities || []}
                  rowKey={(record) => record.activity_id}
                  pagination={false}
                  scroll={{ y: 250 }}
                  locale={{
                    emptyText: (
                      <Empty description="Chưa có hoạt động rèn luyện" />
                    ),
                  }}
                />
              </Card>

              {/* Social Activities */}
              <Card
                size="small"
                title={
                  <Space>
                    <TrophyOutlined />
                    <span>Hoạt động công tác xã hội</span>
                    <Tag color="blue">
                      {selectedStudentPoints.social_activities?.length || 0}{" "}
                      hoạt động
                    </Tag>
                  </Space>
                }
              >
                <Table
                  columns={[
                    {
                      title: "Tên hoạt động",
                      dataIndex: "activity_title",
                      key: "activity_title",
                      width: 250,
                    },
                    {
                      title: "Vai trò",
                      dataIndex: "role_name",
                      key: "role_name",
                      width: 150,
                      render: (role) => <Tag color="purple">{role}</Tag>,
                    },
                    {
                      title: "Điểm",
                      dataIndex: "points_awarded",
                      key: "points_awarded",
                      width: 80,
                      align: "center",
                      render: (points) => (
                        <Tag color="blue" className="font-semibold">
                          {points}
                        </Tag>
                      ),
                    },
                    {
                      title: "Ngày diễn ra",
                      dataIndex: "activity_date",
                      key: "activity_date",
                      width: 120,
                      align: "center",
                    },
                    {
                      title: "Địa điểm",
                      dataIndex: "location",
                      key: "location",
                      width: 150,
                    },
                    {
                      title: "Thời gian đăng ký",
                      dataIndex: "registration_time",
                      key: "registration_time",
                      width: 150,
                      align: "center",
                    },
                  ]}
                  dataSource={selectedStudentPoints.social_activities || []}
                  rowKey={(record) => record.activity_id}
                  pagination={false}
                  scroll={{ y: 250 }}
                  locale={{
                    emptyText: <Empty description="Chưa có hoạt động CTXH" />,
                  }}
                />
              </Card>
            </div>
          ) : null}
        </Modal>

        {/* Academic Warnings Modal */}
        <Modal
          title={
            <Space>
              <WarningOutlined />
              <span>Danh sách cảnh cáo học vụ đã tạo</span>
            </Space>
          }
          open={warningsModalVisible}
          onCancel={() => {
            setWarningsModalVisible(false);
            setWarningsList([]);
          }}
          footer={null}
          width={1200}
        >
          <Spin spinning={loadingWarnings}>
            {warningsList.length > 0 ? (
              <Table
                columns={[
                  {
                    title: "STT",
                    key: "index",
                    width: 60,
                    align: "center",
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: "Tiêu đề",
                    dataIndex: "title",
                    key: "title",
                    width: 300,
                    render: (title) => (
                      <span className="font-medium">{title}</span>
                    ),
                  },
                  {
                    title: "MSSV",
                    dataIndex: "user_code",
                    key: "user_code",
                    width: 100,
                  },
                  {
                    title: "Họ tên",
                    dataIndex: "student_name",
                    key: "student_name",
                    width: 180,
                  },
                  {
                    title: "Lớp",
                    dataIndex: "class_name",
                    key: "class_name",
                    width: 100,
                  },
                  {
                    title: "Học kỳ",
                    dataIndex: "semester",
                    key: "semester",
                    width: 150,
                  },
                  {
                    title: "Ngày tạo",
                    dataIndex: "created_at",
                    key: "created_at",
                    width: 150,
                    align: "center",
                  },
                  {
                    title: "Thao tác",
                    key: "action",
                    width: 120,
                    align: "center",
                    render: (_, record) => (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          Modal.info({
                            title: record.title,
                            width: 800,
                            content: (
                              <div className="space-y-4 mt-4">
                                <div>
                                  <div className="font-semibold mb-2">
                                    Thông tin sinh viên:
                                  </div>
                                  <div className="pl-4">
                                    <p>MSSV: {record.user_code}</p>
                                    <p>Họ tên: {record.student_name}</p>
                                    <p>Lớp: {record.class_name}</p>
                                  </div>
                                </div>
                                <Divider />
                                <div>
                                  <div className="font-semibold mb-2">
                                    Nội dung cảnh cáo:
                                  </div>
                                  <div className="pl-4 whitespace-pre-wrap">
                                    {record.content || "Không có nội dung"}
                                  </div>
                                </div>
                                <Divider />
                                <div>
                                  <div className="font-semibold mb-2">
                                    Lời khuyên:
                                  </div>
                                  <div className="pl-4 whitespace-pre-wrap">
                                    {record.advice || "Không có lời khuyên"}
                                  </div>
                                </div>
                              </div>
                            ),
                          });
                        }}
                      >
                        Chi tiết
                      </Button>
                    ),
                  },
                ]}
                dataSource={warningsList}
                rowKey="warning_id"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `Tổng ${total} cảnh cáo`,
                }}
                scroll={{ y: 400 }}
              />
            ) : (
              <Empty description="Chưa có cảnh cáo học vụ nào được tạo" />
            )}
          </Spin>
        </Modal>
      </div>
    </AdvisorLayout>
  );
};
