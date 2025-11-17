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
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  downloadScheduleTemplateApi,
  importScheduleExcelApi,
  checkScheduleConflictApi,
  getClassesApi,
  getSemestersApi,
} from "../../../services/api.service";

export const AdminSchedules = () => {
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkConflictModalVisible, setCheckConflictModalVisible] =
    useState(false);
  const [conflictResult, setConflictResult] = useState(null);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [form] = Form.useForm();

  // Fetch classes and semesters when opening conflict check modal
  const handleOpenConflictCheck = async () => {
    setCheckConflictModalVisible(true);
    try {
      setLoading(true);
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
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Download Excel template
  const handleDownloadTemplate = async () => {
    try {
      setDownloadLoading(true);
      const response = await downloadScheduleTemplateApi();

      // Create blob and download
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
      setDownloadLoading(false);
    }
  };

  // Import schedule from Excel
  const handleImportSchedule = async (file) => {
    try {
      setImportLoading(true);
      const response = await importScheduleExcelApi(file);

      if (response?.success) {
        const { data } = response;
        toast.success(
          `Import thành công: ${data.courses_imported} lớp học, ${data.students_imported} sinh viên`
        );
      }
    } catch (error) {
      console.error("Error importing schedule:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi import lịch học");
    } finally {
      setImportLoading(false);
    }

    return false; // Prevent default upload behavior
  };

  // Handle class change to load students
  const handleClassChange = (classId) => {
    const selectedClass = classes.find((c) => c.class_id === classId);
    if (selectedClass?.students) {
      setStudents(selectedClass.students);
    } else {
      setStudents([]);
    }
    form.setFieldsValue({ student_id: undefined });
  };

  // Check schedule conflict
  const handleCheckConflict = async () => {
    try {
      const values = await form.validateFields();
      setCheckLoading(true);

      // Note: activity_id would come from another source in real app
      // For demo, we'll need to add activity selection
      const response = await checkScheduleConflictApi({
        student_id: values.student_id,
        activity_id: values.activity_id || 1, // This should be selected from activities
        semester_id: values.semester_id,
      });

      if (response?.success) {
        setConflictResult(response.data);

        if (response.data.has_conflict) {
          Modal.warning({
            title: "⚠️ Phát hiện xung đột lịch học",
            width: 600,
            content: (
              <div>
                <p>
                  <strong>Môn học xung đột:</strong>{" "}
                  {response.data.conflict_course}
                </p>
                <p>
                  <strong>Giai đoạn:</strong> {response.data.conflict_phase}
                </p>
                <p>
                  <strong>Thời gian:</strong> {response.data.conflict_time}
                </p>
                <p>
                  <strong>Phòng:</strong> {response.data.conflict_room}
                </p>
                <p>
                  <strong>Khoảng thời gian:</strong>{" "}
                  {response.data.conflict_date_range}
                </p>
              </div>
            ),
          });
        } else {
          toast.success("✅ Không có xung đột lịch học");
        }
      }
    } catch (error) {
      console.error("Error checking conflict:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi kiểm tra xung đột");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Quản lý Lịch học</h1>
          <p className="text-gray-500 mt-1">
            Import lịch học từ Excel và kiểm tra xung đột
          </p>
        </div>

        {/* Import Schedule Section */}
        <Card title="📥 Import Lịch học" className="mb-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">📌 Hướng dẫn import lịch học:</p>
            <ol className="list-decimal ml-5 space-y-1 text-sm">
              <li>
                Tải file Excel template bằng nút <strong>"Tải Template"</strong>
              </li>
              <li>
                Điền thông tin vào 2 sheet: <strong>Lịch lớp học</strong> và{" "}
                <strong>Đăng ký lớp</strong>
              </li>
              <li>
                Sheet 1 chứa: Mã lớp, Tên môn, Giảng viên, Giai đoạn, Ngày, Thứ,
                Tiết, Phòng
              </li>
              <li>
                Sheet 2 chứa: MSSV, Họ tên, Lớp, Mã lớp học, Học kỳ, Năm học
              </li>
              <li>File chỉ chấp nhận .xlsx hoặc .xls (tối đa 5MB)</li>
            </ol>
          </div>

          <Space size="middle">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              loading={loading}
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
                loading={loading}
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

        <Divider />

        {/* Check Conflict Section */}
        <Card title="🔍 Kiểm tra Xung đột Lịch" className="mb-4">
          <p className="text-gray-600 mb-4">
            Kiểm tra xung đột lịch học của sinh viên với hoạt động cụ thể
          </p>

          <Button
            type="primary"
            icon={<ClockCircleOutlined />}
            onClick={handleOpenConflictCheck}
            size="large"
          >
            Kiểm tra Xung đột
          </Button>
        </Card>

        {/* Statistics Card */}
        <Card title="📊 Thông tin hệ thống">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileExcelOutlined className="text-3xl text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">Excel</div>
              <div className="text-gray-600">Import/Export</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircleOutlined className="text-3xl text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">Auto</div>
              <div className="text-gray-600">Phát hiện LT/TH</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <ClockCircleOutlined className="text-3xl text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">Smart</div>
              <div className="text-gray-600">Kiểm tra xung đột</div>
            </div>
          </div>
        </Card>
      </Card>

      {/* Check Conflict Modal */}
      <Modal
        title="🔍 Kiểm tra Xung đột Lịch học"
        open={checkConflictModalVisible}
        onOk={handleCheckConflict}
        onCancel={() => {
          setCheckConflictModalVisible(false);
          setConflictResult(null);
          form.resetFields();
        }}
        okText="Kiểm tra"
        cancelText="Hủy"
        width={600}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="semester_id"
            label="Học kỳ"
            rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
          >
            <Select placeholder="Chọn học kỳ" loading={loading}>
              {semesters.map((sem) => (
                <Select.Option key={sem.semester_id} value={sem.semester_id}>
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
              onChange={handleClassChange}
              loading={loading}
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
            rules={[{ required: true, message: "Vui lòng chọn sinh viên" }]}
          >
            <Select
              placeholder="Chọn sinh viên"
              disabled={students.length === 0}
              showSearch
              optionFilterProp="children"
            >
              {students.map((student) => (
                <Select.Option
                  key={student.student_id}
                  value={student.student_id}
                >
                  {student.user_code} - {student.full_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Alert
            message="Lưu ý"
            description="Hiện tại cần chọn thêm hoạt động để kiểm tra xung đột. Tính năng này đang được phát triển."
            type="warning"
            showIcon
            className="mt-4"
          />
        </Form>

        {conflictResult && (
          <Alert
            message={
              conflictResult.has_conflict
                ? "⚠️ Có xung đột lịch học"
                : "✅ Không có xung đột"
            }
            type={conflictResult.has_conflict ? "warning" : "success"}
            showIcon
            className="mt-4"
          />
        )}
      </Modal>
    </div>
  );
};
