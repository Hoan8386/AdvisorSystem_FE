import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import { Card, Form, Input, Button, Select, Space, Spin } from "antd";
import { toast } from "react-toastify";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  createMonitoringNoteAPI,
  updateMonitoringNoteAPI,
  getSemestersAPI,
  getClassesAPI,
  getClassStudentsAPI,
} from "../../../services/api.service";

function CreateEditMonitoringNote() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const isEdit = location.pathname.includes("/edit");
  const noteId = location.pathname.split("/")[3];
  const [isInitializing, setIsInitializing] = useState(
    !!location.state?.selectedStudent
  );

  // Fetch semesters
  const fetchSemesters = useCallback(async () => {
    try {
      const response = await getSemestersAPI();
      if (response && response.data) {
        const options = response.data.map((sem) => ({
          label: `${sem.semester_name} - ${sem.academic_year}`,
          value: sem.semester_id,
        }));
        setSemesters(options);
      }
    } catch (error) {
      console.error("Lỗi tải học kỳ:", error);
    }
  }, []);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const response = await getClassesAPI();
      if (response && response.data) {
        const options = response.data.map((cls) => ({
          label: cls.class_name,
          value: cls.class_id,
        }));
        setClasses(options);
      }
    } catch (error) {
      console.error("Lỗi tải lớp:", error);
    }
  }, []);

  // Fetch students by class
  const fetchStudentsByClass = useCallback(async (classId) => {
    if (!classId) return;
    setStudentsLoading(true);
    try {
      const response = await getClassStudentsAPI(classId);
      if (response && response.data) {
        const options = response.data.map((student) => ({
          label: `${student.user_code} - ${student.full_name}`,
          value: student.user_code,
          student_id: student.student_id,
        }));
        setStudents(options);
      }
    } catch (error) {
      console.error("Lỗi tải sinh viên:", error);
      toast.error("Lỗi khi tải danh sách sinh viên");
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemesters();
    fetchClasses();
  }, [fetchSemesters, fetchClasses]);

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    form.setFieldValue("user_code", undefined);
    if (classId) {
      fetchStudentsByClass(classId);
    } else {
      setStudents([]);
    }
  };

  // --- PHẦN XỬ LÝ TỰ ĐỘNG FILL DỮ LIỆU ---
  useEffect(() => {
    const initData = async () => {
      try {
        // TRƯỜNG HỢP 1: Chế độ EDIT (Sửa)
        if (isEdit && location.state?.note) {
          const note = location.state.note;

          // Cần lấy class_id từ thông tin sinh viên trong note
          const classId =
            note.student?.class_id || note.student?.class?.class_id;

          // Tải danh sách sinh viên của lớp đó để Select hiển thị đúng tên
          if (classId) {
            setSelectedClass(classId);
            // Load danh sách sinh viên TRƯỚC khi set giá trị vào form
            await fetchStudentsByClass(classId);

            // Sau khi đã có danh sách sinh viên, mới set giá trị
            form.setFieldsValue({
              class_id: classId,
              user_code: note.student?.user_code || note.user_code,
              semester_id: note.semester_id,
              category: note.category,
              title: note.title,
              content: note.content,
            });
          }
        }
        // TRƯỜNG HỢP 2: Chế độ CREATE (Tạo mới) nhưng có truyền dữ liệu sinh viên
        else if (!isEdit && location.state?.selectedStudent) {
          const student = location.state.selectedStudent;

          // 1. Set Class ID trước
          setSelectedClass(student.class_id);

          // 2. Gọi API lấy danh sách sinh viên của lớp đó ngay lập tức
          await fetchStudentsByClass(student.class_id);

          // 3. Fill dữ liệu vào Form (bao gồm semester_id nếu có)
          form.setFieldsValue({
            class_id: student.class_id,
            user_code: student.user_code,
            semester_id: student.semester_id || undefined,
          });
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initData();
  }, [isEdit, location.state, form, fetchStudentsByClass]);
  // ----------------------------------------

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateMonitoringNoteAPI(noteId, values);
        toast.success("Cập nhật ghi chú thành công");
      } else {
        await createMonitoringNoteAPI(values);
        toast.success("Tạo ghi chú thành công");
      }
      navigate("/advisor/monitoring-notes");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdvisorLayout>
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/advisor/monitoring-notes")}
              size="large"
            />
            <h1 className="text-2xl font-bold m-0">
              {isEdit ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}
            </h1>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-2xl"
          >
            {isInitializing ? (
              <div className="flex justify-center py-12">
                <Spin size="large" tip="Đang tải dữ liệu..." />
              </div>
            ) : (
              <>
                {/* Khi Edit hoặc khi đã có selectedStudent (từ trang danh sách qua), 
                chúng ta disable chọn lớp để tránh thay đổi ngữ cảnh sai 
            */}
                <Form.Item
                  label="Lớp"
                  name="class_id"
                  rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
                >
                  <Select
                    placeholder="Chọn lớp để tải danh sách sinh viên"
                    onChange={handleClassChange}
                    options={classes}
                    // Disable nếu đang sửa hoặc đã được pre-fill từ danh sách
                    disabled={isEdit || !!location.state?.selectedStudent}
                  />
                </Form.Item>

                <Form.Item
                  label="Sinh viên"
                  name="user_code"
                  rules={[
                    { required: true, message: "Vui lòng chọn sinh viên" },
                  ]}
                >
                  <Select
                    placeholder="Chọn sinh viên từ danh sách"
                    disabled={
                      !selectedClass ||
                      students.length === 0 ||
                      isEdit ||
                      !!location.state?.selectedStudent
                    }
                    options={students}
                    loading={studentsLoading}
                    notFoundContent={
                      !selectedClass
                        ? "Vui lòng chọn lớp trước"
                        : studentsLoading
                        ? "Đang tải danh sách sinh viên..."
                        : "Không có sinh viên trong lớp này"
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Học kỳ"
                  name="semester_id"
                  rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
                >
                  <Select placeholder="Chọn học kỳ" options={semesters} />
                </Form.Item>

                <Form.Item
                  label="Danh mục"
                  name="category"
                  rules={[
                    { required: true, message: "Vui lòng chọn danh mục" },
                  ]}
                >
                  <Select
                    placeholder="Chọn danh mục ghi chú"
                    options={[
                      { label: "Học tập", value: "academic" },
                      { label: "Cá nhân", value: "personal" },
                      { label: "Chuyên cần", value: "attendance" },
                      { label: "Khác", value: "other" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Tiêu đề"
                  name="title"
                  rules={[
                    { required: true, message: "Tiêu đề là bắt buộc" },
                    { min: 5, message: "Tiêu đề phải từ 5 ký tự trở lên" },
                    {
                      max: 255,
                      message: "Tiêu đề không được vượt quá 255 ký tự",
                    },
                  ]}
                >
                  <Input placeholder="Ví dụ: Theo dõi học tập sinh viên" />
                </Form.Item>

                <Form.Item
                  label="Nội dung"
                  name="content"
                  rules={[
                    { required: true, message: "Nội dung là bắt buộc" },
                    { min: 10, message: "Nội dung phải từ 10 ký tự trở lên" },
                    {
                      max: 5000,
                      message: "Nội dung không được vượt quá 5000 ký tự",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={8}
                    placeholder="Nhập chi tiết ghi chú theo dõi sinh viên..."
                    maxLength={5000}
                    showCount
                  />
                </Form.Item>

                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {isEdit ? "Cập nhật ghi chú" : "Tạo ghi chú"}
                  </Button>
                  <Button onClick={() => navigate("/advisor/monitoring-notes")}>
                    Hủy
                  </Button>
                </Space>
              </>
            )}
          </Form>
        </Card>
      </div>
    </AdvisorLayout>
  );
}

export default CreateEditMonitoringNote;
