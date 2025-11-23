import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Table,
  Button,
  Card,
  Descriptions,
  Space,
  Tag,
  Upload,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  ExportOutlined,
  LockOutlined,
  EyeOutlined,
  EditOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  getClassDetailApi,
  getClassStudentsApi,
  downloadTemplateApi,
  importStudentsApi,
  exportStudentsByClassApi,
  resetStudentPasswordApi,
  getStudentDetailApi,
  updateStudentApi,
} from "../../../services/api.service";

export const AdminClassStudents = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const response = await getClassDetailApi(classId);
        if (response?.success && response?.data) {
          setClassInfo(response.data);
        }
      } catch (error) {
        console.error("Error fetching class info:", error);
        toast.error("Không thể tải thông tin lớp");
      }
    };

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await getClassStudentsApi(classId);
        if (response?.success && response?.data) {
          setStudents(response.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Không thể tải danh sách sinh viên");
      } finally {
        setLoading(false);
      }
    };

    fetchClassInfo();
    fetchStudents();
  }, [classId]);

  const refreshStudents = async () => {
    try {
      setLoading(true);
      const response = await getClassStudentsApi(classId);
      if (response?.success && response?.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (student) => {
    try {
      const response = await resetStudentPasswordApi(student.student_id);
      if (response?.success) {
        toast.success(response?.message || "Reset mật khẩu thành công");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error?.message || "Không thể reset mật khẩu");
    }
  };

  // View student details
  const handleViewStudent = async (student) => {
    try {
      setDetailLoading(true);
      const response = await getStudentDetailApi(student.student_id);
      if (response?.success && response?.data) {
        setSelectedStudent(response.data);
        setViewModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching student detail:", error);
      toast.error(error?.message || "Không thể tải thông tin sinh viên");
    } finally {
      setDetailLoading(false);
    }
  };

  // Open edit modal
  const handleEditStudent = async (student) => {
    try {
      setDetailLoading(true);
      const response = await getStudentDetailApi(student.student_id);
      if (response?.success && response?.data) {
        setSelectedStudent(response.data);
        form.setFieldsValue({
          user_code: response.data.user_code,
          full_name: response.data.full_name,
          email: response.data.email,
          phone_number: response.data.phone_number,
          class_id: response.data.class?.class_id,
          status: response.data.status,
          position: response.data.position,
        });
        setEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching student detail:", error);
      toast.error(error?.message || "Không thể tải thông tin sinh viên");
    } finally {
      setDetailLoading(false);
    }
  };

  // Save student updates
  const handleSaveStudent = async (values) => {
    try {
      setEditLoading(true);
      const response = await updateStudentApi(
        selectedStudent.student_id,
        values
      );
      if (response?.success) {
        toast.success(response?.message || "Cập nhật sinh viên thành công");
        setEditModalOpen(false);
        refreshStudents();
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error(error?.message || "Không thể cập nhật sinh viên");
    } finally {
      setEditLoading(false);
    }
  };

  // Download template for students
  const handleDownloadTemplate = async () => {
    try {
      setDownloadLoading(true);
      const response = await downloadTemplateApi("students");

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
      link.download = `Template_Students_${timestamp}.xlsx`;
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

  // Import students from Excel
  const handleImportStudents = async (file) => {
    try {
      setImportLoading(true);
      const response = await importStudentsApi(file);

      if (response?.success) {
        const { imported, errors } = response.data;
        toast.success(`Import thành công ${imported} sinh viên`);

        if (errors && errors.length > 0) {
          Modal.warning({
            title: `Có ${errors.length} lỗi khi import`,
            content: (
              <div style={{ maxHeight: "400px", overflow: "auto" }}>
                {errors.map((err, index) => (
                  <div key={index} className="mb-2">
                    {err}
                  </div>
                ))}
              </div>
            ),
            width: 600,
          });
        }

        refreshStudents();
      }
    } catch (error) {
      console.error("Error importing students:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi import file");
    } finally {
      setImportLoading(false);
    }

    return false;
  };

  // Export students by class
  const handleExportStudents = async () => {
    try {
      setExportLoading(true);
      const response = await exportStudentsByClassApi(classId);

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
      const className = classInfo?.class_name || "class";
      link.download = `Danh_sach_SV_${className}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất danh sách sinh viên thành công");
    } catch (error) {
      console.error("Error exporting students:", error);
      toast.error(error?.message || "Không thể xuất danh sách");
    } finally {
      setExportLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã SV",
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
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Cảnh cáo",
      dataIndex: "warnings_count",
      key: "warnings_count",
      align: "center",
      width: 100,
      render: (count) => {
        if (count > 0) {
          return (
            <Tag color="error" icon={<WarningOutlined />}>
              {count} lần
            </Tag>
          );
        }
        return <span className="text-gray-400">0</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => {
        let color = "default";
        let text = "Khác";

        switch (status) {
          case "studying":
            color = "green";
            text = "Đang học";
            break;
          case "graduated":
            color = "blue";
            text = "Đã tốt nghiệp";
            break;
          case "suspended":
            color = "orange";
            text = "Tạm hoãn";
            break;
          case "reserved":
            color = "purple";
            text = "Bảo lưu";
            break;
          case "dropped":
            color = "red";
            text = "Thôi học";
            break;
          default:
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            type="primary"
            size="small"
            onClick={() => handleViewStudent(record)}
            loading={detailLoading}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            type="default"
            size="small"
            onClick={() => handleEditStudent(record)}
            loading={detailLoading}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Reset mật khẩu"
            description={`Bạn có chắc muốn reset mật khẩu cho "${record.full_name}" (${record.user_code})?`}
            onConfirm={() => handleResetPassword(record)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<LockOutlined />} danger size="small">
              Reset MK
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-5">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/classes")}
            className="mb-4"
          >
            Quay lại
          </Button>

          <h1 className="text-2xl font-bold mb-4">
            Danh sách sinh viên - {classInfo?.class_name}
          </h1>

          {classInfo && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên lớp">
                {classInfo.class_name}
              </Descriptions.Item>
              <Descriptions.Item label="Cố vấn">
                {classInfo.advisor?.full_name || "Chưa có"}
              </Descriptions.Item>
              <Descriptions.Item label="Khoa">
                {classInfo.faculty?.unit_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số sinh viên">
                {students.length}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {classInfo.description || "Không có mô tả"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách sinh viên</h2>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              loading={downloadLoading}
              disabled={importLoading || exportLoading}
            >
              Tải template
            </Button>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={handleImportStudents}
              disabled={downloadLoading || exportLoading}
            >
              <Button
                icon={<UploadOutlined />}
                loading={importLoading}
                disabled={downloadLoading || exportLoading}
              >
                Import Excel
              </Button>
            </Upload>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExportStudents}
              loading={exportLoading}
              disabled={downloadLoading || importLoading}
            >
              Xuất danh sách
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshStudents}
              loading={loading}
              disabled={downloadLoading || importLoading || exportLoading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="student_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} sinh viên`,
          }}
        />
      </Card>

      {/* View Student Modal */}
      <Modal
        title="Xem chi tiết sinh viên"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        <Spin spinning={detailLoading}>
          {selectedStudent && (
            <Descriptions bordered column={1} style={{ marginTop: "16px" }}>
              <Descriptions.Item label="Mã sinh viên">
                {selectedStudent.user_code}
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {selectedStudent.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedStudent.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedStudent.phone_number || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {selectedStudent.class?.class_name}
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                {selectedStudent.position === "leader" && "Lớp trưởng"}
                {selectedStudent.position === "vice_leader" && "Lớp phó"}
                {selectedStudent.position === "secretary" && "Thư ký"}
                {selectedStudent.position === "member" && "Thành viên"}
              </Descriptions.Item>

              {/* Update Warning count in View Detail */}
              <Descriptions.Item label="Cảnh cáo học vụ">
                {selectedStudent.warnings_count > 0 ? (
                  <Tag color="error">{selectedStudent.warnings_count} lần</Tag>
                ) : (
                  "Không có"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    selectedStudent.status === "studying"
                      ? "green"
                      : selectedStudent.status === "graduated"
                      ? "blue"
                      : selectedStudent.status === "suspended"
                      ? "orange"
                      : selectedStudent.status === "reserved"
                      ? "purple"
                      : "red"
                  }
                >
                  {selectedStudent.status === "studying" && "Đang học"}
                  {selectedStudent.status === "graduated" && "Đã tốt nghiệp"}
                  {selectedStudent.status === "dropped" && "Thôi học"}
                  {selectedStudent.status === "suspended" && "Tạm hoãn"}
                  {selectedStudent.status === "reserved" && "Bảo lưu"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedStudent.created_at).toLocaleDateString(
                  "vi-VN"
                )}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        title="Cập nhật thông tin sinh viên"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={editLoading}
            onClick={() => form.submit()}
          >
            Cập nhật
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveStudent}
          style={{ marginTop: "16px" }}
        >
          <Form.Item
            label="Mã sinh viên"
            name="user_code"
            rules={[{ required: true, message: "Vui lòng nhập mã sinh viên" }]}
          >
            <Input placeholder="VD: 210001" />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            name="full_name"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="VD: sv.a@school.edu.vn" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone_number">
            <Input placeholder="VD: 0901234567" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              options={[
                { label: "Đang học", value: "studying" },
                { label: "Đã tốt nghiệp", value: "graduated" },
                { label: "Thôi học", value: "dropped" },
                { label: "Tạm hoãn", value: "suspended" },
                { label: "Bảo lưu", value: "reserved" },
              ]}
              placeholder="Chọn trạng thái"
            />
          </Form.Item>

          <Form.Item
            label="Chức vụ"
            name="position"
            rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
          >
            <Select
              options={[
                { label: "Lớp trưởng", value: "leader" },
                { label: "Lớp phó", value: "vice_leader" },
                { label: "Thư ký", value: "secretary" },
                { label: "Thành viên", value: "member" },
              ]}
              placeholder="Chọn chức vụ"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
