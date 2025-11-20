import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import { Card, Form, Input, Button, Select, Space, Spin } from "antd";
import { toast } from "react-toastify";
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
    setStudentsLoading(true);
    try {
      const response = await getClassStudentsAPI(classId);
      if (response && response.data) {
        const options = response.data.map((student) => ({
          label: `${student.user_code} - ${student.full_name}`,
          value: student.student_id,
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
    form.setFieldValue("student_id", undefined);
    if (classId) {
      fetchStudentsByClass(classId);
    } else {
      setStudents([]);
    }
  };

  useEffect(() => {
    if (isEdit && location.state?.note) {
      const note = location.state.note;
      form.setFieldsValue({
        student_id: note.student_id,
        semester_id: note.semester_id,
        category: note.category,
        title: note.title,
        content: note.content,
      });
    }
  }, [isEdit, location.state, form]);

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
          <h1 className="text-2xl font-bold mb-5">
            {isEdit ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}
          </h1>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-2xl"
          >
            {!isEdit && (
              <>
                <Form.Item label="Lớp" name="class_id">
                  <Select
                    placeholder="Chọn lớp để tải danh sách sinh viên"
                    onChange={handleClassChange}
                    options={classes}
                  />
                </Form.Item>

                <Form.Item
                  label="Sinh viên"
                  name="student_id"
                  rules={[{ required: true, message: "Chọn sinh viên" }]}
                >
                  <Select
                    placeholder="Chọn sinh viên"
                    disabled={!selectedClass || students.length === 0}
                    options={students}
                    notFoundContent={
                      !selectedClass
                        ? "Vui lòng chọn lớp trước"
                        : studentsLoading
                        ? "Đang tải..."
                        : "Không có sinh viên"
                    }
                  />
                </Form.Item>
              </>
            )}

            {isEdit && (
              <Form.Item
                label="Sinh viên"
                name="student_id"
                rules={[{ required: true, message: "Chọn sinh viên" }]}
              >
                <Select placeholder="Chọn sinh viên" disabled />
              </Form.Item>
            )}

            <Form.Item
              label="Học kỳ"
              name="semester_id"
              rules={[{ required: true, message: "Chọn học kỳ" }]}
            >
              <Select placeholder="Chọn học kỳ" options={semesters} />
            </Form.Item>

            <Form.Item
              label="Danh mục"
              name="category"
              rules={[{ required: true, message: "Chọn danh mục" }]}
            >
              <Select
                placeholder="Chọn danh mục"
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
                { required: true, message: "Nhập tiêu đề" },
                { min: 5, message: "Tối thiểu 5 ký tự" },
                { max: 255, message: "Tối đa 255 ký tự" },
              ]}
            >
              <Input placeholder="Nhập tiêu đề" />
            </Form.Item>

            <Form.Item
              label="Nội dung"
              name="content"
              rules={[
                { required: true, message: "Nhập nội dung" },
                { min: 10, message: "Tối thiểu 10 ký tự" },
                { max: 5000, message: "Tối đa 5000 ký tự" },
              ]}
            >
              <Input.TextArea rows={8} placeholder="Nhập nội dung ghi chú" />
            </Form.Item>

            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? "Cập nhật" : "Tạo"}
              </Button>
              <Button onClick={() => navigate("/advisor/monitoring-notes")}>
                Hủy
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </AdvisorLayout>
  );
}

export default CreateEditMonitoringNote;
