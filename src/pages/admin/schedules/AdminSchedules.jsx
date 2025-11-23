import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Card,
  Button,
  Space,
  Upload,
  Modal,
  Form,
  Select,
  Divider,
  Alert,
  Tabs,
  Table,
  Input,
  InputNumber,
  Empty,
  Spin,
  Collapse,
  Tag,
  Popconfirm,
  // Thêm component
  Avatar,
  List,
  Badge,
  Descriptions,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  // Thêm icon
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  BookOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  downloadScheduleTemplateApi,
  importScheduleExcelApi,
  getClassesApi,
  getSemestersApi,
  getStudentScheduleApi,
  getClassScheduleApi,
  deleteStudentScheduleApi,
} from "../../../services/api.service";

// Constants
const DAYS_OF_WEEK = [
  { value: 2, label: "Thứ 2" },
  { value: 3, label: "Thứ 3" },
  { value: 4, label: "Thứ 4" },
  { value: 5, label: "Thứ 5" },
  { value: 6, label: "Thứ 6" },
  { value: 7, label: "Thứ 7" },
  { value: 8, label: "Chủ nhật" },
];

export const AdminSchedules = () => {
  // Common states
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // Group A - Import states
  const [importLoading, setImportLoading] = useState(false);

  // Group B - Student schedule states
  const [studentScheduleData, setStudentScheduleData] = useState(null);
  const [_studentScheduleLoading, _setStudentScheduleLoading] = useState(false);
  const [studentScheduleForm] = Form.useForm();

  // Group B - Class schedule states
  const [classScheduleData, setClassScheduleData] = useState(null);
  const [classScheduleLoading, setClassScheduleLoading] = useState(false);
  const [classScheduleForm] = Form.useForm();

  // Group B - Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [detailModalData, setDetailModalData] = useState(null);

  // Group C - Delete states
  const [deleteForm] = Form.useForm();

  // Initialize data
  const loadInitialData = async () => {
    try {
      const [classesRes, semestersRes] = await Promise.all([
        getClassesApi(),
        getSemestersApi(),
      ]);

      if (classesRes?.success) {
        setClasses(classesRes.data || []);
      }
      if (semestersRes?.success) {
        setSemesters(semestersRes.data || []);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Không thể tải dữ liệu");
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // ==================== GROUP A: IMPORT ====================
  const handleDownloadTemplate = async () => {
    try {
      setImportLoading(true);
      const response = await downloadScheduleTemplateApi();

      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      link.download = `lich_hoc_template_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Tải template thành công");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error(error?.message || "Không thể tải template");
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportSchedule = async (file) => {
    try {
      setImportLoading(true);
      const response = await importScheduleExcelApi(file);

      if (response?.success) {
        const { data } = response;
        toast.success(
          `Import thành công: ${data.courses_imported} lớp học, ${data.students_imported} sinh viên`
        );
        await loadInitialData();
      }
    } catch (error) {
      console.error("Error importing schedule:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi import lịch học");
    } finally {
      setImportLoading(false);
    }

    return false;
  };

  // ==================== GROUP B: VIEW SCHEDULES ====================
  const handleClassScheduleChange = () => {
    // This is just for handling the change event in the UI
  };

  const handleViewStudentScheduleDetail = async (studentId, semesterId) => {
    try {
      setDetailModalLoading(true);
      setIsDetailModalOpen(true); // Mở modal trước để hiện loading
      const response = await getStudentScheduleApi(studentId, semesterId);

      if (response?.success && response.data) {
        setDetailModalData(response.data);
      } else {
        toast.error("Không có dữ liệu lịch học");
        setIsDetailModalOpen(false); // Đóng nếu lỗi
      }
    } catch (error) {
      console.error("Error fetching student schedule detail:", error);
      toast.error(error?.message || "Không thể tải lịch sinh viên");
      setIsDetailModalOpen(false);
    } finally {
      setDetailModalLoading(false);
    }
  };

  const handleGetClassSchedule = async () => {
    try {
      const values = await classScheduleForm.validateFields();
      setClassScheduleLoading(true);

      const response = await getClassScheduleApi(
        values.class_id,
        values.semester_id
      );

      if (response?.success) {
        setClassScheduleData(response.data);
        toast.success("Tải lịch lớp thành công");
      }
    } catch (error) {
      console.error("Error fetching class schedule:", error);
      toast.error(error?.message || "Không thể tải lịch lớp");
    } finally {
      setClassScheduleLoading(false);
    }
  };

  // ==================== GROUP C: DELETE ====================
  const handleDeleteSchedule = async (studentId, semesterId) => {
    try {
      setLoading(true);
      const response = await deleteStudentScheduleApi(studentId, semesterId);

      if (response?.success) {
        toast.success("Xóa lịch học thành công");
        // Refresh class schedule data if available
        if (classScheduleData) {
          handleGetClassSchedule();
        }
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error(error?.message || "Không thể xóa lịch học");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER FUNCTIONS FOR RENDERING ---
  const getScheduleTypeColor = (type) => {
    const t = type?.toUpperCase();
    if (t === "LT" || t?.includes("LÝ THUYẾT")) return "blue";
    if (t === "TH" || t?.includes("THỰC HÀNH")) return "orange";
    return "cyan";
  };

  // Render detail modal content (CẬP NHẬT GIAO DIỆN ĐẸP HƠN)
  const renderDetailModalContent = () => {
    if (!detailModalData) {
      return <Empty description="Không có dữ liệu" />;
    }

    const { student, semester, schedule } = detailModalData;

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
                    renderItem={(sch) => (
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

  // Render class schedule content
  const renderClassScheduleContent = () => {
    if (!classScheduleData) {
      return (
        <Empty description="Chọn lớp để xem lịch" style={{ marginTop: 48 }} />
      );
    }

    const {
      class: classInfo,
      semester,
      summary,
      students: classStudents,
    } = classScheduleData;

    return (
      <div>
        <Card size="small" className="mb-4" title="Thông tin lớp">
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="Tên lớp">
              <strong>{classInfo.class_name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cố vấn">
              {classInfo.advisor_name}
            </Descriptions.Item>
            <Descriptions.Item label="Khoa">
              {classInfo.faculty_name}
            </Descriptions.Item>
            <Descriptions.Item label="Học kỳ">
              <Tag color="geekblue">
                {semester.semester_name} - {semester.academic_year}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" className="mb-4" title="Thống kê">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {summary.total_students}
              </div>
              <p className="text-gray-600">Tổng sinh viên</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {summary.students_with_schedule}
              </div>
              <p className="text-gray-600">Có lịch</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">
                {summary.students_without_schedule}
              </div>
              <p className="text-gray-600">Chưa có lịch</p>
            </div>
          </div>
        </Card>

        <Card size="small" title="Danh sách sinh viên">
          <Table
            columns={[
              {
                title: "MSSV",
                dataIndex: "user_code",
                key: "user_code",
                width: 100,
              },
              {
                title: "Tên",
                dataIndex: "full_name",
                key: "full_name",
                width: 200,
              },
              {
                title: "Chức vụ",
                dataIndex: "position",
                key: "position",
                width: 100,
                render: (pos) => {
                  const positionMap = {
                    leader: "Bí thư",
                    secretary: "Thư ký",
                    member: "Thành viên",
                  };
                  return positionMap[pos] || pos;
                },
              },
              {
                title: "Lịch",
                dataIndex: "has_schedule",
                key: "has_schedule",
                width: 80,
                render: (has) => (
                  <Tag color={has ? "green" : "red"}>{has ? "Có" : "Chưa"}</Tag>
                ),
              },
              {
                title: "Số môn",
                dataIndex: "total_courses",
                key: "total_courses",
                width: 80,
                render: (count) => <Tag color="blue">{count}</Tag>,
              },
              {
                title: "Thao tác",
                key: "actions",
                width: 180,
                render: (_, record) => (
                  <Space size="small">
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        handleViewStudentScheduleDetail(
                          record.student_id,
                          semester.semester_id
                        );
                      }}
                    >
                      Xem
                    </Button>
                    <Popconfirm
                      title="Xác nhận xóa"
                      description="Bạn có chắc chắn muốn xóa lịch học của sinh viên này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => {
                        handleDeleteSchedule(
                          record.student_id,
                          semester.semester_id
                        );
                      }}
                    >
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={classStudents}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            size="small"
            rowKey="student_id"
          />
        </Card>
      </div>
    );
  };

  // Tab items
  const tabItems = [
    {
      key: "import",
      label: "📥 Nhóm A: Import Lịch",
      children: (
        <div>
          <Card title="Import lịch học từ Excel" className="mb-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
              <p className="font-semibold mb-2 text-blue-800">
                <FileExcelOutlined /> Hướng dẫn Import:
              </p>
              <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                <li>
                  Tải file Excel template bằng nút "Tải template" bên dưới.
                </li>
                <li>
                  Điền thông tin vào 2 sheet: <strong>"Lịch lớp học"</strong> và{" "}
                  <strong>"Đăng ký lớp"</strong>.
                </li>
                <li>
                  Sheet 1: Mã lớp, Tên môn, Giảng viên, Giai đoạn, Ngày, Thứ,
                  Tiết, Phòng.
                </li>
                <li>
                  Sheet 2: MSSV, Họ tên, Lớp, Mã lớp học, Học kỳ, Năm học.
                </li>
                <li>File chỉ chấp nhận .xlsx hoặc .xls (tối đa 5MB).</li>
              </ol>
            </div>

            <Space size="middle" className="mb-4">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                loading={importLoading}
                size="large"
              >
                Tải template
              </Button>

              <Upload
                accept=".xlsx,.xls"
                maxCount={1}
                beforeUpload={handleImportSchedule}
                fileList={[]}
                showUploadList={false}
              >
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  loading={importLoading}
                  size="large"
                >
                  Import Lịch học
                </Button>
              </Upload>
            </Space>

            <Alert
              message="Lưu ý quan trọng"
              description="Hệ thống sẽ tự động phát hiện loại lịch (Lý thuyết/Thực hành) từ cột Ghi chú và ánh xạ tiết học sang giờ học thực tế."
              type="info"
              showIcon
              className="mt-4"
            />
          </Card>
        </div>
      ),
    },
    {
      key: "class_schedule",
      label: "👥 Nhóm B: Xem Lịch Lớp",
      children: (
        <div>
          <Card title="Xem lịch tổng quát của một lớp" className="mb-4">
            <Form
              form={classScheduleForm}
              layout="vertical"
              className="mb-4"
              initialValues={{ semester_id: semesters[0]?.semester_id }}
              onFinish={handleGetClassSchedule}
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Form.Item
                  name="semester_id"
                  label="Học kỳ"
                  rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
                >
                  <Select
                    placeholder="Chọn học kỳ"
                    showSearch
                    optionFilterProp="children"
                  >
                    {semesters.map((sem) => (
                      <Select.Option
                        key={sem.semester_id}
                        value={sem.semester_id}
                      >
                        {sem.semester_name} - {sem.academic_year}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="class_id"
                  label="Lớp"
                  rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
                >
                  <Select
                    placeholder="Chọn lớp"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleClassScheduleChange}
                  >
                    {classes.map((cls) => (
                      <Select.Option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={classScheduleLoading}
                icon={<SearchOutlined />}
                size="large"
                style={{
                  marginBottom: "20px",
                }}
              >
                Xem Lịch Lớp
              </Button>
            </Form>

            {classScheduleLoading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              renderClassScheduleContent()
            )}
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Quản lý Lịch học</h1>
          <p className="text-gray-500 mt-1">
            Quản lý import, xem, tìm kiếm và xóa lịch học sinh viên
          </p>
        </div>

        <Tabs items={tabItems} defaultActiveKey="import" />
      </Card>

      {/* Detail Schedule Modal */}
      <Modal
        title={null}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={1000}
        centered
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsDetailModalOpen(false)}
          >
            Đóng
          </Button>,
        ]}
        bodyStyle={{ padding: "20px 24px" }}
      >
        {/* Custom Header */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <CalendarOutlined className="text-blue-600 text-xl" />
          <span className="text-xl font-bold text-gray-800">
            Chi tiết Lịch học Sinh viên
          </span>
        </div>

        {detailModalLoading ? (
          <div className="text-center py-12">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          renderDetailModalContent()
        )}
      </Modal>
    </div>
  );
};
