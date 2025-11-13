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

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchActivityData();
    }
    fetchUserInfo();
    // eslint-disable-next-line
  }, [id]);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const res = await getActivityDetailAPI(id);
      if (res && res.data) {
        const activity = res.data;
        form.setFieldsValue({
          title: activity.title,
          general_description: activity.general_description,
          location: activity.location,
          time: [dayjs(activity.start_time), dayjs(activity.end_time)],
          organizer_unit_id: activity.organizer_unit_id,
          status: activity.status,
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
        // Set default unit
        if (!id) {
          form.setFieldValue("organizer_unit_id", res.data.unit.unit_id);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const activityData = {
        title: values.title,
        general_description: values.general_description,
        location: values.location,
        start_time: values.time[0].format("YYYY-MM-DD HH:mm:ss"),
        end_time: values.time[1].format("YYYY-MM-DD HH:mm:ss"),
        organizer_unit_id: values.organizer_unit_id,
        status: values.status || "upcoming",
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
        {/* Header */}
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

        {/* Form */}
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
              roles: [
                {
                  point_type: "ctxh",
                  points_awarded: 5,
                },
              ],
            }}
          >
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Form.Item
                  label="Tiêu đề hoạt động"
                  name="title"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiêu đề" },
                    {
                      min: 5,
                      message: "Tiêu đề phải từ 5 ký tự trở lên",
                    },
                  ]}
                >
                  <Input placeholder="Nhập tiêu đề hoạt động" size="large" />
                </Form.Item>

                <Form.Item
                  label="Mô tả chung"
                  name="general_description"
                  rules={[
                    {
                      min: 10,
                      message: "Mô tả phải từ 10 ký tự trở lên",
                    },
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
                        {
                          required: true,
                          message: "Vui lòng nhập địa điểm",
                        },
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
                        {
                          required: true,
                          message: "Vui lòng chọn thời gian",
                        },
                      ]}
                    >
                      <RangePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        placeholder={[
                          "Thời gian bắt đầu",
                          "Thời gian kết thúc",
                        ]}
                        size="large"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

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
                            <Input placeholder="VD: Người tham gia, Tình nguyện viên..." />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Mô tả vai trò"
                            name={[name, "description"]}
                          >
                            <TextArea
                              placeholder="Mô tả chi tiết về vai trò này"
                              rows={2}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            label="Yêu cầu"
                            name={[name, "requirements"]}
                          >
                            <TextArea
                              placeholder="Các yêu cầu để tham gia vai trò này"
                              rows={2}
                            />
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
                                    {
                                      label: "Cộng tác xã hội",
                                      value: "ctxh",
                                    },
                                    {
                                      label: "Rèn luyện",
                                      value: "ren_luyen",
                                    },
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
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn đơn vị",
                    },
                  ]}
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

                <Card
                  size="small"
                  style={{
                    background: "#f0f9ff",
                    borderRadius: 8,
                    border: "1px solid #bae6fd",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#0369a1" }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>💡 Lưu ý:</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Mỗi hoạt động phải có ít nhất 1 vai trò</li>
                      <li>Điểm CTXH: Cộng tác xã hội</li>
                      <li>Điểm Rèn luyện: Hoạt động rèn luyện</li>
                      <li>Số lượng tối đa có thể để trống (không giới hạn)</li>
                    </ul>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Actions */}
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
