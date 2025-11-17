import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Space,
  TimePicker,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getMeetingDetailApi,
  createMeetingApi,
  updateMeetingApi,
} from "../../../services/meeting.service";
import { getClassesAPI } from "../../../services/api.service";
import dayjs from "dayjs";

const { TextArea } = Input;

export const CreateEditMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!id;

  useEffect(() => {
    fetchClasses();
    if (isEditMode) {
      fetchMeetingDetail();
    }
  }, [id]);

  const fetchClasses = async () => {
    try {
      const response = await getClassesAPI();
      if (response?.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp");
    }
  };

  const fetchMeetingDetail = async () => {
    try {
      setLoading(true);
      const response = await getMeetingDetailApi(id);
      if (response?.data) {
        const meeting = response.data;
        form.setFieldsValue({
          class_id: meeting.class_id,
          title: meeting.title,
          meeting_date: meeting.meeting_time
            ? dayjs(meeting.meeting_time)
            : null,
          meeting_time: meeting.meeting_time
            ? dayjs(meeting.meeting_time)
            : null,
          end_time: meeting.end_time ? dayjs(meeting.end_time) : null,
          location: meeting.location,
          meeting_link: meeting.meeting_link,
          summary: meeting.summary,
          class_feedback: meeting.class_feedback,
          status: meeting.status,
        });
      }
    } catch (error) {
      console.error("Error fetching meeting detail:", error);
      toast.error("Không thể tải thông tin cuộc họp");
      navigate("/advisor/meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Combine date and time
      const meetingDateTime = values.meeting_date
        .hour(values.meeting_time.hour())
        .minute(values.meeting_time.minute())
        .second(0);

      const endDateTime = values.end_time
        ? values.meeting_date
            .hour(values.end_time.hour())
            .minute(values.end_time.minute())
            .second(0)
        : null;

      const payload = {
        class_id: values.class_id,
        title: values.title,
        meeting_time: meetingDateTime.format("YYYY-MM-DD HH:mm:ss"),
        end_time: endDateTime
          ? endDateTime.format("YYYY-MM-DD HH:mm:ss")
          : null,
        location: values.location || null,
        meeting_link: values.meeting_link || null,
        summary: values.summary || null,
        class_feedback: values.class_feedback || null,
        status: values.status || "scheduled",
      };

      if (isEditMode) {
        await updateMeetingApi(id, payload);
        toast.success("Cập nhật cuộc họp thành công");
      } else {
        await createMeetingApi(payload);
        toast.success("Tạo cuộc họp thành công");
      }

      navigate("/advisor/meetings");
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error(
        isEditMode ? "Không thể cập nhật cuộc họp" : "Không thể tạo cuộc họp"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/advisor/meetings")}
          className="mb-4"
        >
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          {isEditMode ? "Chỉnh sửa cuộc họp" : "Tạo cuộc họp mới"}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode
            ? "Cập nhật thông tin cuộc họp"
            : "Điền thông tin để tạo cuộc họp mới"}
        </p>
      </div>

      <Card className="shadow-lg rounded-xl border-0">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Lớp"
              name="class_id"
              rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
            >
              <Select
                placeholder="Chọn lớp"
                size="large"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={classes.map((cls) => ({
                  value: cls.class_id,
                  label: cls.class_name,
                }))}
                disabled={isEditMode}
              />
            </Form.Item>

            <Form.Item
              label="Tiêu đề cuộc họp"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Ví dụ: Họp lớp đầu kỳ" size="large" />
            </Form.Item>

            <Form.Item
              label="Ngày họp"
              name="meeting_date"
              rules={[{ required: true, message: "Vui lòng chọn ngày họp" }]}
            >
              <DatePicker
                placeholder="Chọn ngày"
                size="large"
                format="DD/MM/YYYY"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Giờ bắt đầu"
              name="meeting_time"
              rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
            >
              <TimePicker
                placeholder="Chọn giờ"
                size="large"
                format="HH:mm"
                className="w-full"
              />
            </Form.Item>

            <Form.Item label="Giờ kết thúc" name="end_time">
              <TimePicker
                placeholder="Chọn giờ kết thúc (tùy chọn)"
                size="large"
                format="HH:mm"
                className="w-full"
              />
            </Form.Item>

            <Form.Item label="Địa điểm" name="location">
              <Input
                placeholder="Ví dụ: Phòng A201"
                size="large"
                prefix={<CalendarOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="Link họp online"
              name="meeting_link"
              className="md:col-span-2"
            >
              <Input
                placeholder="https://meet.google.com/xxx hoặc https://zoom.us/j/xxx"
                size="large"
                type="url"
              />
            </Form.Item>

            {isEditMode && (
              <Form.Item label="Trạng thái" name="status">
                <Select
                  size="large"
                  options={[
                    { value: "scheduled", label: "Sắp diễn ra" },
                    { value: "completed", label: "Đã hoàn thành" },
                    { value: "cancelled", label: "Đã hủy" },
                  ]}
                />
              </Form.Item>
            )}
          </div>

          <Form.Item label="Nội dung cuộc họp" name="summary">
            <TextArea
              rows={6}
              placeholder="Nhập nội dung, chương trình cuộc họp..."
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item label="Ý kiến lớp" name="class_feedback">
            <TextArea
              rows={4}
              placeholder="Ghi chú ý kiến, phản hồi từ lớp (nếu có)..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button
                size="large"
                onClick={() => navigate("/advisor/meetings")}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                {isEditMode ? "Cập nhật" : "Tạo cuộc họp"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateEditMeeting;
