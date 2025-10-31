import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import { StudentLayout } from "../components/layout/StudentLayout";
import { getAccountAPI } from "../services/api.service";
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
  Space,
  Upload,
  Statistic,
  Divider,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CameraOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export const StudentProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  const fetchStudentInfo = async () => {
    try {
      setLoading(true);
      const res = await getAccountAPI();
      if (res && res.data) {
        setStudentInfo(res.data);
        form.setFieldsValue({
          full_name: res.data.full_name,
          email: res.data.email,
          phone_number: res.data.phone_number,
        });
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

  const handleCancel = () => {
    setEditing(false);
    form.setFieldsValue({
      full_name: studentInfo?.full_name,
      email: studentInfo?.email,
      phone_number: studentInfo?.phone_number,
    });
  };

  const handleAvatarUpload = () => {
    message.info("Chức năng tải ảnh đại diện sắp có!");
    return false;
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
                            src={studentInfo.avatar_url}
                            icon={<UserOutlined />}
                            style={{
                              background:
                                "linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)",
                              border: "6px solid white",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              fontSize: 60,
                            }}
                          />
                          {editing && (
                            <Upload
                              maxCount={1}
                              beforeUpload={handleAvatarUpload}
                              style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                              }}
                            >
                              <Button
                                type="primary"
                                shape="circle"
                                icon={<CameraOutlined />}
                                size="large"
                                style={{
                                  background: "#1890ff",
                                  border: "4px solid white",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                  width: 50,
                                  height: 50,
                                  fontSize: 24,
                                }}
                              />
                            </Upload>
                          )}
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
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                              marginBottom: 16,
                              flexWrap: "wrap",
                            }}
                          >
                            <Tag
                              color="blue"
                              style={{
                                padding: "6px 14px",
                                fontSize: 13,
                                fontWeight: 600,
                                borderRadius: 6,
                              }}
                            >
                              🆔 {studentInfo.user_code}
                            </Tag>
                            <Tag
                              color={
                                studentInfo.student?.status === "studying"
                                  ? "green"
                                  : "orange"
                              }
                              style={{
                                padding: "6px 14px",
                                fontSize: 13,
                                fontWeight: 600,
                                borderRadius: 6,
                              }}
                            >
                              {studentInfo.student?.status === "studying"
                                ? "🎓 Đang học"
                                : "⏸️ Tạm dừng"}
                            </Tag>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              color: "#666",
                              fontSize: 14,
                            }}
                          >
                            📅 Đã tạo:{" "}
                            <strong>
                              {new Date(
                                studentInfo.created_at
                              ).toLocaleDateString("vi-VN")}
                            </strong>
                          </p>
                        </div>
                      </div>

                      {/* Edit/Save Buttons */}
                      <div style={{ paddingTop: 12, flexShrink: 0 }}>
                        {!editing ? (
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setEditing(true)}
                            size="large"
                            style={{
                              background: "#1890ff",
                              border: "none",
                              fontWeight: 600,
                              borderRadius: 8,
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                        ) : (
                          <Space>
                            <Button
                              type="primary"
                              icon={<SaveOutlined />}
                              onClick={() => form.submit()}
                              loading={loading}
                              style={{
                                background: "#52c41a",
                                border: "none",
                                fontWeight: 600,
                                borderRadius: 8,
                              }}
                            >
                              Lưu
                            </Button>
                            <Button
                              icon={<CloseOutlined />}
                              onClick={handleCancel}
                              disabled={loading}
                              style={{
                                borderRadius: 8,
                              }}
                            >
                              Hủy
                            </Button>
                          </Space>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Personal Info */}
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
                    {/* Họ và tên */}
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
                          value={
                            editing
                              ? form.getFieldValue("full_name") ||
                                studentInfo.full_name
                              : studentInfo.full_name
                          }
                          onChange={(e) => {
                            if (editing) {
                              form.setFieldValue("full_name", e.target.value);
                            }
                          }}
                          disabled={!editing}
                          placeholder="Họ và tên"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 14,
                            borderRadius: 8,
                            border: editing
                              ? "2px solid #1890ff"
                              : "1px solid #e0e0e0",
                            backgroundColor: editing ? "#fff" : "#fafafa",
                            color: "#333",
                            transition: "all 0.3s",
                            boxSizing: "border-box",
                            cursor: editing ? "text" : "default",
                          }}
                          onFocus={(e) => {
                            if (editing) {
                              e.target.style.boxShadow =
                                "0 0 0 3px rgba(24, 144, 255, 0.1)";
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    </Col>

                    {/* Mã sinh viên */}
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
                            color: "#999",
                            boxSizing: "border-box",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </Col>

                    {/* Email */}
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
                          value={
                            editing
                              ? form.getFieldValue("email") || studentInfo.email
                              : studentInfo.email
                          }
                          onChange={(e) => {
                            if (editing) {
                              form.setFieldValue("email", e.target.value);
                            }
                          }}
                          disabled={!editing}
                          placeholder="Email"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 14,
                            borderRadius: 8,
                            border: editing
                              ? "2px solid #1890ff"
                              : "1px solid #e0e0e0",
                            backgroundColor: editing ? "#fff" : "#fafafa",
                            color: "#333",
                            transition: "all 0.3s",
                            boxSizing: "border-box",
                            cursor: editing ? "text" : "default",
                          }}
                          onFocus={(e) => {
                            if (editing) {
                              e.target.style.boxShadow =
                                "0 0 0 3px rgba(24, 144, 255, 0.1)";
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    </Col>

                    {/* Số điện thoại */}
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
                          value={
                            editing
                              ? form.getFieldValue("phone_number") ||
                                studentInfo.phone_number
                              : studentInfo.phone_number
                          }
                          onChange={(e) => {
                            if (editing) {
                              form.setFieldValue(
                                "phone_number",
                                e.target.value
                              );
                            }
                          }}
                          disabled={!editing}
                          placeholder="Số điện thoại"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontSize: 14,
                            borderRadius: 8,
                            border: editing
                              ? "2px solid #1890ff"
                              : "1px solid #e0e0e0",
                            backgroundColor: editing ? "#fff" : "#fafafa",
                            color: "#333",
                            transition: "all 0.3s",
                            boxSizing: "border-box",
                            cursor: editing ? "text" : "default",
                          }}
                          onFocus={(e) => {
                            if (editing) {
                              e.target.style.boxShadow =
                                "0 0 0 3px rgba(24, 144, 255, 0.1)";
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    </Col>

                    {/* Buttons */}
                    <Col xs={24}>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          justifyContent: "flex-end",
                          paddingTop: 8,
                        }}
                      >
                        {!editing ? (
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setEditing(true)}
                            size="large"
                            style={{
                              background: "#1890ff",
                              border: "none",
                              fontWeight: 600,
                              borderRadius: 8,
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="primary"
                              icon={<SaveOutlined />}
                              onClick={() => form.submit()}
                              loading={loading}
                              style={{
                                background: "#52c41a",
                                border: "none",
                                fontWeight: 600,
                                borderRadius: 8,
                              }}
                            >
                              Lưu
                            </Button>
                            <Button
                              icon={<CloseOutlined />}
                              onClick={handleCancel}
                              disabled={loading}
                              style={{
                                borderRadius: 8,
                              }}
                            >
                              Hủy
                            </Button>
                          </>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* Academic Info */}
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
                      {/* Class Info */}
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

                      {/* Faculty Info */}
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

                      {/* Status */}
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

                {/* Quick Stats Section */}
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
                    {/* Email Status */}
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
                        <div
                          style={{
                            fontSize: 32,
                            marginBottom: 12,
                          }}
                        >
                          📧
                        </div>
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
                          color={studentInfo.email ? "red" : "default"}
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

                    {/* Phone Status */}
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
                        <div
                          style={{
                            fontSize: 32,
                            marginBottom: 12,
                          }}
                        >
                          📱
                        </div>
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

                    {/* Academic Status */}
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
                        <div
                          style={{
                            fontSize: 32,
                            marginBottom: 12,
                          }}
                        >
                          🎓
                        </div>
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

                    {/* Creation Date */}
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
                        <div
                          style={{
                            fontSize: 32,
                            marginBottom: 12,
                          }}
                        >
                          📅
                        </div>
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
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
