import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../components/context/auth.context";
import {
  Card,
  Row,
  Col,
  Avatar,
  Button,
  Spin,
  Form,
  Input,
  Modal,
  Divider,
  Tag,
  Space,
  Upload,
} from "antd";
import { toast } from "react-toastify";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CameraOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  getAccountAPI,
  updateAdvisorApi,
  changeAdminPassword,
  uploadAdvisorAvatarApi,
} from "../../services/api.service";
import { getAvatarUrl } from "../../utils/avatarHelper";

export const AdminProfile = () => {
  const { user } = useContext(AuthContext);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchAdminInfo = async () => {
    try {
      setLoading(true);
      const res = await getAccountAPI();
      if (res && res.data) {
        const adminData = res.data.data || res.data;

        // Get advisor_id from adminData or use user.id
        if (!adminData.advisor_id && user?.id) {
          adminData.advisor_id = user.id;
        }

        setAdminInfo(adminData);
        form.setFieldsValue({
          full_name: adminData.full_name,
          email: adminData.email,
          phone_number: adminData.phone_number,
          user_code: adminData.user_code,
        });
      }
    } catch (error) {
      toast.error("Lỗi khi tải thông tin");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (values) => {
    try {
      setSubmitting(true);
      let advisorId = adminInfo?.advisor_id;

      // Try to get ID from different sources
      if (!advisorId && user?.id) {
        advisorId = user.id;
      }

      if (!advisorId) {
        toast.error("Không thể lấy thông tin quản trị viên");
        return;
      }

      // Filter values to only include allowed fields for advisor update
      const updateValues = {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        user_code: values.user_code,
      };

      // Use updateAdvisorApi with advisor_id (admin is also an advisor in system)
      await updateAdvisorApi(advisorId, updateValues);
      toast.success("Cập nhật thông tin thành công");
      setEditing(false);
      fetchAdminInfo();
    } catch (error) {
      toast.error(error?.message || "Lỗi khi cập nhật thông tin");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAvatarModal = () => {
    setAvatarPreview(null);
    setIsAvatarModalVisible(true);
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalVisible(false);
    setAvatarPreview(null);
  };

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

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    return false;
  };

  const handleChangePassword = async (values) => {
    try {
      setPasswordLoading(true);
      const res = await changeAdminPassword(
        values.current_password,
        values.new_password,
        values.new_password_confirmation
      );
      if (res) {
        toast.success(res.message);
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Lỗi khi đổi mật khẩu";
      toast.error(errorMessage);

      if (errorMessage.includes("Mật khẩu hiện tại không đúng")) {
        passwordForm.setFields([
          {
            name: "current_password",
            errors: [errorMessage],
          },
        ]);
      }
      console.error("Change password error:", error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUploadAvatarNew = async () => {
    if (!avatarPreview) {
      toast.error("Vui lòng chọn hình ảnh mới để cập nhật");
      return;
    }

    if (!adminInfo?.advisor_id) {
      toast.error("Không thể lấy thông tin quản trị viên");
      return;
    }

    try {
      setAvatarUploading(true);

      // Convert data URL to file
      if (avatarPreview.startsWith("data:")) {
        const response = await fetch(avatarPreview);
        const blob = await response.blob();
        const file = new File([blob], "avatar.jpg", { type: blob.type });

        await uploadAdvisorAvatarApi(adminInfo.advisor_id, file);
        toast.success("Upload ảnh đại diện thành công");
        handleCloseAvatarModal();
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        fetchAdminInfo();
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error?.message || "Không thể upload ảnh đại diện");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: "#c8102e",
          }}
        >
          👤 Thông tin cá nhân
        </h1>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "inline-block",
                marginBottom: 20,
                cursor: "pointer",
              }}
            >
              <Avatar
                size={120}
                src={getAvatarUrl(adminInfo?.avatar_url)}
                style={{
                  background:
                    "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                }}
              >
                {adminInfo?.full_name?.charAt(0) || "A"}
              </Avatar>
              <Button
                type="primary"
                icon={<CameraOutlined />}
                size="small"
                shape="circle"
                onClick={handleOpenAvatarModal}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: "#c8102e",
                  border: "2px solid white",
                }}
              />
            </div>
            <h2
              style={{
                margin: "16px 0 8px 0",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {adminInfo?.full_name}
            </h2>
            <p style={{ margin: 0, color: "#999", fontSize: 14 }}>
              Mã quản trị: {adminInfo?.user_code}
            </p>
            <Divider />
            <div style={{ textAlign: "left" }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#999", fontSize: 12 }}>EMAIL</span>
                <p style={{ margin: "4px 0 0 0", fontWeight: 500 }}>
                  {adminInfo?.email}
                </p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#999", fontSize: 12 }}>ĐIỆN THOẠI</span>
                <p style={{ margin: "4px 0 0 0", fontWeight: 500 }}>
                  {adminInfo?.phone_number || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </Card>

          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginTop: 20,
            }}
            title="Thống kê"
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{ fontSize: 24, fontWeight: 700, color: "#c8102e" }}
                >
                  Admin
                </div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  Vai trò
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600 }}>
                  📋 Thông tin chi tiết
                </span>
                {!editing && (
                  <Space>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setEditing(true)}
                      style={{ background: "#c8102e", border: "none" }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      icon={<LockOutlined />}
                      onClick={() => setIsPasswordModalVisible(true)}
                      style={{
                        background: "#722ed1",
                        color: "white",
                        border: "none",
                      }}
                    >
                      Đổi mật khẩu
                    </Button>
                  </Space>
                )}
              </div>
            }
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {editing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveProfile}
                style={{ marginTop: 20 }}
              >
                <Form.Item
                  label="Tên đầy đủ"
                  name="full_name"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input placeholder="Nhập tên đầy đủ" />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input placeholder="Nhập email" disabled />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="phone_number">
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item label="Mã quản trị" name="user_code">
                  <Input placeholder="Mã quản trị" disabled />
                </Form.Item>
                <Divider />
                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={submitting}
                    style={{
                      background:
                        "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                      border: "none",
                      borderRadius: 6,
                    }}
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setEditing(false);
                      fetchAdminInfo();
                    }}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form>
            ) : (
              <div style={{ marginTop: 20 }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <span style={{ color: "#999", fontSize: 12 }}>
                        TÊN ĐẦY ĐỦ
                      </span>
                      <p
                        style={{
                          margin: "8px 0 0 0",
                          fontWeight: 500,
                          fontSize: 16,
                        }}
                      >
                        {adminInfo?.full_name}
                      </p>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <span style={{ color: "#999", fontSize: 12 }}>EMAIL</span>
                      <p
                        style={{
                          margin: "8px 0 0 0",
                          fontWeight: 500,
                          fontSize: 16,
                        }}
                      >
                        {adminInfo?.email}
                      </p>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <span style={{ color: "#999", fontSize: 12 }}>
                        SỐ ĐIỆN THOẠI
                      </span>
                      <p
                        style={{
                          margin: "8px 0 0 0",
                          fontWeight: 500,
                          fontSize: 16,
                        }}
                      >
                        {adminInfo?.phone_number || "Chưa cập nhật"}
                      </p>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <span style={{ color: "#999", fontSize: 12 }}>
                        MÃ QUẢN TRỊ
                      </span>
                      <p
                        style={{
                          margin: "8px 0 0 0",
                          fontWeight: 500,
                          fontSize: 16,
                        }}
                      >
                        {adminInfo?.user_code}
                      </p>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Card>

          <Card
            title="🔐 Bảo mật"
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginTop: 20,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Mật khẩu</span>
                <Button onClick={() => setIsPasswordModalVisible(true)}>
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
            <Divider style={{ margin: "16px 0" }} />
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Xác thực hai yếu tố</span>
                <Tag color="default">Chưa bật</Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Avatar Upload Modal */}
      <Modal
        title="Cập nhật ảnh đại diện"
        open={isAvatarModalVisible}
        onCancel={handleCloseAvatarModal}
        footer={[
          <Button key="cancel" onClick={handleCloseAvatarModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={avatarUploading}
            onClick={handleUploadAvatarNew}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Spin spinning={avatarUploading}>
          <div style={{ textAlign: "center" }}>
            <Avatar
              size={150}
              src={avatarPreview || getAvatarUrl(adminInfo?.avatar_url)}
              style={{
                background: "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                marginBottom: "20px",
              }}
            >
              {adminInfo?.full_name?.charAt(0) || "A"}
            </Avatar>
            <div>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleAvatarFileChange}
              >
                <Button type="primary" icon={<CameraOutlined />}>
                  Chọn ảnh
                </Button>
              </Upload>
              <p style={{ color: "#999", fontSize: 12, marginTop: 12 }}>
                Định dạng: JPEG, PNG, JPG, GIF. Kích thước tối đa: 2MB
              </p>
            </div>
          </div>
        </Spin>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LockOutlined style={{ fontSize: 20, color: "#722ed1" }} />
            <span>Đổi mật khẩu</span>
          </div>
        }
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={450}
        bodyStyle={{ paddingTop: 20 }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          autoComplete="off"
        >
          <Form.Item
            label={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LockOutlined style={{ color: "#722ed1" }} />
                <span>Mật khẩu hiện tại</span>
              </div>
            }
            name="current_password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" size="large" />
          </Form.Item>
          <Form.Item
            label={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LockOutlined style={{ color: "#722ed1" }} />
                <span>Mật khẩu mới</span>
              </div>
            }
            name="new_password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
          </Form.Item>
          <Form.Item
            label={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LockOutlined style={{ color: "#722ed1" }} />
                <span>Xác nhận mật khẩu mới</span>
              </div>
            }
            name="new_password_confirmation"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Xác nhận mật khẩu mới" size="large" />
          </Form.Item>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={passwordLoading}
              style={{
                background: "#722ed1",
                border: "none",
                flex: 1,
                fontWeight: 600,
                borderRadius: 8,
                height: 40,
              }}
            >
              Xác nhận
            </Button>
            <Button
              onClick={() => {
                setIsPasswordModalVisible(false);
                passwordForm.resetFields();
              }}
              disabled={passwordLoading}
              style={{
                flex: 1,
                fontWeight: 600,
                borderRadius: 8,
                height: 40,
              }}
            >
              Hủy
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProfile;
