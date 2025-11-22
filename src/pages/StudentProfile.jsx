import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../components/context/auth.context";
import { StudentLayout } from "../components/layout/StudentLayout";
import {
  getAccountAPI,
  uploadStudentAvatarApi,
  changeStudentPassword,
} from "../services/api.service";
import { getAvatarUrl } from "../utils/avatarHelper";
import {
  Card,
  Row,
  Col,
  Avatar,
  Button,
  Spin,
  Form,
  Input,
  message,
  Tag,
  Upload,
  Modal,
  Tooltip,
} from "antd";
import { CameraOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const StudentProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // State cho Avatar Modal
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // State cho Password Modal
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const uploadRef = useRef(null);

  const fetchStudentInfo = async () => {
    try {
      setLoading(true);
      const res = await getAccountAPI();
      if (res && res.data) {
        setStudentInfo(res.data);
      }
    } catch (error) {
      message.error("Lỗi khi tải thông tin hồ sơ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/login");
      return;
    }
    fetchStudentInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // --- Xử lý Modal Avatar ---
  const handleOpenAvatarModal = () => {
    setAvatarPreview(null); // Reset preview mỗi khi mở modal
    setIsAvatarModalVisible(true);
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalVisible(false);
    setAvatarPreview(null);
  };

  const handleAvatarSelect = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error("Kích thước file không được vượt quá 2MB");
      return false;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      message.error("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF)");
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // Ngăn không cho Upload component tự động upload
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) {
      message.error("Vui lòng chọn hình ảnh mới để cập nhật");
      return;
    }

    try {
      setAvatarUploading(true);

      // Xử lý file từ base64
      const base64Data = avatarPreview.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], "avatar.jpg", { type: "image/jpeg" });

      const studentId = studentInfo?.student_id || user?.id;
      if (!studentId) {
        message.error("Không tìm thấy ID sinh viên");
        return;
      }

      const res = await uploadStudentAvatarApi(studentId, file);
      if (res && res.data) {
        message.success("Upload ảnh đại diện thành công");
        setStudentInfo({
          ...studentInfo,
          avatar_url: res.data.avatar_url,
        });
        handleCloseAvatarModal();
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Lỗi khi upload ảnh");
      console.error("Avatar upload error:", error);
    } finally {
      setAvatarUploading(false);
    }
  };
  // --------------------------

  const handleChangePassword = async (values) => {
    try {
      setPasswordLoading(true);
      const res = await changeStudentPassword(
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
      toast.error(error.message);

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

  return (
    <StudentLayout>
      <div
        style={{
          padding: "32px 24px",
          backgroundColor: "#f5f5f5",
          flex: 1,
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Spin spinning={loading}>
            {studentInfo && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {/* Avatar & Basic Info Card */}
                <Card
                  style={{
                    borderRadius: 16,
                    border: "none",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Gradient Background Banner */}
                  <div
                    style={{
                      height: 140,
                      background:
                        "linear-gradient(135deg, #c8102e 0%, #8b0d1f 100%)",
                    }}
                  />

                  {/* Avatar & Name Container */}
                  <div
                    style={{
                      padding: "0 32px 32px 32px",
                      marginTop: "-60px",
                      position: "relative",
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 32,
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", gap: 24, flex: 1 }}>
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <Avatar
                            size={140}
                            src={getAvatarUrl(studentInfo.avatar_url)}
                            icon={<UserOutlined />}
                            style={{
                              background:
                                "linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)",
                              border: "6px solid white",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              fontSize: 60,
                            }}
                          />
                          {/* SỬA: Nút mở Modal Avatar (Không bọc Upload ở đây nữa) */}
                          <Tooltip title="Đổi ảnh đại diện">
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<CameraOutlined />}
                              size="large"
                              onClick={handleOpenAvatarModal} // Gọi hàm mở modal
                              style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                background: "#1890ff",
                                border: "4px solid white",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                width: 50,
                                height: 50,
                                fontSize: 24,
                                cursor: "pointer",
                              }}
                            />
                          </Tooltip>
                        </div>

                        {/* Name & Tags */}
                        <div style={{ flex: 1, paddingTop: 12 }}>
                          <h2
                            style={{
                              margin: "0 0 12px 0",
                              fontSize: 32,
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            {studentInfo.full_name}
                          </h2>
                        </div>
                      </div>

                      {/* Password Button */}
                      <div style={{ paddingTop: 12, flexShrink: 0 }}>
                        <Button
                          icon={<LockOutlined />}
                          onClick={() => setIsPasswordModalVisible(true)}
                          size="large"
                          style={{
                            background: "#722ed1",
                            color: "white",
                            border: "none",
                            fontWeight: 600,
                            borderRadius: 8,
                          }}
                        >
                          Đổi mật khẩu
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ... (Phần Card Thông tin cá nhân, Học tập, Thống kê giữ nguyên) ... */}
                <Card
                  title={
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#1f1f1f",
                      }}
                    >
                      📋 Thông tin cá nhân
                    </h3>
                  }
                  style={{
                    borderRadius: 16,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  headStyle={{
                    borderBottom: "2px solid #f0f0f0",
                    paddingBottom: 16,
                  }}
                >
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <div>
                        <label
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            display: "block",
                            marginBottom: 8,
                            color: "#333",
                          }}
                        >
                          👤 Họ và tên
                        </label>
                        <input
                          type="text"
                          value={studentInfo.full_name}
                          disabled
                          placeholder="Họ và tên"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 14,
                            borderRadius: 8,
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa",
                            color: "#555",
                            boxSizing: "border-box",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <label
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            display: "block",
                            marginBottom: 8,
                            color: "#333",
                          }}
                        >
                          🆔 Mã sinh viên
                        </label>
                        <input
                          type="text"
                          value={studentInfo.user_code}
                          disabled
                          placeholder="Mã sinh viên"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 14,
                            borderRadius: 8,
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa",
                            color: "#555",
                            boxSizing: "border-box",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <label
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            display: "block",
                            marginBottom: 8,
                            color: "#333",
                          }}
                        >
                          📧 Email
                        </label>
                        <input
                          type="email"
                          value={studentInfo.email}
                          disabled
                          placeholder="Email"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 14,
                            borderRadius: 8,
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa",
                            color: "#555",
                            boxSizing: "border-box",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <label
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            display: "block",
                            marginBottom: 8,
                            color: "#333",
                          }}
                        >
                          📱 Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={studentInfo.phone_number}
                          disabled
                          placeholder="Số điện thoại"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 14,
                            borderRadius: 8,
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa",
                            color: "#555",
                            boxSizing: "border-box",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* ... (Phần Academic Info và Stats giữ nguyên) ... */}
                {studentInfo.student && (
                  <Card
                    title={
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#1f1f1f",
                        }}
                      >
                        🎓 Thông tin học tập
                      </h3>
                    }
                    style={{
                      borderRadius: 16,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                    headStyle={{
                      borderBottom: "2px solid #f0f0f0",
                      paddingBottom: 16,
                    }}
                  >
                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={12} lg={8}>
                        <Card
                          style={{
                            background:
                              "linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)",
                            border: "2px solid #91d5ff",
                            borderRadius: 12,
                          }}
                          bodyStyle={{ padding: 20 }}
                          hoverable
                        >
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, marginBottom: 12 }}>
                              📚
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#0050b3",
                                fontWeight: 600,
                                marginBottom: 8,
                              }}
                            >
                              LỚP HỌC
                            </div>
                            <div
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#1890ff",
                                marginBottom: 8,
                              }}
                            >
                              {studentInfo.student.class?.class_name}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#666",
                                fontStyle: "italic",
                              }}
                            >
                              {studentInfo.student.class?.description}
                            </div>
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card
                          style={{
                            background:
                              "linear-gradient(135deg, #f6ffed 0%, #f0fde4 100%)",
                            border: "2px solid #b7eb8f",
                            borderRadius: 12,
                          }}
                          bodyStyle={{ padding: 20 }}
                          hoverable
                        >
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, marginBottom: 12 }}>
                              🏛️
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#274a01",
                                fontWeight: 600,
                                marginBottom: 8,
                              }}
                            >
                              KHOA/BỘ MÔN
                            </div>
                            <div
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#52c41a",
                                marginBottom: 8,
                              }}
                            >
                              {studentInfo.student.class?.faculty?.unit_name}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#666",
                                fontStyle: "italic",
                              }}
                            >
                              {studentInfo.student.class?.faculty?.description}
                            </div>
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card
                          style={{
                            background:
                              studentInfo.student?.status === "studying"
                                ? "linear-gradient(135deg, #f6ffed 0%, #f0fde4 100%)"
                                : "linear-gradient(135deg, #fff7e6 0%, #fff9e6 100%)",
                            border:
                              studentInfo.student?.status === "studying"
                                ? "2px solid #b7eb8f"
                                : "2px solid #ffd591",
                            borderRadius: 12,
                          }}
                          bodyStyle={{ padding: 20 }}
                          hoverable
                        >
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, marginBottom: 12 }}>
                              {studentInfo.student?.status === "studying"
                                ? "✅"
                                : "⏸️"}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color:
                                  studentInfo.student?.status === "studying"
                                    ? "#274a01"
                                    : "#9d4d05",
                                fontWeight: 600,
                                marginBottom: 8,
                              }}
                            >
                              TRẠNG THÁI HỌC TẬP
                            </div>
                            <div
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color:
                                  studentInfo.student?.status === "studying"
                                    ? "#52c41a"
                                    : "#fa8c16",
                                marginBottom: 8,
                              }}
                            >
                              {studentInfo.student?.status === "studying"
                                ? "Đang học"
                                : "Tạm dừng"}
                            </div>
                            <Tag
                              color={
                                studentInfo.student?.status === "studying"
                                  ? "green"
                                  : "orange"
                              }
                              style={{
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {studentInfo.student?.status === "studying"
                                ? "Hoạt động"
                                : "Tạm dừng"}
                            </Tag>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                )}
                {/* Stats */}
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 16,
                      color: "#1f1f1f",
                    }}
                  >
                    📊 Thống kê nhanh
                  </h3>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                      <Card
                        style={{
                          background:
                            "linear-gradient(135deg, #fff1f0 0%, #ffe7e7 100%)",
                          border: "2px solid #ffccc7",
                          borderRadius: 12,
                          textAlign: "center",
                        }}
                        bodyStyle={{ padding: 20 }}
                        hoverable
                      >
                        <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#333",
                            fontWeight: 600,
                            marginBottom: 12,
                          }}
                        >
                          Email
                        </div>
                        <Tag
                          color={studentInfo.email ? "blue" : "default"}
                          style={{
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                          }}
                        >
                          {studentInfo.email ? "✓ Xác minh" : "✗ Chưa xác minh"}
                        </Tag>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card
                        style={{
                          background:
                            "linear-gradient(135deg, #f6ffed 0%, #f0fde4 100%)",
                          border: "2px solid #b7eb8f",
                          borderRadius: 12,
                          textAlign: "center",
                        }}
                        bodyStyle={{ padding: 20 }}
                        hoverable
                      >
                        <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#333",
                            fontWeight: 600,
                            marginBottom: 12,
                          }}
                        >
                          Số điện thoại
                        </div>
                        <Tag
                          color={studentInfo.phone_number ? "green" : "default"}
                          style={{
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                          }}
                        >
                          {studentInfo.phone_number ? "✓ Có" : "✗ Chưa có"}
                        </Tag>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card
                        style={{
                          background:
                            "linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)",
                          border: "2px solid #91d5ff",
                          borderRadius: 12,
                          textAlign: "center",
                        }}
                        bodyStyle={{ padding: 20 }}
                        hoverable
                      >
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#333",
                            fontWeight: 600,
                            marginBottom: 12,
                          }}
                        >
                          Trạng thái
                        </div>
                        <Tag
                          color={
                            studentInfo.student?.status === "studying"
                              ? "blue"
                              : "orange"
                          }
                          style={{
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                          }}
                        >
                          {studentInfo.student?.status === "studying"
                            ? "✓ Đang học"
                            : "⏸️ Tạm dừng"}
                        </Tag>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card
                        style={{
                          background:
                            "linear-gradient(135deg, #f9f0ff 0%, #fce7f3 100%)",
                          border: "2px solid #f759ab",
                          borderRadius: 12,
                          textAlign: "center",
                        }}
                        bodyStyle={{ padding: 20 }}
                        hoverable
                      >
                        <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#333",
                            fontWeight: 600,
                            marginBottom: 12,
                          }}
                        >
                          Ngày tạo
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#666",
                            fontWeight: 600,
                          }}
                        >
                          {new Date(studentInfo.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </div>
            )}
          </Spin>
        </div>

        {/* SỬA: Avatar Upload Modal - Dùng Modal component chuẩn */}
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
              onClick={handleAvatarUpload}
            >
              Cập nhật
            </Button>,
          ]}
        >
          <Spin spinning={avatarUploading}>
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={150}
                // Hiển thị preview nếu có, không thì hiển thị ảnh hiện tại
                src={avatarPreview || getAvatarUrl(studentInfo?.avatar_url)}
                icon={<UserOutlined />}
                style={{
                  marginBottom: "20px",
                  border: "4px solid #f0f0f0",
                }}
              />
              <div>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleAvatarSelect}
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
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
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
    </StudentLayout>
  );
};

export default StudentProfile;
