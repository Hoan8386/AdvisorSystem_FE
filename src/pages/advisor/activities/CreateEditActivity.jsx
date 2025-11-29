import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Space,
  Divider,
  InputNumber,
  Row,
  Col,
  Checkbox,
} from "antd";
import { toast } from "react-toastify";
import {
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createActivityAPI,
  updateActivityAPI,
  getActivityDetailAPI,
  getAccountAPI,
} from "../../../services/api.service";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export const CreateEditActivity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [units, setUnits] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchActivityData();
    }
    fetchUserInfo();
    fetchClasses();
    // eslint-disable-next-line
  }, [id]);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const res = await getActivityDetailAPI(id);
      if (res && res.data) {
        const activity = res.data;

        // --- XỬ LÝ HIỂN THỊ GIỜ ---
        // Nếu server trả về định dạng UTC (VD: ...12:00:00Z), ta xóa chữ 'Z'
        // để Dayjs hiểu đây là giờ Local (giữ nguyên con số 12:00)
        const startTimeStr = activity.start_time
          ? activity.start_time.replace("Z", "")
          : null;
        const endTimeStr = activity.end_time
          ? activity.end_time.replace("Z", "")
          : null;

        form.setFieldsValue({
          title: activity.title,
          general_description: activity.general_description,
          location: activity.location,
          time: [
            startTimeStr ? dayjs(startTimeStr) : null,
            endTimeStr ? dayjs(endTimeStr) : null,
          ],
          organizer_unit_id: activity.organizer_unit_id,
          status: activity.status,
          class_ids: activity.classes?.map((cls) => cls.class_id) || [],
          roles: activity.roles?.map((role) => ({
            role_name: role.role_name,
            description: role.description,
            requirements: role.requirements,
            points_awarded: role.points_awarded,
            point_type: role.point_type,
            max_slots: role.max_slots,
          })) || [{}],
        });
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu hoạt động");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await getAccountAPI();
      if (res && res.data && res.data.unit) {
        setUnits([
          {
            value: res.data.unit.unit_id,
            label: res.data.unit.unit_name,
          },
        ]);
        if (!id) {
          form.setFieldValue("organizer_unit_id", res.data.unit.unit_id);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await getAccountAPI();
      let advisorClasses = [];

      if (res?.data?.classes) {
        advisorClasses = res.data.classes;
      } else if (res?.classes) {
        advisorClasses = res.classes;
      } else if (res?.data?.advisor?.classes) {
        advisorClasses = res.data.advisor.classes;
      }

      const classOptions = advisorClasses.map((classItem) => ({
        label: `${classItem.class_name} - ${classItem.description || ""}`,
        value: classItem.class_id,
      }));

      if (classOptions.length === 0) {
        toast.warning("Bạn không quản lý lớp nào. Vui lòng liên hệ hệ thống.");
      }

      setClasses(classOptions);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp:", error);
      toast.error("Lỗi khi tải danh sách lớp");
    }
  };

  // --- 1. CHẶN KHÔNG CHO CLICK VÀO NGÀY HÔM NAY VÀ QUÁ KHỨ ---
  const disabledDate = (current) => {
    // Chỉ cho phép chọn từ ngày mai trở đi
    return current && current <= dayjs().endOf("day");
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // --- 2. XỬ LÝ LƯU GIỜ (QUAN TRỌNG) ---
      // Dùng .format() để chuyển thành chuỗi cứng, không bị convert sang UTC
      // Ví dụ: Chọn 07:00 -> Gửi "2025-11-29 07:00:00" -> DB lưu 07:00
      const formattedStartTime = values.time[0].format("YYYY-MM-DD HH:mm:ss");
      const formattedEndTime = values.time[1].format("YYYY-MM-DD HH:mm:ss");

      const activityData = {
        title: values.title,
        general_description: values.general_description,
        location: values.location,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        organizer_unit_id: values.organizer_unit_id,
        status: values.status || "upcoming",
        class_ids: values.class_ids || [],
        roles: values.roles.map((role) => ({
          role_name: role.role_name,
          description: role.description || null,
          requirements: role.requirements || null,
          points_awarded: role.points_awarded,
          point_type: role.point_type,
          max_slots: role.max_slots || null,
        })),
      };

      let res;
      if (isEdit) {
        res = await updateActivityAPI(id, activityData);
      } else {
        res = await createActivityAPI(activityData);
      }

      if (res && res.success) {
        toast.success(
          isEdit ? "Cập nhật hoạt động thành công" : "Tạo hoạt động thành công"
        );
        navigate("/advisor/activities");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error?.message ||
          (isEdit ? "Lỗi khi cập nhật hoạt động" : "Lỗi khi tạo hoạt động")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdvisorLayout>
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/advisor/activities")}
            size="large"
          />
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            {isEdit ? "✏️ Chỉnh sửa hoạt động" : "📝 Tạo hoạt động mới"}
          </h1>
        </div>

        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: "upcoming",
              roles: [{ point_type: "ctxh", points_awarded: 5 }],
            }}
          >
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Form.Item
                  label="Tiêu đề hoạt động"
                  name="title"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiêu đề" },
                    { min: 5, message: "Tiêu đề phải từ 5 ký tự trở lên" },
                  ]}
                >
                  <Input placeholder="Nhập tiêu đề hoạt động" size="large" />
                </Form.Item>

                <Form.Item
                  label="Mô tả chung"
                  name="general_description"
                  rules={[
                    { min: 10, message: "Mô tả phải từ 10 ký tự trở lên" },
                  ]}
                >
                  <TextArea
                    placeholder="Nhập mô tả hoạt động"
                    rows={4}
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Địa điểm"
                      name="location"
                      rules={[
                        { required: true, message: "Vui lòng nhập địa điểm" },
                      ]}
                    >
                      <Input placeholder="Nhập địa điểm tổ chức" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Thời gian"
                      name="time"
                      rules={[
                        { required: true, message: "Vui lòng chọn thời gian" },
                        // --- 3. VALIDATOR LOGIC ---
                        {
                          validator: (_, value) => {
                            if (value && value[0]) {
                              // Nếu ngày bắt đầu <= ngày hiện tại -> Báo lỗi
                              if (!value[0].isAfter(dayjs(), "day")) {
                                return Promise.reject(
                                  "Ngày bắt đầu phải lớn hơn ngày hiện tại (từ ngày mai)"
                                );
                              }
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <RangePicker
                        showTime={{ format: "HH:mm" }}
                        format="DD/MM/YYYY HH:mm"
                        placeholder={["Bắt đầu", "Kết thúc"]}
                        size="large"
                        style={{ width: "100%" }}
                        disabledDate={disabledDate} // Áp dụng hàm chặn lịch
                      />
                    </Form.Item>
                  </Col>
                </Row>

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

                <Divider orientation="left">Vai trò trong hoạt động</Divider>

                <Form.List name="roles">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Card
                          key={key}
                          size="small"
                          style={{
                            marginBottom: 16,
                            background: "#fafafa",
                            borderRadius: 8,
                          }}
                          extra={
                            fields.length > 1 && (
                              <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              >
                                Xóa
                              </Button>
                            )
                          }
                        >
                          <Form.Item
                            {...restField}
                            label="Tên vai trò"
                            name={[name, "role_name"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập tên vai trò",
                              },
                            ]}
                          >
                            <Input placeholder="VD: Người tham gia..." />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Mô tả vai trò"
                            name={[name, "description"]}
                          >
                            <TextArea placeholder="Mô tả chi tiết" rows={2} />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Yêu cầu"
                            name={[name, "requirements"]}
                          >
                            <TextArea placeholder="Các yêu cầu" rows={2} />
                          </Form.Item>

                          <Row gutter={16}>
                            <Col xs={24} sm={8}>
                              <Form.Item
                                {...restField}
                                label="Điểm thưởng"
                                name={[name, "points_awarded"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập điểm",
                                  },
                                ]}
                              >
                                <InputNumber
                                  min={0}
                                  placeholder="Điểm"
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item
                                {...restField}
                                label="Loại điểm"
                                name={[name, "point_type"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn loại điểm",
                                  },
                                ]}
                              >
                                <Select
                                  placeholder="Chọn loại"
                                  options={[
                                    { label: "Cộng tác xã hội", value: "ctxh" },
                                    { label: "Rèn luyện", value: "ren_luyen" },
                                  ]}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Form.Item
                                {...restField}
                                label="Số lượng tối đa"
                                name={[name, "max_slots"]}
                              >
                                <InputNumber
                                  min={1}
                                  placeholder="Số lượng"
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 16 }}
                      >
                        Thêm vai trò
                      </Button>
                    </>
                  )}
                </Form.List>
              </Col>

              <Col xs={24} lg={8}>
                <Form.Item
                  label="Đơn vị tổ chức"
                  name="organizer_unit_id"
                  rules={[{ required: true, message: "Vui lòng chọn đơn vị" }]}
                >
                  <Select
                    placeholder="Chọn đơn vị"
                    size="large"
                    options={units}
                  />
                </Form.Item>

                <Form.Item
                  label="Trạng thái"
                  name="status"
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái" },
                  ]}
                >
                  <Select
                    placeholder="Chọn trạng thái"
                    size="large"
                    options={[
                      { label: "Sắp diễn ra", value: "upcoming" },
                      { label: "Đang diễn ra", value: "ongoing" },
                      { label: "Đã hoàn thành", value: "completed" },
                      { label: "Đã hủy", value: "cancelled" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            <Space size="middle">
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
                {isEdit ? "Cập nhật" : "Tạo hoạt động"}
              </Button>
              <Button
                size="large"
                icon={<CloseOutlined />}
                onClick={() => navigate("/advisor/activities")}
              >
                Hủy
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </AdvisorLayout>
  );
};

export default CreateEditActivity;
