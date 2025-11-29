import { useState } from "react";
import { toast } from "react-toastify";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Tabs,
  Table,
  Empty,
  Spin,
  Tag,
} from "antd";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import {
  getClassesApi,
  getSemestersApi,
  getStudentScheduleApi,
  getClassScheduleApi,
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

export const AdvisorSchedules = () => {
  // Common states
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // Group B - Class schedule states
  const [classScheduleData, setClassScheduleData] = useState(null);
  const [classScheduleLoading, setClassScheduleLoading] = useState(false);
  const [classScheduleForm] = Form.useForm();

  // Group B - Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [detailModalData, setDetailModalData] = useState(null);

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

  // ==================== GROUP B: VIEW SCHEDULES ====================
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

  // Render detail modal content (ĐÃ CẬP NHẬT LOGIC MỚI)
  const renderDetailModalContent = () => {
    if (!detailModalData) {
      return <Empty description="Không có dữ liệu" />;
    }

    const { student = {}, semester = {}, schedule = {} } = detailModalData;

    // --- XỬ LÝ DỮ LIỆU: Gom nhóm flat_schedule theo môn học ---
    const groupedCourses = {};
    if (schedule?.flat_schedule && Array.isArray(schedule.flat_schedule)) {
      schedule.flat_schedule.forEach((item) => {
        const code = item.course_class_code;
        // Nếu chưa có môn này trong danh sách gom nhóm thì tạo mới
        if (!groupedCourses[code]) {
          groupedCourses[code] = {
            course_code: code,
            course_name: item.course_name,
            schedules: [],
          };
        }
        // Push lịch vào môn tương ứng
        groupedCourses[code].schedules.push(item);
      });
    }
    // Chuyển object thành array để map
    const coursesList = Object.values(groupedCourses);
    // -----------------------------------------------------------

    return (
      <div>
        <Card
          size="small"
          className="mb-4"
          title={`${student?.user_code || "N/A"} - ${
            student?.full_name || "N/A"
          }`}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{student?.email || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Lớp</p>
              <p className="font-semibold">{student?.class_name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Khoa</p>
              <p className="font-semibold">{student?.faculty_name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Cố vấn</p>
              <p className="font-semibold">{student?.advisor_name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Điện thoại</p>
              <p className="font-semibold">{student?.phone_number || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Chức vụ</p>
              <p className="font-semibold">
                {student?.position === "leader"
                  ? "Bí thư"
                  : student?.position === "secretary"
                  ? "Thư ký"
                  : "Thành viên"}
              </p>
            </div>
          </div>
        </Card>

        <Card
          size="small"
          title={`Lịch học - ${semester?.semester_name || "N/A"} - ${
            semester?.academic_year || "N/A"
          }`}
        >
          <p className="text-gray-600 mb-4">
            Tổng số môn: <Tag color="blue">{coursesList.length}</Tag>
            <span className="mx-2">|</span>
            Tổng số buổi:{" "}
            <Tag color="cyan">{schedule?.flat_schedule?.length || 0}</Tag>
          </p>

          {coursesList.length > 0 ? (
            <div className="space-y-4">
              {coursesList.map((course, courseIdx) => (
                <Card
                  key={courseIdx}
                  size="small"
                  className="bg-gray-50"
                  title={`${course.course_code} - ${course.course_name}`}
                >
                  <div className="space-y-3">
                    {course.schedules.map((sch, schIdx) => (
                      <div
                        key={schIdx}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-gray-600 text-xs">Giảng viên</p>
                            <p className="font-semibold text-sm">
                              {sch.instructor || "Chưa cập nhật"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Loại</p>
                            <Tag color={sch.type === "LT" ? "blue" : "orange"}>
                              {sch.type}
                            </Tag>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Ghi chú</p>
                            <p className="text-sm">{sch.note || "-"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-gray-600 text-xs">Thứ</p>
                            <p className="font-semibold">
                              {DAYS_OF_WEEK.find(
                                (d) => d.value === sch.day_of_week
                              )?.label || `Thứ ${sch.day_of_week}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Thời gian</p>
                            <p className="font-semibold">
                              {sch.start_time_str} - {sch.end_time_str}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Phòng</p>
                            <Tag color="green">{sch.room}</Tag>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Tiết</p>
                            <p className="text-sm">
                              {sch.start_period} - {sch.end_period}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-gray-600 text-xs">Ngày học</p>
                            <p className="text-sm font-semibold">
                              {new Date(sch.start_date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="Không có lịch học" />
          )}
        </Card>
      </div>
    );
  };

  // Render class schedule content
  const renderClassScheduleContent = () => {
    if (!classScheduleData || !classScheduleData.class) {
      return (
        <Empty description="Chọn lớp để xem lịch" style={{ marginTop: 48 }} />
      );
    }

    const {
      class: classInfo = {},
      semester = {},
      summary = {},
      students: classStudents = [],
    } = classScheduleData;

    const handleViewStudentScheduleDetail = async (studentId, semesterId) => {
      try {
        setDetailModalLoading(true);
        const response = await getStudentScheduleApi(studentId, semesterId);

        if (response?.success && response.data) {
          setDetailModalData(response.data);
          setIsDetailModalOpen(true);
          toast.success("Tải lịch sinh viên thành công");
        } else {
          toast.error("Không có dữ liệu lịch học");
        }
      } catch (error) {
        console.error("Error fetching student schedule detail:", error);
        toast.error(error?.message || "Không thể tải lịch sinh viên");
      } finally {
        setDetailModalLoading(false);
      }
    };

    return (
      <div>
        <Card size="small" className="mb-4" title="Thông tin lớp">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Tên lớp</p>
              <p className="font-semibold">{classInfo?.class_name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Cố vấn</p>
              <p className="font-semibold">{classInfo?.advisor_name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Khoa</p>
              <p className="font-semibold">{classInfo?.faculty_name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Học kỳ</p>
              <p className="font-semibold">
                {semester?.semester_name || "N/A"} -{" "}
                {semester?.academic_year || "N/A"}
              </p>
            </div>
          </div>
        </Card>

        <Card size="small" className="mb-4" title="Thống kê">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {summary?.total_students || 0}
              </div>
              <p className="text-gray-600">Tổng sinh viên</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {summary?.students_with_schedule || 0}
              </div>
              <p className="text-gray-600">Có lịch</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">
                {summary?.students_without_schedule || 0}
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
                    vice_leader: "Phó bí thư",
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
                key: "total_courses",
                width: 80,
                render: (_, record) => {
                  // --- CẬP NHẬT: Tính số môn dựa trên flat_schedule ---
                  let count = 0;
                  // Kiểm tra xem record.schedule có tồn tại và có mảng flat_schedule không
                  if (
                    record.schedule &&
                    Array.isArray(record.schedule.flat_schedule)
                  ) {
                    // Dùng Set để lọc ra các mã học phần (course_class_code) duy nhất
                    const uniqueCourses = new Set(
                      record.schedule.flat_schedule.map(
                        (item) => item.course_class_code
                      )
                    );
                    count = uniqueCourses.size;
                  }
                  return <Tag color="blue">{count}</Tag>;
                  // ----------------------------------------------------
                },
              },
              {
                title: "Thao tác",
                key: "actions",
                width: 100,
                render: (_, record) => (
                  <Space size="small">
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      // --- CẬP NHẬT: Disable nếu không có lịch ---
                      disabled={!record.has_schedule}
                      // -------------------------------------------
                      onClick={() => {
                        handleViewStudentScheduleDetail(
                          record.student_id,
                          semester?.semester_id
                        );
                      }}
                    >
                      Xem
                    </Button>
                  </Space>
                ),
              },
            ]}
            dataSource={classStudents}
            pagination={{
              pageSize: 15,
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
      key: "class_schedule",
      label: "👥 Xem Lịch Lớp",
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
                  <Select placeholder="Chọn lớp" onFocus={loadInitialData}>
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
  ];

  return (
    <AdvisorLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-2">
              <CalendarOutlined /> Quản lý Lịch học
            </h1>
            <p className="text-gray-500 text-sm mt-1 mb-0">
              Xem và tìm kiếm lịch học sinh viên của các lớp bạn quản lý
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Tabs
            items={tabItems}
            defaultActiveKey="class_schedule"
            onChange={loadInitialData}
          />
        </Card>

        {/* Detail Schedule Modal */}
        <Modal
          title="Chi tiết Lịch Học"
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          width={900}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
        >
          {detailModalLoading ? (
            <Spin />
          ) : detailModalData ? (
            renderDetailModalContent()
          ) : (
            <Empty description="Không có dữ liệu" />
          )}
        </Modal>
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorSchedules;
