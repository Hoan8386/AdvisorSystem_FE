import { useState, useEffect } from "react";
import {
  Upload,
  Table,
  Button,
  Space,
  Modal,
  Input,
  Form,
  Tag,
  Tooltip,
  Card,
  Statistic,
  Row,
  Col,
  Popconfirm,
} from "antd";
import { toast } from "react-toastify";
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  uploadDocumentAPI,
  getAllDocumentsAPI,
  deleteDocumentAPI,
  updateDocumentAPI,
  getDocumentDetailAPI,
} from "../../../services/rag.service";
import { useContext, useRef } from "react";
import { AuthContext } from "../../../components/context/auth.context";

const RAGDocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // File được chọn để upload
  const fileInputRef = useRef(null); // Ref để reset input file
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { user } = useContext(AuthContext);

  // Statistics
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalSize: 0,
    successCount: 0,
    failedCount: 0,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await getAllDocumentsAPI();
      const docs = response.data?.documents || [];
      setDocuments(docs);

      // Calculate stats inline
      const total = docs.length;
      const totalSize = docs.reduce(
        (acc, doc) => acc + (doc.file_size || 0),
        0
      );
      const success = docs.filter(
        (doc) => doc.file_exists && doc.vector_exists
      ).length;
      const failed = total - success;

      setStats({
        totalDocuments: total,
        totalSize: (totalSize / (1024 * 1024)).toFixed(2), // Convert to MB
        successCount: success,
        failedCount: failed,
      });

      toast.success("Tải danh sách tài liệu thành công");
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Không thể tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (values) => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file để upload");
      return;
    }

    console.log("Selected file:", selectedFile);
    console.log("File type:", typeof selectedFile);
    console.log("Is File instance:", selectedFile instanceof File);

    // Kiểm tra file trùng lặp
    const existingFile = documents.find(
      (doc) => doc.filename.toLowerCase() === selectedFile.name.toLowerCase()
    );
    if (existingFile) {
      Modal.confirm({
        title: "File đã tồn tại",
        content: `File "${selectedFile.name}" đã tồn tại trong hệ thống. Bạn có muốn xóa file cũ và upload file mới không?`,
        okText: "Xóa và Upload",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            // Xóa file cũ trước
            await deleteDocumentAPI(existingFile._id);
            toast.success("Đã xóa file cũ");
            // Upload file mới
            await performUpload(
              selectedFile,
              values.uploaded_by || user?.full_name
            );
          } catch (error) {
            console.error("Error deleting old file:", error);
            toast.error("Không thể xóa file cũ");
          }
        },
      });
      return;
    }

    await performUpload(selectedFile, values.uploaded_by || user?.full_name);
  };

  const performUpload = async (file, uploadedBy) => {
    console.log("=== PERFORM UPLOAD START ===");
    console.log("Uploading file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedBy: uploadedBy,
    });

    setLoading(true);
    try {
      console.log("Calling uploadDocumentAPI...");
      const response = await uploadDocumentAPI(file, uploadedBy);
      console.log("Upload response received:", response);
      console.log("Response data:", response.data);

      // Hiển thị thông báo thành công với thông tin chi tiết
      const { filename, _id, status, message: responseMessage } = response.data;
      console.log("Success! File uploaded:", { filename, _id, status });

      toast.success(
        `✅ ${responseMessage || "Vector added successfully"}\n` +
          `File: ${filename}\n` +
          `ID: ${_id}\n` +
          `Status: ${status}`,
        { duration: 5000 }
      );

      // Reset form và đóng modal
      setUploadModalVisible(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input file
      }
      form.resetFields();
      fetchDocuments();
    } catch (error) {
      console.error("=== UPLOAD ERROR ===");
      console.error("Error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Xử lý các loại lỗi cụ thể
      if (error.response?.status === 409) {
        // File đã tồn tại - Status 409 Conflict
        const errorDetail = error.response?.data?.detail || "";
        toast.error(
          `❌ File đã tồn tại!\n${errorDetail}\nStatus: 409 Conflict`,
          { duration: 6000 }
        );
      } else if (error.response?.status === 400) {
        // Lỗi định dạng file hoặc validation
        const errorMsg =
          error.response?.data?.detail || "Định dạng file không hợp lệ";
        toast.error(`❌ Lỗi validation\n${errorMsg}`, { duration: 5000 });
      } else {
        // Lỗi khác
        const errorMsg = error.response?.data?.detail || "Upload thất bại";
        toast.error(`❌ Upload thất bại\n${errorMsg}`, { duration: 5000 });
      }
    } finally {
      setLoading(false);
      console.log("=== PERFORM UPLOAD END ===");
    }
  };

  const handleDelete = async (docId) => {
    setLoading(true);
    try {
      await deleteDocumentAPI(docId);
      toast.success("Xóa tài liệu thành công");
      fetchDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Xóa tài liệu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (record) => {
    setSelectedDocument(record);

    // Lấy thông tin chi tiết
    try {
      const response = await getDocumentDetailAPI(record._id);
      const docDetail = response.data;

      // Remove extension from filename for editing
      const filenameWithoutExt = docDetail.filename.replace(/\.[^/.]+$/, "");

      editForm.setFieldsValue({
        filename: filenameWithoutExt,
        uploaded_by: docDetail.uploaded_by,
        force_re_embed: false,
      });

      setEditModalVisible(true);
    } catch (error) {
      console.error("Error fetching document detail:", error);
      toast.error("Không thể tải thông tin tài liệu");
    }
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      await updateDocumentAPI(selectedDocument._id, values);
      toast.success("Cập nhật tài liệu thành công");
      setEditModalVisible(false);
      editForm.resetFields();
      fetchDocuments();
    } catch (error) {
      console.error("Update error:", error);
      const errorMsg = error.response?.data?.detail || "Cập nhật thất bại";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên file",
      dataIndex: "filename",
      key: "filename",
      render: (text) => (
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <span className="font-medium">{text}</span>
        </Space>
      ),
    },
    {
      title: "Người upload",
      dataIndex: "uploaded_by",
      key: "uploaded_by",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },

    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa tài liệu này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <Row gutter={16} className="mb-5">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng tài liệu"
              value={stats.totalDocuments}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        title={
          <Space>
            <FileTextOutlined style={{ fontSize: "20px" }} />
            <span className="text-xl font-bold">Quản lý tài liệu RAG</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDocuments}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
            >
              Upload tài liệu
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài liệu`,
          }}
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined />
            <span>Upload tài liệu mới</span>
          </Space>
        }
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset input file
          }
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            label="Chọn file"
            required
            tooltip={{
              title: "Hỗ trợ: PDF, TXT, DOCX, CSV, XLS, XLSX (< 50MB)",
              icon: <InfoCircleOutlined />,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const allowedTypes = [
                    "application/pdf",
                    "text/plain",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "text/csv",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  ];

                  if (!allowedTypes.includes(file.type)) {
                    toast.error(
                      "Chỉ hỗ trợ file PDF, TXT, DOCX, CSV, XLS, XLSX"
                    );
                    e.target.value = "";
                    setSelectedFile(null);
                    return;
                  }

                  const isLt50M = file.size / 1024 / 1024 < 50;
                  if (!isLt50M) {
                    toast.error("File phải nhỏ hơn 50MB");
                    e.target.value = "";
                    setSelectedFile(null);
                    return;
                  }

                  // Kiểm tra trùng lặp
                  const isDuplicate = documents.some(
                    (doc) =>
                      doc.filename.toLowerCase() === file.name.toLowerCase()
                  );
                  if (isDuplicate) {
                    toast.warning(
                      `⚠️ File "${file.name}" đã tồn tại. Bạn sẽ được hỏi có muốn ghi đè khi upload.`,
                      { duration: 4000 }
                    );
                  }

                  setSelectedFile(file);
                  console.log("File selected:", file);
                }
              }}
              accept=".pdf,.txt,.docx,.csv,.xlsx,.xls"
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFile && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <CheckCircleOutlined className="mr-2" />
                {selectedFile.name}
              </div>
            )}
          </Form.Item>

          <Form.Item
            label="Người upload"
            name="uploaded_by"
            initialValue={user?.full_name || ""}
            rules={[
              { required: true, message: "Vui lòng nhập tên người upload" },
            ]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setUploadModalVisible(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Reset input file
                  }
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!selectedFile}
              >
                Upload
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Chỉnh sửa tài liệu</span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="Tên file"
            name="filename"
            rules={[{ required: true, message: "Vui lòng nhập tên file" }]}
            tooltip="Không thêm phần mở rộng (.pdf, .txt, ...) - hệ thống tự thêm"
          >
            <Input placeholder="document_name" />
          </Form.Item>

          <Form.Item label="Người upload" name="uploaded_by">
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Tạo lại embeddings"
            name="force_re_embed"
            valuePropName="checked"
            tooltip="Bắt buộc tái tạo vector embeddings (tốn thời gian)"
          >
            <Input type="checkbox" />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RAGDocumentManagement;
