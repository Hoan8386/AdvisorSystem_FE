import { useState } from "react";
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
} from "@ant-design/icons";
import {
  downloadScheduleTemplateApi,
  importScheduleExcelApi,
  getClassesApi,
  getSemestersApi,
  getStudentScheduleApi,
  getClassScheduleApi,
  searchSchedulesApi,
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

const timeSlots = [
  "07:00",
  "07:45",
  "08:30",
  "09:15",
  "09:40",
  "10:25",
  "11:10",
  "12:30",
  "13:15",
  "14:00",
  "14:45",
  "15:10",
  "15:55",
  "16:40",
  "18:00",
  "18:45",
  "19:30",
  "20:15",
  "21:00",
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
  const [studentScheduleLoading, setStudentScheduleLoading] = useState(false);
  const [studentScheduleForm] = Form.useForm();

  // Group B - Class schedule states
  const [classScheduleData, setClassScheduleData] = useState(null);
  const [classScheduleLoading, setClassScheduleLoading] = useState(false);
  const [classScheduleForm] = Form.useForm();

  // Group B - Search states
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchForm] = Form.useForm();

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
  const handleStudentScheduleChange = (studentId) => {
    const selectedClass = classes.find((c) =>
      c.students?.some((s) => s.student_id === studentId)
    );
    if (selectedClass) {
      studentScheduleForm.setFieldsValue({
        class_id: selectedClass.class_id,
      });
    }
  };

  const handleGetStudentSchedule = async () => {
    try {
      const values = await studentScheduleForm.validateFields();
      setStudentScheduleLoading(true);

      const response = await getStudentScheduleApi(
        values.student_id,
        values.semester_id
      );

      if (response?.success) {
        setStudentScheduleData(response.data);
        toast.success("Tải lịch sinh viên thành công");
      }
    } catch (error) {
      console.error("Error fetching student schedule:", error);
      toast.error(error?.message || "Không thể tải lịch sinh viên");
    } finally {
      setStudentScheduleLoading(false);
    }
  };

  const handleClassScheduleChange = () => {
    // This is just for handling the change event in the UI
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

  // ==================== GROUP B: SEARCH ====================
  const handleSearchSchedules = async () => {
    try {
      const values = await searchForm.validateFields();
      setSearchLoading(true);

      const filters = {
        semester_id: values.semester_id,
        ...(values.class_id && { class_id: values.class_id }),
        ...(values.day_of_week && { day_of_week: values.day_of_week }),
        ...(values.start_time && { start_time: values.start_time }),
        ...(values.end_time && { end_time: values.end_time }),
        ...(values.course_code && { course_code: values.course_code }),
      };

      const response = await searchSchedulesApi(filters);

      if (response?.success) {
        setSearchResults(response.data);
        toast.success(`Tìm thấy ${response.data.total_found} sinh viên`);
      }
    } catch (error) {
      console.error("Error searching schedules:", error);
      toast.error(error?.message || "Không thể tìm kiếm lịch học");
    } finally {
      setSearchLoading(false);
    }
  };

  // ==================== GROUP C: DELETE ====================
  const handleDeleteSchedule = async (studentId, semesterId) => {
    try {
      setLoading(true);
      const response = await deleteStudentScheduleApi(studentId, semesterId);

      if (response?.success) {
        toast.success("Xóa lịch học thành công");
        setStudentScheduleData(null);
        setClassScheduleData(null);
        deleteForm.resetFields();
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error(error?.message || "Không thể xóa lịch học");
    } finally {
      setLoading(false);
    }
  };

  // Render schedule table
  const renderScheduleTable = (schedules) => {
    if (!schedules || schedules.length === 0) {
      return <Empty description="Không có lịch học" />;
    }

    const columns = [
      {
        title: "Mã môn",
        dataIndex: "course_code",
        key: "course_code",
        width: 100,
      },
      {
        title: "Giai đoạn",
        dataIndex: "phase",
        key: "phase",
        width: 100,
      },
      {
        title: "Thứ",
        dataIndex: "day_of_week",
        key: "day_of_week",
        width: 80,
        render: (day) => {
          const dayName = DAYS_OF_WEEK.find((d) => d.value === day)?.label;
          return dayName || day;
        },
      },
      {
        title: "Thời gian",
        dataIndex: "time_range",
        key: "time_range",
        width: 120,
      },
      {
        title: "Phòng",
        dataIndex: "room",
        key: "room",
        width: 80,
      },
      {
        title: "Ngày bắt đầu",
        dataIndex: "start_date",
        key: "start_date",
        width: 120,
        render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      },
      {
        title: "Ngày kết thúc",
        dataIndex: "end_date",
        key: "end_date",
        width: 120,
        render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={schedules.map((s, idx) => ({
          ...s,
          key: idx,
        }))}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        size="small"
      />
    );
  };

  // Render student schedule modal content
  const renderStudentScheduleContent = () => {
    if (!studentScheduleData) {
      return (
        <Empty
          description="Chọn sinh viên để xem lịch"
          style={{ marginTop: 48 }}
        />
      );
    }

    const { student, schedule, schedules } = studentScheduleData;

    if (schedules && Array.isArray(schedules)) {
      // Multiple semesters
      return (
        <Collapse
          items={schedules.map((sem, idx) => ({
            key: idx,
            label: `${sem.semester} - ${sem.academic_year} (${sem.total_courses} môn)`,
            children: renderScheduleTable(sem.flat_schedule),
          }))}
        />
      );
    }

    // Single semester
    return (
      <div>
        <Card
          size="small"
          className="mb-4"
          title={`${student.student_code} - ${student.full_name}`}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{student.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Lớp</p>
              <p className="font-semibold">{student.class_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Khoa</p>
              <p className="font-semibold">{student.faculty_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Cố vấn</p>
              <p className="font-semibold">{student.advisor_name}</p>
            </div>
          </div>
        </Card>

        <Card size="small" title={`Lịch học - Học kỳ ${schedule.semester}`}>
          <p className="text-gray-600 mb-4">
            Tổng số môn: <Tag color="blue">{schedule.total_courses}</Tag>
          </p>
          {renderScheduleTable(schedule.flat_schedule)}
        </Card>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Tên lớp</p>
              <p className="font-semibold">{classInfo.class_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Cố vấn</p>
              <p className="font-semibold">{classInfo.advisor_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Khoa</p>
              <p className="font-semibold">{classInfo.faculty_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Học kỳ</p>
              <p className="font-semibold">
                {semester.semester_name} - {semester.academic_year}
              </p>
            </div>
          </div>
        </Card>

        <Card size="small" className="mb-4" title="Thống kê">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {summary.total_students}
              </div>
              <p className="text-gray-600">Tổng sinh viên</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {summary.students_with_schedule}
              </div>
              <p className="text-gray-600">Có lịch</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
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
                title: "Lịch chi tiết",
                key: "actions",
                width: 120,
                render: (_, record) => (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      studentScheduleForm.setFieldsValue({
                        student_id: record.student_id,
                        semester_id: semester.semester_id,
                      });
                      handleGetStudentSchedule();
                    }}
                  >
                    Xem
                  </Button>
                ),
              },
            ]}
            dataSource={classStudents}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
            }}
            size="small"
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
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-semibold mb-2">📌 Hướng dẫn:</p>
              <ol className="list-decimal ml-5 space-y-1 text-sm">
                <li>Tải file Excel template bằng nút "Tải Template"</li>
                <li>
                  Điền thông tin vào 2 sheet: "Lịch lớp học" và "Đăng ký lớp"
                </li>
                <li>
                  Sheet 1: Mã lớp, Tên môn, Giảng viên, Giai đoạn, Ngày, Thứ,
                  Tiết, Phòng
                </li>
                <li>Sheet 2: MSSV, Họ tên, Lớp, Mã lớp học, Học kỳ, Năm học</li>
                <li>File chỉ chấp nhận .xlsx hoặc .xls (tối đa 5MB)</li>
              </ol>
            </div>

            <Space size="middle">
              <Button
                type="default"
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                loading={importLoading}
                size="large"
              >
                Tải Template
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
              message="Lưu ý"
              description="Hệ thống sẽ tự động phát hiện loại lịch (Lý thuyết/Thực hành) từ cột Ghi chú và ánh xạ tiết học sang giờ học tương ứng."
              type="info"
              showIcon
              className="mt-4"
            />
          </Card>
        </div>
      ),
    },
    {
      key: "student_schedule",
      label: "🎓 Nhóm B: Xem Lịch Sinh Viên",
      children: (
        <div>
          <Card title="Xem lịch chi tiết của một sinh viên" className="mb-4">
            <Form
              form={studentScheduleForm}
              layout="vertical"
              className="mb-4"
              initialValues={{ semester_id: semesters[0]?.semester_id }}
              onFinish={handleGetStudentSchedule}
            >
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Form.Item
                  name="semester_id"
                  label="Học kỳ"
                  rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
                >
                  <Select placeholder="Chọn học kỳ" onFocus={loadInitialData}>
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
                    onChange={handleStudentScheduleChange}
                  >
                    {classes.map((cls) => (
                      <Select.Option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="student_id"
                  label="Sinh viên"
                  rules={[
                    { required: true, message: "Vui lòng chọn sinh viên" },
                  ]}
                >
                  <Select
                    placeholder="Chọn sinh viên"
                    showSearch
                    optionFilterProp="children"
                  >
                    {classes
                      .flatMap((c) => c.students || [])
                      .map((student) => (
                        <Select.Option
                          key={student.student_id}
                          value={student.student_id}
                        >
                          {student.user_code} - {student.full_name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={studentScheduleLoading}
                icon={<EyeOutlined />}
                size="large"
              >
                Xem Lịch
              </Button>
            </Form>

            {studentScheduleLoading ? <Spin /> : renderStudentScheduleContent()}
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
                  <Select placeholder="Chọn học kỳ" onFocus={loadInitialData}>
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
                icon={<EyeOutlined />}
                size="large"
              >
                Xem Lịch Lớp
              </Button>
            </Form>

            {classScheduleLoading ? <Spin /> : renderClassScheduleContent()}
          </Card>
        </div>
      ),
    },
    {
      key: "search",
      label: "🔍 Nhóm B: Tìm Kiếm Nâng Cao",
      children: (
        <div>
          <Card title="Tìm kiếm sinh viên theo lịch học" className="mb-4">
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <p className="font-semibold mb-2">💡 Chức năng:</p>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>Tìm sinh viên có lịch vào thứ cụ thể</li>
                <li>Tìm sinh viên học môn cụ thể</li>
                <li>Tìm sinh viên có lịch trong khoảng giờ nhất định</li>
                <li>Kết hợp tìm kiếm theo múa tiêu chí</li>
              </ul>
            </div>

            <Form
              form={searchForm}
              layout="vertical"
              className="mb-4"
              initialValues={{ semester_id: semesters[0]?.semester_id }}
              onFinish={handleSearchSchedules}
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Form.Item
                  name="semester_id"
                  label="Học kỳ (bắt buộc)"
                  rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
                >
                  <Select placeholder="Chọn học kỳ" onFocus={loadInitialData}>
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

                <Form.Item name="class_id" label="Lớp (tùy chọn)">
                  <Select placeholder="Chọn lớp">
                    {classes.map((cls) => (
                      <Select.Option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="day_of_week" label="Thứ (tùy chọn)">
                  <Select placeholder="Chọn thứ">
                    {DAYS_OF_WEEK.map((day) => (
                      <Select.Option key={day.value} value={day.value}>
                        {day.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="course_code" label="Mã môn học (tùy chọn)">
                  <Input placeholder="VD: IT001" />
                </Form.Item>

                <Form.Item name="start_time" label="Giờ bắt đầu (tùy chọn)">
                  <Select placeholder="Chọn giờ">
                    {timeSlots.map((time) => (
                      <Select.Option key={time} value={time}>
                        {time}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="end_time" label="Giờ kết thúc (tùy chọn)">
                  <Select placeholder="Chọn giờ">
                    {timeSlots.map((time) => (
                      <Select.Option key={time} value={time}>
                        {time}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={searchLoading}
                icon={<SearchOutlined />}
                size="large"
              >
                Tìm Kiếm
              </Button>
            </Form>

            {searchLoading ? (
              <Spin />
            ) : searchResults ? (
              <Card>
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">Tiêu chí tìm kiếm:</p>
                  <div className="flex gap-2 flex-wrap">
                    {searchResults.search_criteria.class_id && (
                      <Tag>Lớp: {searchResults.search_criteria.class_id}</Tag>
                    )}
                    {searchResults.search_criteria.day_of_week && (
                      <Tag>
                        Thứ:{" "}
                        {
                          DAYS_OF_WEEK.find(
                            (d) =>
                              d.value ===
                              searchResults.search_criteria.day_of_week
                          )?.label
                        }
                      </Tag>
                    )}
                    {searchResults.search_criteria.start_time && (
                      <Tag>Từ: {searchResults.search_criteria.start_time}</Tag>
                    )}
                    {searchResults.search_criteria.end_time && (
                      <Tag>Đến: {searchResults.search_criteria.end_time}</Tag>
                    )}
                    {searchResults.search_criteria.course_code && (
                      <Tag>
                        Môn: {searchResults.search_criteria.course_code}
                      </Tag>
                    )}
                  </div>
                  <p className="text-lg font-bold mt-3 text-blue-600">
                    Tìm thấy: {searchResults.total_found} sinh viên
                  </p>
                </div>

                <Table
                  columns={[
                    {
                      title: "MSSV",
                      dataIndex: "user_code",
                      key: "user_code",
                      width: 100,
                    },
                    {
                      title: "Tên sinh viên",
                      dataIndex: "full_name",
                      key: "full_name",
                      width: 200,
                    },
                    {
                      title: "Lớp",
                      dataIndex: "class_name",
                      key: "class_name",
                      width: 120,
                    },
                    {
                      title: "Email",
                      dataIndex: "email",
                      key: "email",
                      width: 200,
                    },
                    {
                      title: "Lịch trùng",
                      key: "matched",
                      width: 250,
                      render: (_, record) => (
                        <Collapse
                          items={
                            record.matched_schedules?.map((s, idx) => ({
                              key: idx,
                              label: `${s.course_code} - ${s.phase} (${s.time_range})`,
                              children: (
                                <div className="text-sm">
                                  <p>Phòng: {s.room}</p>
                                  <p>
                                    Từ:{" "}
                                    {new Date(s.start_date).toLocaleDateString(
                                      "vi-VN"
                                    )}
                                  </p>
                                  <p>
                                    Đến:{" "}
                                    {new Date(s.end_date).toLocaleDateString(
                                      "vi-VN"
                                    )}
                                  </p>
                                </div>
                              ),
                            })) || []
                          }
                        />
                      ),
                    },
                  ]}
                  dataSource={searchResults.students}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                  }}
                  size="small"
                />
              </Card>
            ) : null}
          </Card>
        </div>
      ),
    },
    {
      key: "delete",
      label: "🗑️ Nhóm C: Xóa Lịch Sinh Viên",
      children: (
        <div>
          <Card title="Xóa lịch học của sinh viên" className="mb-4">
            <Alert
              message="⚠️ Cảnh báo"
              description="Thao tác xóa lịch học của sinh viên trong một học kỳ. Chỉ xóa dữ liệu trong MongoDB, không ảnh hưởng đến MySQL. Có thể import lại nếu cần."
              type="warning"
              showIcon
              className="mb-4"
            />

            <Form
              form={deleteForm}
              layout="vertical"
              className="mb-4"
              initialValues={{ semester_id: semesters[0]?.semester_id }}
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Form.Item
                  name="semester_id"
                  label="Học kỳ"
                  rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
                >
                  <Select placeholder="Chọn học kỳ" onFocus={loadInitialData}>
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
                  <Select placeholder="Chọn lớp">
                    {classes.map((cls) => (
                      <Select.Option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="student_id"
                  label="Sinh viên"
                  rules={[
                    { required: true, message: "Vui lòng chọn sinh viên" },
                  ]}
                >
                  <Select
                    placeholder="Chọn sinh viên"
                    showSearch
                    optionFilterProp="children"
                  >
                    {classes
                      .flatMap((c) => c.students || [])
                      .map((student) => (
                        <Select.Option
                          key={student.student_id}
                          value={student.student_id}
                        >
                          {student.user_code} - {student.full_name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </div>

              <Popconfirm
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa lịch học của sinh viên này? Thao tác này không thể hoàn tác."
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                onConfirm={() => {
                  const values = deleteForm.getFieldsValue();
                  handleDeleteSchedule(values.student_id, values.semester_id);
                }}
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  size="large"
                  loading={loading}
                >
                  Xóa Lịch Học
                </Button>
              </Popconfirm>
            </Form>
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

        <Tabs
          items={tabItems}
          defaultActiveKey="import"
          onChange={loadInitialData}
        />
      </Card>
    </div>
  );
};
