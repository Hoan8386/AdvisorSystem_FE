import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Card,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getClassesApi,
  createClassApi,
  updateClassApi,
  deleteClassApi,
  downloadTemplateApi,
  importClassesApi,
  exportClassesApi,
} from "../../../services/api.service";

const { TextArea } = Input;

export const AdminClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getClassesApi();
      if (response?.success && response?.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClass(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingClass(record);
    form.setFieldsValue({
      class_name: record.class_name,
      advisor_id: record.advisor_id,
      faculty_id: record.faculty_id,
      description: record.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (classId) => {
    try {
      setDeleteLoadingId(classId);
      const response = await deleteClassApi(classId);
      if (response?.success) {
        toast.success("Xóa lớp thành công");
        fetchClasses();
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error(error?.message || "Không thể xóa lớp");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      const values = await form.validateFields();

      if (editingClass) {
        // Update
        const response = await updateClassApi(editingClass.class_id, values);
        if (response?.success) {
          toast.success("Cập nhật lớp thành công");
          setModalVisible(false);
          fetchClasses();
        }
      } else {
        // Create
        const response = await createClassApi(values);
        if (response?.success) {
          toast.success("Tạo lớp thành công");
          setModalVisible(false);
          fetchClasses();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Download template for classes
  const handleDownloadTemplate = async () => {
    try {
      setDownloadLoading(true);
      const response = await downloadTemplateApi("classes");

      // Lấy blob từ response
      let blob;

      // Check if response itself is Blob (từ axios interceptor)
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        // Nếu response.data là Blob
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        // Nếu là string, convert thành blob
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        // Mặc định convert object thành blob
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

      // Kiểm tra blob có dữ liệu
      if (!blob || blob.size === 0) {
        toast.error("File template trống hoặc không hợp lệ");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Tạo tên file kèm timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      link.download = `Template_Classes_${timestamp}.xlsx`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
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

  // Import classes from Excel
  const handleImportClasses = async (file) => {
    try {
      setImportLoading(true);
      const response = await importClassesApi(file);

      if (response?.success) {
        const { imported, errors } = response.data;
        toast.success(`Import thành công ${imported} lớp`);

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

        fetchClasses();
      }
    } catch (error) {
      console.error("Error importing classes:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi import file");
    } finally {
      setImportLoading(false);
    }

    return false;
  };

  // Export classes to Excel
  const handleExportClasses = async () => {
    try {
      setExportLoading(true);
      const response = await exportClassesApi();

      // Lấy blob từ response
      let blob;

      // Check if response itself is Blob (từ axios interceptor)
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        // Nếu response.data là Blob
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        // Nếu là string, convert thành blob
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        // Mặc định convert object thành blob
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

      // Kiểm tra blob có dữ liệu
      if (!blob || blob.size === 0) {
        toast.error("File xuất trống hoặc không hợp lệ");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      link.download = `Danh_sach_lop_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất danh sách lớp thành công");
    } catch (error) {
      console.error("Error exporting classes:", error);
      toast.error(error?.message || "Không thể xuất danh sách");
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewStudents = (classId) => {
    navigate(`/admin/classes/${classId}/students`);
  };

  const columns = [
    {
      title: "Mã lớp",
      dataIndex: "class_id",
      key: "class_id",
      width: 80,
    },
    {
      title: "Tên lớp",
      dataIndex: "class_name",
      key: "class_name",
    },
    {
      title: "Cố vấn",
      key: "advisor",
      render: (_, record) => record.advisor?.full_name || "Chưa có",
    },
    {
      title: "Khoa",
      key: "faculty",
      render: (_, record) => record.faculty?.unit_name || "N/A",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewStudents(record.class_id)}
            disabled={deleteLoadingId === record.class_id}
          >
            Xem SV
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={deleteLoadingId === record.class_id}
          />
          <Popconfirm
            title="Xác nhận xóa lớp?"
            description="Bạn có chắc chắn muốn xóa lớp này?"
            onConfirm={() => handleDelete(record.class_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoadingId === record.class_id}
              disabled={
                deleteLoadingId !== null && deleteLoadingId !== record.class_id
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Lớp học</h1>
            <p className="text-gray-500 mt-1">
              Quản lý thông tin các lớp học trong hệ thống
            </p>
          </div>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              loading={downloadLoading}
              disabled={loading || importLoading || exportLoading}
            >
              Tải template
            </Button>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={handleImportClasses}
              disabled={
                downloadLoading || loading || importLoading || exportLoading
              }
            >
              <Button
                icon={<UploadOutlined />}
                loading={importLoading}
                disabled={downloadLoading || loading || exportLoading}
              >
                Import Excel
              </Button>
            </Upload>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExportClasses}
              loading={exportLoading}
              disabled={loading || downloadLoading || importLoading}
            >
              Xuất danh sách
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchClasses}
              loading={loading}
              disabled={downloadLoading || importLoading || exportLoading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              disabled={
                loading || downloadLoading || importLoading || exportLoading
              }
            >
              Thêm lớp mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={classes}
          rowKey="class_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} lớp`,
          }}
        />
      </Card>

      <Modal
        title={editingClass ? "Cập nhật lớp" : "Thêm lớp mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingClass ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={600}
        confirmLoading={submitLoading}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="class_name"
            label="Tên lớp"
            rules={[
              { required: true, message: "Vui lòng nhập tên lớp" },
              { max: 50, message: "Tên lớp không quá 50 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: DH21CNTT" />
          </Form.Item>

          <Form.Item
            name="advisor_id"
            label="Cố vấn"
            rules={[{ required: false }]}
          >
            <Select
              placeholder="Chọn cố vấn"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {/* TODO: Load danh sách cố vấn từ API */}
              <Select.Option value={1}>ThS. Trần Văn An</Select.Option>
              <Select.Option value={2}>TS. Nguyễn Thị Bình</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="faculty_id"
            label="Khoa"
            rules={[{ required: true, message: "Vui lòng chọn khoa" }]}
          >
            <Select
              placeholder="Chọn khoa"
              showSearch
              optionFilterProp="children"
            >
              {/* TODO: Load danh sách khoa từ API */}
              <Select.Option value={1}>Khoa Công nghệ Thông tin</Select.Option>
              <Select.Option value={2}>Khoa Điện - Điện tử</Select.Option>
              <Select.Option value={3}>Khoa Cơ khí</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: false }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả về lớp học" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
