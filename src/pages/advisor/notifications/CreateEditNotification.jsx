import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Row,
  Col,
  Spin,
  Space,
  Upload,
  Alert,
} from "antd";
import { toast } from "react-toastify";
import {
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createNotificationAPI,
  updateNotificationAPI,
  getNotificationDetailAPI,
  getAccountAPI,
} from "../../../services/api.service";

export const CreateEditNotification = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!!id);
  const [classes, setClasses] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchNotificationData();
    }
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownloadAttachment = (attachment) => {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const fileUrl = `${baseUrl}/storage/${attachment.file_path}`;

    // Tạo link tạm để download
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = attachment.file_name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchNotificationData = async () => {
    try {
      setInitializing(true);
      const res = await getNotificationDetailAPI(id);
      if (res && res.data) {
        const notification = res.data;
        form.setFieldsValue({
          title: notification.title,
          summary: notification.summary,
          type: notification.type,
          link: notification.link,
          class_ids: notification.classes?.map((c) => c.class_id) || [],
        });
        // Lưu các file đính kèm đã có
        if (notification.attachments && notification.attachments.length > 0) {
          setExistingAttachments(notification.attachments);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu thông báo");
      console.error(error);
    } finally {
      setInitializing(false);
    }
  };

  const fetchClasses = async () => {
    try {
      // Gọi API /api/auth/me để lấy dữ liệu advisor mới nhất với danh sách lớp
      const res = await getAccountAPI();

      let advisorClasses = [];

      // Lấy classes từ res.data.classes hoặc res.classes
      if (res?.data?.classes) {
        advisorClasses = res.data.classes;
      } else if (res?.classes) {
        advisorClasses = res.classes;
      } else if (res?.data?.advisor?.classes) {
        // Fallback nếu API trả về cấu trúc cũ
        advisorClasses = res.data.advisor.classes;
      }

      // Convert to Ant Design checkbox options format
      const classOptions = advisorClasses.map((classItem) => ({
        label: `${classItem.class_name} - ${classItem.description || ""}`,
        value: classItem.class_id,
      }));

      if (classOptions.length === 0) {
        toast.warning("Bạn không quản lý lớp nào. Vui lòng liên hệ hệ thống.");
      }

      setClasses(classOptions);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách lớp");
    }
  };
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Prepare form data
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("summary", values.summary);
      formData.append("type", values.type);
      formData.append("link", values.link || "");

      // Append class IDs
      if (values.class_ids && values.class_ids.length > 0) {
        values.class_ids.forEach((classId) => {
          formData.append("class_ids[]", classId);
        });
      }

      // Append attachments
      if (values.attachments && values.attachments.length > 0) {
        values.attachments.forEach((file) => {
          if (file.originFileObj) {
            // Khi edit, backend expect "attachments_to_add[]"
            // Khi create, backend expect "attachments[]"
            const fieldName = isEdit ? "attachments_to_add[]" : "attachments[]";
            formData.append(fieldName, file.originFileObj);
          }
        });
      }

      // Append attachments to delete (for edit mode)
      if (isEdit && attachmentsToDelete.length > 0) {
        attachmentsToDelete.forEach((attachmentId) => {
          formData.append("attachment_ids_to_delete[]", attachmentId);
        });
      }

      // Call API
      let res;
      if (isEdit) {
        res = await updateNotificationAPI(id, formData);
      } else {
        res = await createNotificationAPI(formData);
      }

      if (res && res.success) {
        toast.success(
          isEdit ? "Cập nhật thông báo thành công" : "Tạo thông báo thành công"
        );
        navigate("/advisor/notifications");
      } else {
        if (res && res.errors) {
          const errorMsg = Object.values(res.errors).flat().join("\n");
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        isEdit ? "Lỗi khi cập nhật thông báo" : "Lỗi khi tạo thông báo"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AdvisorLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: "0 16px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/advisor/notifications")}
            style={{ fontSize: 18 }}
          />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(20px, 5vw, 28px)",
                fontWeight: 700,
                color: "#c8102e",
              }}
            >
              {isEdit ? "✏️ Chỉnh sửa thông báo" : "📝 Tạo thông báo mới"}
            </h1>
          </div>
        </div>

        {/* Form */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {initializing ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Form.Item
                    label="Tiêu đề"
                    name="title"
                    rules={[
                      { required: true, message: "Vui lòng nhập tiêu đề" },
                      { min: 5, message: "Tiêu đề phải từ 5 ký tự trở lên" },
                    ]}
                  >
                    <Input
                      placeholder="Nhập tiêu đề thông báo"
                      size="large"
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Tóm tắt nội dung"
                    name="summary"
                    rules={[
                      { required: true, message: "Vui lòng nhập tóm tắt" },
                      { min: 10, message: "Tóm tắt phải từ 10 ký tự trở lên" },
                    ]}
                  >
                    <Input.TextArea
                      placeholder="Nhập tóm tắt nội dung thông báo"
                      rows={4}
                      style={{ borderRadius: 6 }}
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item
                    label="Link (nếu có)"
                    name="link"
                    rules={[
                      {
                        type: "url",
                        message: "Vui lòng nhập URL hợp lệ",
                      },
                    ]}
                  >
                    <Input
                      placeholder="https://example.com"
                      size="large"
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Chọn lớp"
                    name="class_ids"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ít nhất một lớp",
                      },
                    ]}
                  >
                    <Checkbox.Group options={classes} />
                  </Form.Item>

                  {/* Hiển thị file đính kèm đã có (nếu đang edit) */}
                  {isEdit && existingAttachments.length > 0 && (
                    <Form.Item label="Tệp đính kèm hiện có">
                      <div style={{ marginBottom: 12 }}>
                        {existingAttachments.map((attachment) => (
                          <div
                            key={attachment.attachment_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                              marginBottom: 8,
                              background: "#f5f5f5",
                              borderRadius: 6,
                              border: attachmentsToDelete.includes(
                                attachment.attachment_id
                              )
                                ? "1px solid #ff4d4f"
                                : "1px solid #d9d9d9",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14,
                                color: attachmentsToDelete.includes(
                                  attachment.attachment_id
                                )
                                  ? "#999"
                                  : "#333",
                                textDecoration: attachmentsToDelete.includes(
                                  attachment.attachment_id
                                )
                                  ? "line-through"
                                  : "none",
                                flex: 1,
                              }}
                            >
                              📎 {attachment.file_name}
                            </span>
                            <Space size="small">
                              <Button
                                type="primary"
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() =>
                                  handleDownloadAttachment(attachment)
                                }
                                disabled={attachmentsToDelete.includes(
                                  attachment.attachment_id
                                )}
                                style={{
                                  borderRadius: 4,
                                }}
                              >
                                Tải về
                              </Button>
                              <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  if (
                                    attachmentsToDelete.includes(
                                      attachment.attachment_id
                                    )
                                  ) {
                                    // Khôi phục file
                                    setAttachmentsToDelete(
                                      attachmentsToDelete.filter(
                                        (id) => id !== attachment.attachment_id
                                      )
                                    );
                                  } else {
                                    // Đánh dấu xóa
                                    setAttachmentsToDelete([
                                      ...attachmentsToDelete,
                                      attachment.attachment_id,
                                    ]);
                                  }
                                }}
                              >
                                {attachmentsToDelete.includes(
                                  attachment.attachment_id
                                )
                                  ? "Khôi phục"
                                  : "Xóa"}
                              </Button>
                            </Space>
                          </div>
                        ))}
                      </div>
                    </Form.Item>
                  )}

                  <Form.Item
                    label={isEdit ? "Thêm tệp đính kèm mới" : "Tệp đính kèm"}
                    name="attachments"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e?.fileList;
                    }}
                  >
                    <Upload
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                      maxCount={5}
                      beforeUpload={() => false}
                      listType="text"
                    >
                      <Button
                        type="dashed"
                        icon={<UploadOutlined />}
                        style={{
                          width: "100%",
                          borderRadius: 6,
                        }}
                      >
                        Chọn tệp (tối đa 5 tệp)
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>

                <Col xs={24} lg={8}>
                  <Form.Item
                    label="Loại thông báo"
                    name="type"
                    rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                  >
                    <Select
                      placeholder="Chọn loại"
                      size="large"
                      options={[
                        { label: "📢 Thông báo chung", value: "general" },
                        { label: "📚 Học tập", value: "academic" },
                        { label: "🎉 Sự kiện", value: "event" },
                        { label: "🚨 Khẩn", value: "urgent" },
                      ]}
                    />
                  </Form.Item>

                  <Alert
                    message="Lưu ý"
                    description="Thông báo sẽ được gửi đến tất cả sinh viên của các lớp được chọn."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 6 }}
                  />

                  <Card
                    size="small"
                    style={{
                      background:
                        "linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)",
                      borderRadius: 8,
                      border: "none",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#999" }}>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Thời gian tạo:</strong>
                        <p style={{ margin: "4px 0 0 0" }}>
                          {dayjs().format("DD/MM/YYYY HH:mm")}
                        </p>
                      </div>
                      <div>
                        <strong>Trạng thái:</strong>
                        <p style={{ margin: "4px 0 0 0" }}>
                          {isEdit ? "Chỉnh sửa" : "Tạo mới"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Actions */}
              <Row gutter={12} style={{ marginTop: 32 }}>
                <Col>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{
                      background:
                        "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    {isEdit ? "Cập nhật" : "Tạo mới"}
                  </Button>
                </Col>
                <Col>
                  <Button
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={() => navigate("/advisor/notifications")}
                  >
                    Hủy
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card>

        {/* Help */}
        <Card
          title="💡 Gợi ý"
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <ul style={{ marginBottom: 0 }}>
            <li>Tiêu đề nên rõ ràng, ngắn gọn</li>
            <li>Nội dung nên chi tiết, dễ hiểu</li>
            <li>Chọn lớp đúng để thông báo tới sinh viên</li>
            <li>Loại thông báo ảnh hưởng tới độ ưu tiên</li>
          </ul>
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default CreateEditNotification;
