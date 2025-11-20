import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Space,
  TimePicker,
  Divider,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  FileTextOutlined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Handle validation errors from API
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((fieldName) => {
          const fieldErrors = errors[fieldName];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            form.setFields([
              {
                name: fieldName,
                errors: fieldErrors,
              },
            ]);
          }
        });
        toast.error("Vui lòng kiểm tra lại thông tin");
      } else {
        toast.error(
          isEditMode ? "Không thể cập nhật cuộc họp" : "Không thể tạo cuộc họp"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdvisorLayout>
        <div className="p-6">
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 50,
                minHeight: "400px",
              }}
            >
              <Spin size="large" />
            </div>
          </Card>
        </div>
      </AdvisorLayout>
    );
  }

  return (
    <AdvisorLayout>
      <div className="p-6">
        <Card>
          <div className="flex justify-between items-center mb-5">
            <div>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/advisor/meetings")}
                className="mb-4"
              >
                Quay lại danh sách
              </Button>
              <h1 className="text-2xl font-bold">
                {isEditMode ? "Chỉnh sửa cuộc họp" : "Tạo cuộc họp mới"}
              </h1>
              <p className="text-gray-500 mt-1">
                {isEditMode
                  ? "Cập nhật thông tin cuộc họp"
                  : "Điền thông tin để tạo cuộc họp mới"}
              </p>
            </div>
          </div>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Divider orientation="left">
              <span className="text-lg font-semibold text-blue-600">
                <CalendarOutlined className="mr-2" />
                Thông tin cơ bản
              </span>
            </Divider>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={<span className="font-semibold">Lớp học</span>}
                name="class_id"
                rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
              >
                <Select
                  placeholder="Chọn lớp"
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
                label={<span className="font-semibold">Tiêu đề cuộc họp</span>}
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input placeholder="Ví dụ: Họp lớp đầu kỳ" />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Ngày họp</span>}
                name="meeting_date"
                rules={[{ required: true, message: "Vui lòng chọn ngày họp" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Giờ bắt đầu</span>}
                name="meeting_time"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ bắt đầu" },
                ]}
              >
                <TimePicker
                  placeholder="Chọn giờ"
                  format="HH:mm"
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Giờ kết thúc</span>}
                name="end_time"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const meetingTime = form.getFieldValue("meeting_time");
                      if (!meetingTime) return Promise.resolve();
                      if (value.isAfter(meetingTime)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Giờ kết thúc phải sau giờ bắt đầu")
                      );
                    },
                  },
                ]}
              >
                <TimePicker
                  placeholder="Chọn giờ kết thúc (tùy chọn)"
                  format="HH:mm"
                  className="w-full"
                />
              </Form.Item>

              {isEditMode && (
                <Form.Item
                  label={<span className="font-semibold">Trạng thái</span>}
                  name="status"
                >
                  <Select
                    options={[
                      { value: "scheduled", label: "Sắp diễn ra" },
                      { value: "completed", label: "Đã hoàn thành" },
                      { value: "cancelled", label: "Đã hủy" },
                    ]}
                  />
                </Form.Item>
              )}
            </div>

            <Divider orientation="left">
              <span className="text-lg font-semibold text-purple-600">
                <EnvironmentOutlined className="mr-2" />
                Địa điểm và liên kết
              </span>
            </Divider>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={
                  <span className="font-semibold">
                    <EnvironmentOutlined className="mr-2 text-gray-400" />
                    Địa điểm
                  </span>
                }
                name="location"
              >
                <Input placeholder="Ví dụ: Phòng A201" />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-semibold">
                    <LinkOutlined className="mr-2 text-gray-400" />
                    Link họp online
                  </span>
                }
                name="meeting_link"
              >
                <Input placeholder="https://meet.google.com/xxx" type="url" />
              </Form.Item>
            </div>

            <Divider orientation="left">
              <span className="text-lg font-semibold text-pink-600">
                <FileTextOutlined className="mr-2" />
                Nội dung cuộc họp
              </span>
            </Divider>

            <Form.Item
              label={<span className="font-semibold">Nội dung cuộc họp</span>}
              name="summary"
            >
              <TextArea
                rows={6}
                placeholder="Nhập nội dung, chương trình cuộc họp..."
                maxLength={2000}
                showCount
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Ý kiến lớp</span>}
              name="class_feedback"
            >
              <TextArea
                rows={4}
                placeholder="Ghi chú ý kiến, phản hồi từ lớp (nếu có)..."
                maxLength={1000}
                showCount
                className="rounded-lg"
              />
            </Form.Item>

            <Divider />

            <Form.Item className="mb-0">
              <Space className="w-full justify-end" size="middle">
                <Button onClick={() => navigate("/advisor/meetings")}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                >
                  {isEditMode ? "Cập nhật" : "Tạo cuộc họp"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default CreateEditMeeting;
