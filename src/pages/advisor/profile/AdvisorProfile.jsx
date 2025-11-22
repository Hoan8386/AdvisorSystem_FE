import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../components/context/auth.context";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
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
  uploadAdvisorAvatarApi,
  changeAdvisorPassword,
} from "../../../services/api.service";
import { getAvatarUrl } from "../../../utils/avatarHelper";

export const AdvisorProfile = () => {
  const { user } = useContext(AuthContext);
  const [advisorInfo, setAdvisorInfo] = useState(null);
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

  const fetchAdvisorInfo = async () => {
    try {
      setLoading(true);
      const res = await getAccountAPI();
      if (res && res.data) {
        // Handle both direct data and nested data structure
        const advisorData = res.data.data || res.data;

        // Add advisor_id from user context if not present in API response
        if (!advisorData.advisor_id && user?.id) {
          advisorData.advisor_id = user.id;
        }

        setAdvisorInfo(advisorData);
        form.setFieldsValue({
          full_name: advisorData.full_name,
          email: advisorData.email,
          phone_number: advisorData.phone_number,
          user_code: advisorData.user_code,
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
    fetchAdvisorInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (values) => {
    try {
      setSubmitting(true);
      if (!advisorInfo?.advisor_id) {
        toast.error("Không thể lấy thông tin giảng viên");
        return;
      }
      await updateAdvisorApi(advisorInfo.advisor_id, values);
      toast.success("Cập nhật thông tin thành công");
      setEditing(false);
      fetchAdvisorInfo();
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

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    return false;
  };

  const handleUploadAvatar = async () => {
    if (!avatarPreview) {
      toast.error("Vui lòng chọn hình ảnh mới để cập nhật"); // Sửa nhẹ thông báo cho rõ
      return;
    }

    if (!advisorInfo?.advisor_id) {
      toast.error("Không thể lấy thông tin giảng viên");
      return;
    }

    try {
      setAvatarUploading(true);

      // Convert data URL to file
      if (avatarPreview.startsWith("data:")) {
        const response = await fetch(avatarPreview);
        const blob = await response.blob();
        const file = new File([blob], "avatar.jpg", { type: blob.type });

        await uploadAdvisorAvatarApi(advisorInfo.advisor_id, file);
        toast.success("Upload ảnh đại diện thành công");
        handleCloseAvatarModal();
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        fetchAdvisorInfo();
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error?.message || "Không thể upload ảnh đại diện");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setPasswordLoading(true);
      const res = await changeAdvisorPassword(
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

  if (loading) {
    return (
      <AdvisorLayout>
        <div
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        >
          <Spin size="large" />
        </div>
      </AdvisorLayout>
    );
  }

  return (
    <AdvisorLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* ... (Phần Header và Card thông tin giữ nguyên không thay đổi) ... */}
        {/* Tôi lược bớt phần trên để tập trung vào Modal bên dưới */}

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
                  src={getAvatarUrl(advisorInfo?.avatar_url)}
                  style={{
                    background:
                      "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                  }}
                >
                  {advisorInfo?.full_name?.charAt(0) || "A"}
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
                {advisorInfo?.full_name}
              </h2>
              <p style={{ margin: 0, color: "#999", fontSize: 14 }}>
                Mã giáo viên: {advisorInfo?.user_code}
              </p>
              <Divider />
              <div style={{ textAlign: "left" }}>
                {/* Nội dung chi tiết bên trái */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "#999", fontSize: 12 }}>EMAIL</span>
                  <p style={{ margin: "4px 0 0 0", fontWeight: 500 }}>
                    {advisorInfo?.email}
                  </p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "#999", fontSize: 12 }}>
                    ĐIỆN THOẠI
                  </span>
                  <p style={{ margin: "4px 0 0 0", fontWeight: 500 }}>
                    {advisorInfo?.phone_number || "Chưa cập nhật"}
                  </p>
                </div>
                {advisorInfo?.unit && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: "#999", fontSize: 12 }}>
                      KHOA/BỘ MÔN
                    </span>
                    <p style={{ margin: "4px 0 0 0", fontWeight: 500 }}>
                      {advisorInfo.unit.unit_name}
                    </p>
                  </div>
                )}
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
                    {advisorInfo?.classes?.length || 0}
                  </div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    Lớp học
                  </div>
                </div>
              </div>
            </Card>

            {/* ... Phần Classes Card ... */}
          </Col>

          {/* ... Phần Form Edit bên phải ... */}
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
                  <Form.Item label="Mã giáo viên" name="user_code">
                    <Input placeholder="Mã giáo viên" disabled />
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
                        fetchAdvisorInfo();
                      }}
                    >
                      Hủy
                    </Button>
                  </Space>
                </Form>
              ) : (
                <div style={{ marginTop: 20 }}>
                  {/* Hiển thị thông tin khi không edit */}
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
                          {advisorInfo?.full_name}
                        </p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <span style={{ color: "#999", fontSize: 12 }}>
                          EMAIL
                        </span>
                        <p
                          style={{
                            margin: "8px 0 0 0",
                            fontWeight: 500,
                            fontSize: 16,
                          }}
                        >
                          {advisorInfo?.email}
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
                          {advisorInfo?.phone_number || "Chưa cập nhật"}
                        </p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <span style={{ color: "#999", fontSize: 12 }}>
                          MÃ GIÁO VIÊN
                        </span>
                        <p
                          style={{
                            margin: "8px 0 0 0",
                            fontWeight: 500,
                            fontSize: 16,
                          }}
                        >
                          {advisorInfo?.user_code}
                        </p>
                      </div>
                    </Col>
                    <Col xs={24}>
                      <div>
                        <span style={{ color: "#999", fontSize: 12 }}>
                          KHOA/BỘ MÔN
                        </span>
                        <p
                          style={{
                            margin: "8px 0 0 0",
                            fontWeight: 500,
                            fontSize: 16,
                          }}
                        >
                          {advisorInfo?.unit?.unit_name || "N/A"}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </Card>
            {/* Card Bảo mật... */}
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
                  <Button
                    onClick={() => toast.info("Chức năng sẽ được cập nhật")}
                  >
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

        {/* Avatar Upload Modal - ĐÂY LÀ PHẦN ĐÃ SỬA */}
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
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={150}
                // THAY ĐỔI TẠI ĐÂY: Nếu có avatarPreview thì dùng, nếu không thì dùng ảnh hiện tại
                src={avatarPreview || getAvatarUrl(advisorInfo?.avatar_url)}
                style={{
                  background:
                    "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                  marginBottom: "20px",
                }}
              >
                {advisorInfo?.full_name?.charAt(0) || "A"}
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

        {/* Change Password Modal - Giữ nguyên */}
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
          {/* ... Nội dung form đổi mật khẩu giữ nguyên ... */}
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
              <Input.Password
                placeholder="Nhập mật khẩu hiện tại"
                size="large"
              />
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
              <Input.Password
                placeholder="Xác nhận mật khẩu mới"
                size="large"
              />
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
    </AdvisorLayout>
  );
};

export default AdvisorProfile;
