import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import { Card, Button, Form, Input, Spin, Tag, Image } from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getPointFeedbackDetailAPI,
  respondPointFeedbackAPI,
} from "../../../services/pointFeedback.service";
import dayjs from "dayjs";

export default function RespondPointFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(false);

  const fetchFeedbackDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPointFeedbackDetailAPI(id);
      if (response && response.data) {
        setFeedback(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
      navigate("/advisor/point-feedbacks");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchFeedbackDetail();
  }, [fetchFeedbackDetail]);

  const handleSubmitResponse = async (status) => {
    try {
      // Validate form
      await form.validateFields();
    } catch {
      toast.error("Vui lòng nhập đầy đủ thông tin phản hồi");
      return;
    }

    const responseText = form.getFieldValue("advisor_response");
    if (!responseText || responseText.trim() === "") {
      toast.error("Vui lòng nhập phản hồi của cố vấn");
      return;
    }

    try {
      setResponding(true);
      await respondPointFeedbackAPI(id, {
        status,
        advisor_response: responseText,
      });
      toast.success(
        `${status === "approved" ? "Duyệt" : "Từ chối"} phản hồi thành công`
      );
      navigate("/advisor/point-feedbacks");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xử lý phản hồi");
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-6">
        <Card>
          <p>Không tìm thấy phản hồi</p>
          <Button onClick={() => navigate("/advisor/point-feedbacks")}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <AdvisorLayout>
      <div className="p-6">
        <Card className="mb-5">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/advisor/point-feedbacks")}
            className="mb-4"
          >
            Quay lại
          </Button>

          <h1 className="text-2xl font-bold mb-5">Phê duyệt phản hồi điểm</h1>

          <div className="bg-gray-50 p-6 rounded-lg mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-medium text-gray-700">Sinh viên</label>
                <p className="text-lg mt-2">{feedback.student?.full_name}</p>
                <p className="text-sm text-gray-500">
                  {feedback.student?.user_code}
                </p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Trạng thái</label>
                <p className="mt-2">
                  <Tag color="orange">Chờ duyệt</Tag>
                </p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Học kỳ</label>
                <p className="text-lg mt-2">
                  {feedback.semester?.semester_name}
                </p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Ngày gửi</label>
                <p className="text-lg mt-2">
                  {dayjs(feedback.created_at).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="font-medium text-gray-700 block mb-2">
                Nội dung phản hồi
              </label>
              <div className="bg-white p-4 rounded border">
                <p className="whitespace-pre-wrap">
                  {feedback.feedback_content}
                </p>
              </div>
            </div>

            {feedback.attachment_path && (
              <div className="mt-4">
                <label className="font-medium text-gray-700 block mb-2">
                  Tệp đính kèm
                </label>
                <div className="flex flex-col gap-3">
                  {/\.(jpg|jpeg|png|gif)$/i.test(feedback.attachment_path) ? (
                    <div className="border rounded p-2 inline-block">
                      <Image
                        src={`http://localhost:8000/storage/${feedback.attachment_path}`}
                        alt="Attachment"
                        style={{ maxHeight: "300px", width: "auto" }}
                        preview={{ mask: "Xem" }}
                      />
                    </div>
                  ) : null}
                  <a
                    href={`http://localhost:8000/storage/${feedback.attachment_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    📥 Tải xuống ({feedback.attachment_path.split("/").pop()})
                  </a>
                </div>
              </div>
            )}
          </div>

          <Card title="Phản hồi của cố vấn">
            <Form form={form} layout="vertical" className="space-y-4">
              <Form.Item
                label="Phản hồi"
                name="advisor_response"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập phản hồi",
                  },
                  {
                    min: 10,
                    message: "Phản hồi phải có ít nhất 10 ký tự",
                  },
                  {
                    max: 1000,
                    message: "Phản hồi không được vượt quá 1000 ký tự",
                  },
                ]}
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Nhập phản hồi của cố vấn (tối thiểu 10 ký tự, tối đa 1000 ký tự)"
                />
              </Form.Item>

              <div className="flex gap-4 justify-end">
                <Button onClick={() => navigate("/advisor/point-feedbacks")}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  danger
                  icon={<CloseOutlined />}
                  loading={responding}
                  onClick={() => handleSubmitResponse("rejected")}
                >
                  Từ chối
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={responding}
                  onClick={() => handleSubmitResponse("approved")}
                >
                  Phê duyệt
                </Button>
              </div>
            </Form>
          </Card>
        </Card>
      </div>
    </AdvisorLayout>
  );
}
