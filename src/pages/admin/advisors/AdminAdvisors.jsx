import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Avatar,
  Upload,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Spin,
} from "antd";
import {
  UserOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  LockOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../../../utils/avatarHelper";
import {
  downloadTemplateApi,
  importAdvisorsApi,
  resetAdvisorPasswordApi,
  getAdvisorsApi,
  createAdvisorApi,
  updateAdvisorApi,
  deleteAdvisorApi,
  uploadAdvisorAvatarApi,
} from "../../../services/api.service";

export const AdminAdvisors = () => {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Avatar upload states
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [avatarAdvisor, setAvatarAdvisor] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const response = await getAdvisorsApi();
      if (response?.success && response?.data) {
        setAdvisors(response.data);
      }
    } catch (error) {
      console.error("Error fetching advisors:", error);
      toast.error("Không thể tải danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  };

  // Download template for advisors
  const handleDownloadTemplate = async () => {
    try {
      setDownloadLoading(true);
      const response = await downloadTemplateApi("advisors");

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
      link.download = `Template_Advisors_${timestamp}.xlsx`;
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

  // Import advisors from Excel
  const handleImportAdvisors = async (file) => {
    try {
      setImportLoading(true);
      const response = await importAdvisorsApi(file);

      if (response?.success) {
        const { imported, errors } = response.data;
        toast.success(`Import thành công ${imported} giảng viên`);

        if (errors && errors.length > 0) {
          toast.warning(`Có ${errors.length} lỗi khi import`);
        }

        fetchAdvisors();
      }
    } catch (error) {
      console.error("Error importing advisors:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi import file");
    } finally {
      setImportLoading(false);
    }

    return false;
  };

  const handleViewClasses = (advisor) => {
    navigate(`/admin/advisors/${advisor.advisor_id}/classes`, {
      state: { advisor },
    });
  };

  const handleResetPassword = async (advisor) => {
    try {
      const response = await resetAdvisorPasswordApi(advisor.advisor_id);
      if (response?.success) {
        toast.success(response?.message || "Reset mật khẩu thành công");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error?.message || "Không thể reset mật khẩu");
    }
  };

  // Open form modal for create/edit
  const handleOpenModal = (advisor = null) => {
    setEditingAdvisor(advisor);
    if (advisor) {
      form.setFieldsValue({
        user_code: advisor.user_code,
        full_name: advisor.full_name,
        email: advisor.email,
        phone_number: advisor.phone_number,
        role: advisor.role,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Close form modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingAdvisor(null);
    form.resetFields();
  };

  // Submit form (create/update)
  const handleSubmitForm = async (values) => {
    try {
      setSubmitting(true);
      let response;

      if (editingAdvisor) {
        // Update advisor
        response = await updateAdvisorApi(editingAdvisor.advisor_id, values);
      } else {
        // Create advisor
        response = await createAdvisorApi(values);
      }

      if (response?.success) {
        toast.success(
          response?.message ||
            (editingAdvisor
              ? "Cập nhật giảng viên thành công"
              : "Tạo giảng viên thành công")
        );
        handleCloseModal();
        fetchAdvisors();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete advisor
  const handleDeleteAdvisor = async (advisor) => {
    try {
      const response = await deleteAdvisorApi(advisor.advisor_id);
      if (response?.success) {
        toast.success(response?.message || "Xóa giảng viên thành công");
        fetchAdvisors();
      }
    } catch (error) {
      console.error("Error deleting advisor:", error);
      toast.error(error?.message || "Không thể xóa giảng viên");
    }
  };

  const handleOpenAvatarModal = (advisor) => {
    setAvatarAdvisor(advisor);
    setAvatarPreview(getAvatarUrl(advisor.avatar_url));
    setIsAvatarModalVisible(true);
  };

  // Close avatar upload modal
  const handleCloseAvatarModal = () => {
    setIsAvatarModalVisible(false);
    setAvatarAdvisor(null);
    setAvatarPreview(null);
  };

  // Handle avatar file selection
  const handleAvatarFileChange = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Vui lòng chọn file hình ảnh");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error("Hình ảnh phải nhỏ hơn 2MB");
      return false;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    return false;
  };

  // Upload avatar
  const handleUploadAvatar = async () => {
    if (!avatarPreview || avatarPreview === avatarAdvisor.avatar_url) {
      toast.error("Vui lòng chọn hình ảnh mới");
      return;
    }

    try {
      setAvatarUploading(true);

      // Convert data URL to file if it's a preview
      if (avatarPreview.startsWith("data:")) {
        const response = await fetch(avatarPreview);
        const blob = await response.blob();
        const file = new File([blob], "avatar.jpg", { type: blob.type });

        await uploadAdvisorAvatarApi(avatarAdvisor.advisor_id, file);
      } else {
        // If it's already a URL, we can't upload it again
        toast.error("Vui lòng chọn file từ máy tính");
        return;
      }

      toast.success("Upload ảnh đại diện thành công");
      handleCloseAvatarModal();
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      fetchAdvisors();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error?.message || "Không thể upload ảnh đại diện");
    } finally {
      setAvatarUploading(false);
    }
  };

  // --- CẤU HÌNH CỘT VỚI NÚT THAO TÁC TRÊN 1 DÒNG ---
  const columns = [
    {
      title: "Avatar",
      key: "avatar",
      width: 80,
      render: (_, record) => (
        <div className="relative group cursor-pointer">
          <Avatar
            size={50}
            icon={<UserOutlined />}
            src={getAvatarUrl(record.avatar_url)}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleOpenAvatarModal(record)}
          >
            <CameraOutlined style={{ color: "white", fontSize: "16px" }} />
          </div>
        </div>
      ),
    },
    {
      title: "Mã GV",
      dataIndex: "user_code",
      key: "user_code",
      width: 100,
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      width: 250,
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      width: 150,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role === "admin" ? "Quản trị viên" : "Cố vấn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 400, // Tăng độ rộng để đủ chỗ cho 4 nút
      render: (_, record) => (
        // Bỏ thuộc tính wrap để các nút nằm trên 1 dòng
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewClasses(record)}
            size="small"
          >
            Xem lớp
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Reset mật khẩu"
            description={`Bạn có chắc muốn reset mật khẩu cho "${record.full_name}"?`}
            onConfirm={() => handleResetPassword(record)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<LockOutlined />} size="small">
              Reset MK
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xóa giảng viên"
            description={`Bạn có chắc muốn xóa "${record.full_name}"?`}
            onConfirm={() => handleDeleteAdvisor(record)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
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
            <h1 className="text-2xl font-bold">Danh sách Giảng viên</h1>
            <p className="text-gray-500 mt-1">
              Xem danh sách giảng viên và các lớp họ quản lý
            </p>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
              disabled={downloadLoading || importLoading}
            >
              Thêm mới
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              loading={downloadLoading}
              disabled={importLoading}
            >
              Tải template
            </Button>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={handleImportAdvisors}
              disabled={downloadLoading}
            >
              <Button
                icon={<UploadOutlined />}
                loading={importLoading}
                disabled={downloadLoading}
              >
                Import Excel
              </Button>
            </Upload>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAdvisors}
              loading={loading}
              disabled={downloadLoading || importLoading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={advisors}
          rowKey="advisor_id"
          loading={loading}
          scroll={{ x: 1500 }} // Tăng scroll x để hiển thị đủ cột thao tác
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} giảng viên`,
          }}
        />
      </Card>

      {/* Create/Edit Advisor Modal */}
      <Modal
        title={
          editingAdvisor ? "Sửa thông tin giảng viên" : "Thêm giảng viên mới"
        }
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={() => form.submit()}
          >
            {editingAdvisor ? "Cập nhật" : "Thêm"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitForm}
          autoComplete="off"
        >
          <Form.Item
            label="Mã giảng viên"
            name="user_code"
            rules={[
              { required: true, message: "Vui lòng nhập mã giảng viên" },
              { min: 2, message: "Mã giảng viên tối thiểu 2 ký tự" },
              { max: 20, message: "Mã giảng viên tối đa 20 ký tự" },
            ]}
          >
            <Input placeholder="VD: GV001" disabled={!!editingAdvisor} />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            name="full_name"
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên" },
              { min: 2, message: "Họ và tên tối thiểu 2 ký tự" },
              { max: 100, message: "Họ và tên tối đa 100 ký tự" },
            ]}
          >
            <Input placeholder="VD: ThS. Trần Văn An" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              placeholder="VD: gv.an@school.edu.vn"
              disabled={!!editingAdvisor}
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone_number"
            rules={[{ max: 15, message: "Số điện thoại tối đa 15 ký tự" }]}
          >
            <Input placeholder="VD: 090123456" />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select
              placeholder="Chọn vai trò"
              options={[
                { label: "Cố vấn", value: "advisor" },
                { label: "Quản trị viên", value: "admin" },
              ]}
            />
          </Form.Item>

          {!editingAdvisor && (
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  min: 6,
                  message: "Mật khẩu phải có tối thiểu 6 ký tự",
                },
              ]}
            >
              {/* <Input.Password placeholder="VD: 123456 (để trống sẽ dùng mặc định)" /> */}
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Avatar Upload Modal */}
      <Modal
        title="Cập nhật ảnh đại diện"
        visible={isAvatarModalVisible}
        onCancel={handleCloseAvatarModal}
        footer={[
          <Button key="cancel" onClick={handleCloseAvatarModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={avatarUploading}
            onClick={handleUploadAvatar}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Spin spinning={avatarUploading}>
          <div className="text-center">
            <Avatar
              size={150}
              icon={<UserOutlined />}
              src={avatarPreview}
              style={{ backgroundColor: "#1890ff", marginBottom: "20px" }}
            />
            <div>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleAvatarFileChange}
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  Chọn ảnh
                </Button>
              </Upload>
              <p className="text-gray-500 text-sm mt-3">
                Định dạng: JPEG, PNG, JPG, GIF. Kích thước tối đa: 2MB
              </p>
            </div>
          </div>
        </Spin>
      </Modal>
    </div>
  );
};
