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
  message,
  Divider,
  Tag,
  Space,
  Upload,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAccountAPI } from "../../../services/api.service";

export const AdvisorProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [advisorInfo, setAdvisorInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAdvisorInfo();
  }, []);

  const fetchAdvisorInfo = async () => {
    try {
      setLoading(true);
      const res = await getAccountAPI();
      if (res && res.data) {
        setAdvisorInfo(res.data);
        form.setFieldsValue({
          full_name: res.data.full_name,
          email: res.data.email,
          phone_number: res.data.phone_number,
          user_code: res.data.user_code,
        });
      }
    } catch (error) {
      message.error("Lỗi khi tải thông tin");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values) => {
    try {
      // TODO: Call update API
      message.success("Cập nhật thông tin thành công");
      setEditing(false);
      fetchAdvisorInfo();
    } catch (error) {
      message.error("Lỗi khi cập nhật thông tin");
    }
  };

  const handleChangeAvatar = (info) => {
    if (info.file.status === "done") {
      message.success("Cập nhật ảnh đại diện thành công");
      // Update avatar in state
    } else if (info.file.status === "error") {
      message.error("Lỗi khi tải ảnh");
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
        {/* Header */}
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
          {/* Left: Avatar & Basic Info */}
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
                }}
              >
                <Avatar
                  size={120}
                  src={advisorInfo?.avatar_url}
                  style={{
                    background:
                      "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                  }}
                >
                  {advisorInfo?.full_name?.charAt(0) || "A"}
                </Avatar>
                <Upload
                  showUploadList={false}
                  action="https://api.example.com/upload"
                  onChange={handleChangeAvatar}
                >
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    size="small"
                    shape="circle"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: "#c8102e",
                      border: "2px solid white",
                    }}
                  />
                </Upload>
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
                {advisorInfo?.advisor?.unit && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: "#999", fontSize: 12 }}>
                      KHOA/BỘ MÔN
                    </span>
                    <p style={{ margin: "4px 0 0 0", fontWeight: 500 }}>
                      {advisorInfo.advisor.unit.unit_name}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Statistics Card */}
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
                    {advisorInfo?.advisor?.classes?.length || 0}
                  </div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    Lớp học
                  </div>
                </div>
              </div>
            </Card>

            {/* Classes Card */}
            {advisorInfo?.advisor?.classes &&
              advisorInfo.advisor.classes.length > 0 && (
                <Card
                  style={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    marginTop: 20,
                  }}
                  title="📚 Lớp học quản lý"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {advisorInfo.advisor.classes.map((classItem) => (
                      <div
                        key={classItem.class_id}
                        style={{
                          padding: 12,
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {classItem.class_name}
                        </div>
                        <div style={{ fontSize: 12, color: "#999" }}>
                          {classItem.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
          </Col>

          {/* Right: Edit Form */}
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
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setEditing(true)}
                      style={{
                        background: "#c8102e",
                        border: "none",
                      }}
                    >
                      Chỉnh sửa
                    </Button>
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

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
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
                          {advisorInfo?.advisor?.unit?.unit_name || "N/A"}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </Card>

            {/* Additional Info */}
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
                    onClick={() => message.info("Chức năng sẽ được cập nhật")}
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
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorProfile;
