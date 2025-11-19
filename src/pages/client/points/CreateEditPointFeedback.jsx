import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  Upload,
  Spin,
  message,
  Space,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getPointFeedbackDetailAPI,
  createPointFeedbackAPI,
  updatePointFeedbackAPI,
} from "../../../services/pointFeedback.service";

export default function CreateEditPointFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [fileList, setFileList] = useState([]);
  const isEdit = id !== undefined;

  const fetchFeedbackDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPointFeedbackDetailAPI(id);
      if (response && response.data) {
        const data = response.data;
        setFeedback(data);
        form.setFieldsValue({
          semester_id: data.semester_id,
          feedback_content: data.feedback_content,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
      navigate("/student/point-feedbacks");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, form]);

  useEffect(() => {
    if (isEdit) {
      fetchFeedbackDetail();
    }
  }, [isEdit, fetchFeedbackDetail]);

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("semester_id", values.semester_id);
      formData.append("feedback_content", values.feedback_content);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("attachment", fileList[0].originFileObj);
      }

      if (isEdit) {
        await updatePointFeedbackAPI(id, formData);
        toast.success("Cập nhật phản hồi thành công");
      } else {
        await createPointFeedbackAPI(formData);
        toast.success("Tạo phản hồi thành công");
      }

      navigate("/student/point-feedbacks");
    } catch (error) {
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(", ")
        : error.response?.data?.message || "Lỗi khi lưu phản hồi";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin />
      </div>
    );
  }

  if (isEdit && !feedback) {
    return (
      <div className="p-6">
        <Card>
          <p>Không tìm thấy phản hồi</p>
          <Button onClick={() => navigate("/student/point-feedbacks")}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  if (isEdit && feedback && feedback.status !== "pending") {
    return (
      <div className="p-6">
        <Card>
          <p>Chỉ có thể chỉnh sửa phản hồi ở trạng thái chờ duyệt</p>
          <Button onClick={() => navigate("/student/point-feedbacks")}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <StudentLayout>
      <div className="p-6">
        <Card>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/student/point-feedbacks")}
            className="mb-4"
          >
            Quay lại
          </Button>

          <h1 className="text-2xl font-bold mb-6">
            {isEdit ? "Chỉnh sửa phản hồi" : "Tạo phản hồi mới"}
          </h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-2xl"
          >
            <Form.Item
              label="Học kỳ"
              name="semester_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn học kỳ",
                },
              ]}
            >
              <Select
                placeholder="Chọn học kỳ"
                options={[
                  { label: "Học kỳ 1", value: 1 },
                  { label: "Học kỳ 2", value: 2 },
                  { label: "Học kỳ hè", value: 3 },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Nội dung phản hồi"
              name="feedback_content"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập nội dung phản hồi",
                },
                {
                  min: 10,
                  message: "Nội dung phản hồi phải có ít nhất 10 ký tự",
                },
                {
                  max: 2000,
                  message: "Nội dung phản hồi không được vượt quá 2000 ký tự",
                },
              ]}
            >
              <Input.TextArea rows={8} placeholder="Nhập nội dung phản hồi" />
            </Form.Item>

            <Form.Item
              label="Tệp đính kèm (tùy chọn)"
              tooltip="Hỗ trợ jpg, jpeg, png, pdf. Tối đa 5MB"
            >
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                maxCount={1}
                accept=".jpg,.jpeg,.png,.pdf"
                beforeUpload={(file) => {
                  const maxSize = 5 * 1024 * 1024;
                  if (file.size > maxSize) {
                    message.error("Kích thước file không được vượt quá 5MB");
                    return false;
                  }
                  return true;
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn file</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => navigate("/student/point-feedbacks")}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {isEdit ? "Cập nhật" : "Tạo"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </StudentLayout>
  );
}
