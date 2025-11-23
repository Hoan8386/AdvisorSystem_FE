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
  Tabs,
  // --- THÊM CÁC COMPONENT NÀY ĐỂ HIỂN THỊ LỊCH ĐẸP HƠN ---
  Avatar,
  List,
  Badge,
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
  CalendarOutlined,
  // --- THÊM ICON CHO LỊCH ---
  ClockCircleOutlined,
  EnvironmentOutlined,
  TagsOutlined,
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
  batchUpdateSemesterReportsAPI,
  getAtRiskStudentsAPI,
  updateStudentPositionAPI,
  getStudentScheduleApi,
} from "../../../services/api.service";

const { Option } = Select;

const DAYS_OF_WEEK = [
  { value: 2, label: "Thứ 2" },
  { value: 3, label: "Thứ 3" },
  { value: 4, label: "Thứ 4" },
  { value: 5, label: "Thứ 5" },
  { value: 6, label: "Thứ 6" },
  { value: 7, label: "Thứ 7" },
  { value: 8, label: "Chủ nhật" },
];

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

  // Modal state for student schedule
  const [studentScheduleModalVisible, setStudentScheduleModalVisible] =
    useState(false);
  const [selectedStudentSchedule, setSelectedStudentSchedule] = useState(null);
  const [loadingStudentSchedule, setLoadingStudentSchedule] = useState(false);

  // Academic Monitoring state
  const [academicStatistics, setAcademicStatistics] = useState(null);
  const [loadingBatchUpdate, setLoadingBatchUpdate] = useState(false);

  // At-risk students state
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loadingAtRisk, setLoadingAtRisk] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("students");

  // Update position modal state
  const [positionModalVisible, setPositionModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [loadingPosition, setLoadingPosition] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchClassStudents();
      fetchSemesters();
    }
  }, [classId]);

  useEffect(() => {
    if (selectedSemester) {
      fetchSemesterReports(); // Đã bao gồm statistics
      // fetchAcademicStatistics(); // Không cần nữa, đã lấy từ fetchSemesterReports
      fetchAtRiskStudents();
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
        // API trả về class_statistics là mảng các lớp
        const classStatistics = response.data?.class_statistics || [];

        // Tìm thống kê của lớp hiện tại (so sánh với type conversion)
        const currentClassStats = classStatistics.find(
          (stat) =>
            stat.class_id == classId || stat.class_id === parseInt(classId)
        );

        // Lấy danh sách reports của lớp hiện tại
        const reportsData = currentClassStats?.reports || [];
        setSemesterReports(reportsData);

        // Lấy luôn thống kê học vụ từ gpa_statistics
        if (currentClassStats) {
          const statsData = {
            total_students: currentClassStats.total_students,
            average_gpa: currentClassStats.average_gpa || 0,
            statistics: {
              excellent: currentClassStats.gpa_statistics?.excellent || 0,
              good: currentClassStats.gpa_statistics?.good || 0,
              average: currentClassStats.gpa_statistics?.average || 0,
              weak: currentClassStats.gpa_statistics?.weak || 0,
              poor: currentClassStats.gpa_statistics?.fair || 0,
            },
            percentages: {
              excellent:
                ((currentClassStats.gpa_statistics?.excellent || 0) /
                  currentClassStats.total_students) *
                100,
              good:
                ((currentClassStats.gpa_statistics?.good || 0) /
                  currentClassStats.total_students) *
                100,
              average:
                ((currentClassStats.gpa_statistics?.average || 0) /
                  currentClassStats.total_students) *
                100,
              weak:
                ((currentClassStats.gpa_statistics?.weak || 0) /
                  currentClassStats.total_students) *
                100,
              poor:
                ((currentClassStats.gpa_statistics?.fair || 0) /
                  currentClassStats.total_students) *
                100,
            },
          };
          setAcademicStatistics(statsData);
        }

        console.log("Class ID:", classId, "Type:", typeof classId);
        console.log("Found class stats:", currentClassStats);
        console.log("Current class reports:", reportsData);
      }
    } catch (error) {
      console.error("Error fetching semester reports:", error);
      toast.error("Không thể tải báo cáo học kỳ");
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

  // Handle view student schedule
  const handleViewStudentSchedule = async (studentId) => {
    if (!selectedSemester) {
      toast.warning("Vui lòng chọn học kỳ trước");
      return;
    }

    try {
      setLoadingStudentSchedule(true);
      setStudentScheduleModalVisible(true);

      const response = await getStudentScheduleApi(studentId, selectedSemester);

      if (response?.success && response.data) {
        setSelectedStudentSchedule(response.data);
      } else {
        toast.error("Không có lịch học");
      }
    } catch (error) {
      console.error("Error fetching student schedule:", error);
      toast.error("Không thể tải lịch học sinh viên");
    } finally {
      setLoadingStudentSchedule(false);
    }
  };

  // Fetch at-risk students
  const fetchAtRiskStudents = async () => {
    if (!selectedSemester || !classData) return;

    try {
      setLoadingAtRisk(true);
      const response = await getAtRiskStudentsAPI(selectedSemester);
      console.log("At-risk students response:", response);

      if (response?.success) {
        const allStudents = response.data?.at_risk_students || [];
        // Filter by class_name (API không trả về class_id)
        const classStudents = allStudents.filter(
          (student) => student.class_name === classData.class_name
        );
        console.log("Class name:", classData.class_name);
        console.log("Filtered at-risk students:", classStudents);
        setAtRiskStudents(classStudents);
      }
    } catch (error) {
      console.error("Error fetching at-risk students:", error);
      toast.error("Không thể tải danh sách sinh viên có nguy cơ");
    } finally {
      setLoadingAtRisk(false);
    }
  };

  // Handle update position
  const handleOpenPositionModal = (student) => {
    setSelectedStudent(student);
    setSelectedPosition(student.position);
    setPositionModalVisible(true);
  };

  const handleClosePositionModal = () => {
    setPositionModalVisible(false);
    setSelectedStudent(null);
    setSelectedPosition(null);
  };

  const handleSavePosition = async () => {
    if (!selectedStudent || !selectedPosition) {
      toast.error("Vui lòng chọn vị trí");
      return;
    }

    try {
      setLoadingPosition(true);
      await updateStudentPositionAPI(
        selectedStudent.student_id,
        selectedPosition
      );
      toast.success("Cập nhật vị trí thành công");
      handleClosePositionModal();
      // Refresh students list
      fetchClassStudents();
    } catch (error) {
      console.error("Error updating position:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật vị trí";
      toast.error(errorMessage);
    } finally {
      setLoadingPosition(false);
    }
  };

  // Batch update semester reports
  const handleBatchUpdate = async () => {
    if (!selectedSemester) {
      toast.warning("Vui lòng chọn học kỳ");
      return;
    }

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

  // --- CẬP NHẬT HÀM RENDER ĐỂ HIỂN THỊ ĐẸP HƠN DỰA TRÊN JSON ---
  const renderStudentScheduleContent = () => {
    if (!selectedStudentSchedule) {
      return <Empty description="Không có dữ liệu" />;
    }

    const { student, semester, schedule } = selectedStudentSchedule;

    const getScheduleTypeColor = (type) => {
      const t = type?.toUpperCase();
      if (t === "LT" || t?.includes("LÝ THUYẾT")) return "blue";
      if (t === "TH" || t?.includes("THỰC HÀNH")) return "orange";
      return "cyan";
    };

    return (
      <div className="space-y-6">
        {/* 1. Header Information */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 m-0">
                {student.full_name}{" "}
                <span className="text-gray-400 font-normal">
                  ({student.user_code})
                </span>
              </h3>
              <div className="text-blue-600 font-medium mb-1">
                {student.class_name}
              </div>

              <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Khoa">
                  {student.faculty_name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {student.email}
                </Descriptions.Item>
                <Descriptions.Item label="Học kỳ">
                  <Tag color="geekblue">
                    {semester.semester_name} ({semester.academic_year})
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color="success">Đang học</Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </div>

        {/* 2. Stats & Last Updated */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Tổng quan:</span>
            <Tag icon={<BookOutlined />} color="blue">
              {schedule.total_courses || 0} Môn học
            </Tag>
            {schedule.total_credits && (
              <Tag icon={<TagsOutlined />} color="purple">
                {schedule.total_credits} Tín chỉ
              </Tag>
            )}
          </div>
          {schedule.updated_at && (
            <div className="text-xs text-gray-500 italic flex items-center gap-1">
              <ClockCircleOutlined /> Cập nhật:{" "}
              {new Date(schedule.updated_at).toLocaleString("vi-VN")}
            </div>
          )}
        </div>

        {/* 3. Detailed Schedule List */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          {schedule.registered_courses &&
          schedule.registered_courses.length > 0 ? (
            schedule.registered_courses.map((course, courseIdx) => (
              <Card
                key={courseIdx}
                size="small"
                className="shadow-sm border-gray-200 hover:border-blue-300 transition-colors"
                headStyle={{
                  backgroundColor: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                }}
                title={
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-xs min-w-[50px] text-center">
                        {course.course_code}
                      </div>
                      <span
                        className="font-bold text-gray-800 text-base"
                        title={course.course_name}
                      >
                        {course.course_name}
                      </span>
                    </div>
                    {/* Hiển thị badge tín chỉ nếu có */}
                    {course.credits && (
                      <Badge
                        count={`${course.credits} TC`}
                        style={{ backgroundColor: "#52c41a" }}
                      />
                    )}
                  </div>
                }
              >
                {course.schedules && course.schedules.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={course.schedules}
                    split={false}
                    renderItem={(sch, idx) => (
                      <div
                        className={`mb-3 last:mb-0 rounded-lg p-3 border ${
                          sch.type === "TH"
                            ? "bg-orange-50 border-orange-100"
                            : "bg-blue-50 border-blue-100"
                        }`}
                      >
                        {/* Day and Type Header */}
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 border-dashed">
                          <div className="flex items-center gap-2">
                            <Tag
                              color={getScheduleTypeColor(sch.type)}
                              className="mr-0 font-bold px-3"
                            >
                              {sch.type}
                            </Tag>
                            <span className="text-sm text-gray-500 font-medium">
                              ({sch.phase})
                            </span>
                          </div>

                          <span className="font-bold text-gray-800 text-base">
                            {DAYS_OF_WEEK.find(
                              (d) => d.value === sch.day_of_week
                            )?.label || `Thứ ${sch.day_of_week}`}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          {/* Time */}
                          <div className="flex items-start gap-2">
                            <ClockCircleOutlined className="text-blue-500 mt-1" />
                            <div>
                              <div className="font-bold text-gray-800 text-lg leading-tight">
                                {sch.start_time.slice(0, 5)} -{" "}
                                {sch.end_time.slice(0, 5)}
                              </div>
                              <div className="text-gray-500 text-xs mt-1">
                                Tiết {sch.start_period} - {sch.end_period}
                              </div>
                            </div>
                          </div>

                          {/* Room */}
                          <div className="flex items-start gap-2">
                            <EnvironmentOutlined className="text-red-500 mt-1" />
                            <div>
                              <div className="font-bold text-gray-800 text-lg leading-tight">
                                {sch.room}
                              </div>
                              {sch.note && (
                                <div className="text-gray-500 text-xs italic mt-1">
                                  {sch.note}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Date Range */}
                          <div className="flex items-start gap-2">
                            <CalendarOutlined className="text-green-600 mt-1" />
                            <div className="text-gray-700">
                              {new Date(sch.start_date).toLocaleDateString(
                                "vi-VN",
                                { day: "2-digit", month: "2-digit" }
                              )}
                              {" - "}
                              {new Date(sch.end_date).toLocaleDateString(
                                "vi-VN",
                                { day: "2-digit", month: "2-digit" }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có lịch chi tiết"
                  />
                )}
              </Card>
            ))
          ) : (
            <Empty description="Sinh viên chưa đăng ký môn học nào trong học kỳ này" />
          )}
        </div>
      </div>
    );
  };
  // -----------------------------------------------------------------------

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
      width: 250,
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      width: 130,
      align: "center",
      render: (position) => {
        if (!position) return "-";
        const positionConfig = {
          leader: { color: "red", text: "Lớp trưởng" },
          vice_leader: { color: "orange", text: "Lớp phó" },
          member: { color: "default", text: "Thành viên" },
        };
        const config = positionConfig[position] || {
          color: "default",
          text: position,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center",
      render: (status) => {
        const statusConfig = {
          studying: { color: "success", text: "Đang học" },
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
      title: "Số lần cảnh báo",
      dataIndex: "warnings_count",
      key: "warnings_count",
      width: 200,
      align: "center",
      render: (count) => {
        if (!count || count === 0) {
          return <Tag color="success">0</Tag>;
        }
        return (
          <Tag color={count >= 3 ? "red" : count >= 2 ? "orange" : "gold"}>
            {count} lần
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            title="Chỉnh vị trí"
            onClick={() => handleOpenPositionModal(record)}
          >
            ⚙️
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            title="Xem điểm"
            onClick={() => handleViewStudentGrades(record)}
            disabled={!selectedSemester}
          />
          <Button
            type="link"
            size="small"
            icon={<TrophyOutlined />}
            title="Điểm rèn luyện"
            onClick={() => handleViewStudentPoints(record.student_id)}
            disabled={!selectedSemester}
          />
          <Button
            type="link"
            size="small"
            icon={<CalendarOutlined />}
            title="Xem lịch học"
            onClick={() => handleViewStudentSchedule(record.student_id)}
            disabled={!selectedSemester}
          />
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

            {/* Tabs for Students List and Semester Reports */}
            <Card
              style={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: "students",
                    label: (
                      <span className="flex items-center gap-2">
                        <UserOutlined />
                        Danh sách lớp ({students.length})
                      </span>
                    ),
                    children: (
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
                    ),
                  },
                  {
                    key: "reports",
                    label: (
                      <span className="flex items-center gap-2">
                        <FileTextOutlined />
                        Báo cáo học kỳ
                      </span>
                    ),
                    children: selectedSemester ? (
                      <div className="space-y-6">
                        {/* Academic Statistics */}
                        {academicStatistics && (
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
                            size="small"
                          >
                            <Row gutter={[16, 16]}>
                              <Col xs={12} sm={8} md={6}>
                                <Card size="small" className="text-center">
                                  <Statistic
                                    title="GPA Trung bình"
                                    value={
                                      academicStatistics.average_gpa?.toFixed(
                                        2
                                      ) || "0.00"
                                    }
                                    valueStyle={{ color: "#1890ff" }}
                                  />
                                </Card>
                              </Col>
                              <Col xs={12} sm={8} md={6}>
                                <Card size="small" className="text-center">
                                  <Statistic
                                    title="Xuất xắc"
                                    value={
                                      academicStatistics.statistics
                                        ?.excellent || 0
                                    }
                                    valueStyle={{ color: "#52c41a" }}
                                    suffix={`/ ${academicStatistics.total_students}`}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">
                                    {academicStatistics.percentages?.excellent?.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                </Card>
                              </Col>
                              <Col xs={12} sm={8} md={6}>
                                <Card size="small" className="text-center">
                                  <Statistic
                                    title="Khá"
                                    value={
                                      academicStatistics.statistics?.poor || 0
                                    }
                                    valueStyle={{ color: "#1890ff" }}
                                    suffix={`/ ${academicStatistics.total_students}`}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">
                                    {academicStatistics.percentages?.poor?.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                </Card>
                              </Col>
                              <Col xs={12} sm={8} md={6}>
                                <Card size="small" className="text-center">
                                  <Statistic
                                    title="Trung bình"
                                    value={
                                      academicStatistics.statistics?.average ||
                                      0
                                    }
                                    valueStyle={{ color: "#faad14" }}
                                    suffix={`/ ${academicStatistics.total_students}`}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">
                                    {academicStatistics.percentages?.average?.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                </Card>
                              </Col>
                              <Col xs={12} sm={8} md={6}>
                                <Card size="small" className="text-center">
                                  <Statistic
                                    title="Yếu"
                                    value={
                                      academicStatistics.statistics?.weak || 0
                                    }
                                    valueStyle={{ color: "red" }}
                                    suffix={`/ ${academicStatistics.total_students}`}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">
                                    {academicStatistics.percentages?.weak?.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                </Card>
                              </Col>
                            </Row>
                          </Card>
                        )}

                        {/* Semester Reports Table */}
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
                                      className={`font-bold ${getGradeColor(
                                        numGpa
                                      )}`}
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
                                    return (
                                      <Tag color="default">Chưa đánh giá</Tag>
                                    );
                                  }

                                  // Check for specific outcomes
                                  if (outcome === "Học tiếp") {
                                    return <Tag color="success">Học tiếp</Tag>;
                                  }
                                  if (outcome === "Chưa có điểm") {
                                    return (
                                      <Tag color="default">Chưa có điểm</Tag>
                                    );
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
                              record.student?.student_id ||
                              record.student?.user_code
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
                      </div>
                    ) : (
                      <Empty description="Vui lòng chọn học kỳ để xem báo cáo" />
                    ),
                  },
                  {
                    key: "at-risk",
                    label: (
                      <span className="flex items-center gap-2">
                        <AlertOutlined />
                        Sinh viên có nguy cơ ({atRiskStudents.length})
                      </span>
                    ),
                    children: selectedSemester ? (
                      <Spin spinning={loadingAtRisk}>
                        <Table
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
                              title: "Lớp",
                              dataIndex: "class_name",
                              key: "class_name",
                              width: 120,
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
                                return (
                                  <Tag color={color}>{numCpa.toFixed(2)}</Tag>
                                );
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
                              <Empty description="Không có sinh viên nguy cơ trong lớp này" />
                            ),
                          }}
                        />
                      </Spin>
                    ) : (
                      <Empty description="Vui lòng chọn học kỳ để xem danh sách sinh viên có nguy cơ" />
                    ),
                  },
                ]}
              />
            </Card>
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
                      title="Tổng điểm CTXH"
                      value={
                        selectedStudentPoints.summary?.total_social_points +
                          "/180 " || 0
                      }
                      valueStyle={{ color: "#1890ff" }}
                      prefix={<TrophyOutlined />}
                    />
                  </Card>
                </Col>
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

        {/* --- CẬP NHẬT MODAL LỊCH HỌC VỚI GIAO DIỆN MỚI --- */}
        <Modal
          title={null}
          open={studentScheduleModalVisible}
          onCancel={() => {
            setStudentScheduleModalVisible(false);
            setSelectedStudentSchedule(null);
          }}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => {
                setStudentScheduleModalVisible(false);
                setSelectedStudentSchedule(null);
              }}
            >
              Đóng
            </Button>,
          ]}
          width={1000}
          centered
          bodyStyle={{ padding: "20px 24px" }}
        >
          {/* Custom Header */}
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <CalendarOutlined className="text-blue-600 text-xl" />
            <span className="text-xl font-bold text-gray-800">
              Lịch học sinh viên
            </span>
          </div>

          {loadingStudentSchedule ? (
            <div className="text-center py-12">
              <Spin size="large" tip="Đang tải dữ liệu lịch học..." />
            </div>
          ) : (
            renderStudentScheduleContent()
          )}
        </Modal>

        {/* Update Position Modal */}
        <Modal
          title="Cập nhật vị trí"
          open={positionModalVisible}
          onCancel={handleClosePositionModal}
          onOk={handleSavePosition}
          confirmLoading={loadingPosition}
          okText="Cập nhật"
          cancelText="Hủy"
          width={500}
        >
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Sinh viên:</span>
                <span>{selectedStudent.full_name}</span>
                <Tag color="blue">{selectedStudent.user_code}</Tag>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Vị trí hiện tại:</span>
                <Tag color="default">
                  {selectedStudent.position === "leader"
                    ? "Lớp trưởng"
                    : selectedStudent.position === "vice_leader"
                    ? "Lớp phó"
                    : "Thành viên"}
                </Tag>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Chọn vị trí mới:</span>
                <Select
                  value={selectedPosition}
                  onChange={setSelectedPosition}
                  style={{ width: 200 }}
                  options={[
                    { value: "leader", label: "Lớp trưởng" },
                    { value: "vice_leader", label: "Lớp phó" },
                    { value: "member", label: "Thành viên" },
                  ]}
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdvisorLayout>
  );
};

export default ClassDetail;
