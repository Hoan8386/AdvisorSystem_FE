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
  Popconfirm, // <--- 1. SỬ DỤNG POPCONFIRM THAY CHO MODAL
  Spin,
  Tag,
} from "antd";
import { toast } from "react-toastify";
import {
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  StopOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createActivityAPI,
  updateActivityAPI,
  getActivityDetailAPI,
  getAccountAPI,
  createActivityRoleAPI,
  updateActivityRoleAPI,
  deleteActivityRoleAPI,
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

  const [editingRoleIndex, setEditingRoleIndex] = useState(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);

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
            activity_role_id: role.activity_role_id,
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await getAccountAPI();
      if (res && res.data && res.data.unit) {
        setUnits([
          { value: res.data.unit.unit_id, label: res.data.unit.unit_name },
        ]);
        if (!id) form.setFieldValue("organizer_unit_id", res.data.unit.unit_id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await getAccountAPI();
      let advisorClasses = [];
      if (res?.data?.classes) advisorClasses = res.data.classes;
      else if (res?.classes) advisorClasses = res.classes;
      else if (res?.data?.advisor?.classes)
        advisorClasses = res.data.advisor.classes;

      setClasses(
        advisorClasses.map((c) => ({
          label: `${c.class_name}`,
          value: c.class_id,
        }))
      );
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp:", error);
    }
  };

  const disabledDate = (current) => current && current <= dayjs().endOf("day");

  const handleStartEditRole = (index) => setEditingRoleIndex(index);

  const handleCancelEditRole = () => {
    setEditingRoleIndex(null);
    fetchActivityData();
  };

  const handleUpdateSingleRole = async (index) => {
    try {
      await form.validateFields([
        ["roles", index, "role_name"],
        ["roles", index, "points_awarded"],
        ["roles", index, "point_type"],
      ]);
      const roles = form.getFieldValue("roles");
      const roleData = roles[index];

      if (!roleData.activity_role_id) return;

      setRoleActionLoading(true);
      const payload = {
        role_name: roleData.role_name,
        description: roleData.description || null,
        requirements: roleData.requirements || null,
        points_awarded: roleData.points_awarded,
        point_type: roleData.point_type,
        max_slots: roleData.max_slots || null,
      };

      await updateActivityRoleAPI(id, roleData.activity_role_id, payload);
      toast.success("Đã cập nhật vai trò thành công!");
      setEditingRoleIndex(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật vai trò");
    } finally {
      setRoleActionLoading(false);
    }
  };

  // --- 2. HÀM XÓA VAI TRÒ (Được gọi từ Popconfirm) ---
  const handleDeleteRole = async (index, role) => {
    // Trường hợp 1: Role cũ (Có ID trong DB) -> Gọi API
    if (isEdit && role && role.activity_role_id) {
      try {
        setRoleActionLoading(true);
        await deleteActivityRoleAPI(id, role.activity_role_id);
        toast.success("Xóa vai trò thành công");

        // Xóa khỏi Form UI
        const currentRoles = form.getFieldValue("roles");
        const newRoles = currentRoles.filter((_, i) => i !== index);
        form.setFieldValue("roles", newRoles);
      } catch (error) {
        toast.error("Lỗi khi xóa vai trò");
        console.error(error);
      } finally {
        setRoleActionLoading(false);
      }
    } else {
      // Trường hợp 2: Role mới (Chưa lưu) -> Xóa ngay khỏi Form
      const currentRoles = form.getFieldValue("roles") || [];
      const newRoles = currentRoles.filter((_, i) => i !== index);
      form.setFieldValue("roles", newRoles);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
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
      };

      if (isEdit) {
        await updateActivityAPI(id, activityData);

        if (values.roles && values.roles.length > 0) {
          const newRoles = values.roles.filter(
            (role) => !role.activity_role_id
          );
          if (newRoles.length > 0) {
            const createPromises = newRoles.map((role) =>
              createActivityRoleAPI(id, {
                role_name: role.role_name,
                description: role.description || null,
                requirements: role.requirements || null,
                points_awarded: role.points_awarded,
                point_type: role.point_type,
                max_slots: role.max_slots || null,
              })
            );
            await Promise.all(createPromises);
          }
        }
        toast.success("Cập nhật hoạt động thành công");
        fetchActivityData();
      } else {
        activityData.roles = values.roles.map((role) => ({
          role_name: role.role_name,
          description: role.description || null,
          requirements: role.requirements || null,
          points_awarded: role.points_awarded,
          point_type: role.point_type,
          max_slots: role.max_slots || null,
        }));
        await createActivityAPI(activityData);
        toast.success("Tạo hoạt động thành công");
        navigate("/advisor/activities");
      }
    } catch (error) {
      toast.error(error?.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdvisorLayout>
      <Spin spinning={loading} tip="Đang xử lý dữ liệu..." size="large">
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
              {/* Form Fields ... (Phần trên giữ nguyên) */}
              <Row gutter={24}>
                <Col xs={24} lg={16}>
                  <Form.Item
                    label="Tiêu đề hoạt động"
                    name="title"
                    rules={[
                      { required: true, message: "Nhập tiêu đề" },
                      { min: 5 },
                    ]}
                  >
                    <Input placeholder="Nhập tiêu đề hoạt động" size="large" />
                  </Form.Item>
                  <Form.Item
                    label="Mô tả chung"
                    name="general_description"
                    rules={[{ min: 10 }]}
                  >
                    <TextArea
                      placeholder="Nhập mô tả"
                      rows={4}
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Địa điểm"
                        name="location"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Nhập địa điểm" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Thời gian"
                        name="time"
                        rules={[{ required: true }]}
                      >
                        <RangePicker
                          showTime={{ format: "HH:mm" }}
                          format="DD/MM/YYYY HH:mm"
                          size="large"
                          style={{ width: "100%" }}
                          disabledDate={disabledDate}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    label="Chọn lớp"
                    name="class_ids"
                    rules={[{ required: true }]}
                  >
                    <Checkbox.Group options={classes} />
                  </Form.Item>

                  <Divider orientation="left">Danh sách vai trò</Divider>

                  <Form.List name="roles">
                    {(fields, { add }) => (
                      <>
                        {fields.map(({ key, name, ...restField }, index) => {
                          const currentRole = form.getFieldValue([
                            "roles",
                            name,
                          ]);
                          const isExistingRole =
                            !!currentRole?.activity_role_id;
                          const isEditingThisRole = editingRoleIndex === index;
                          const showEditMode =
                            (isExistingRole && isEditingThisRole) ||
                            !isExistingRole;

                          return (
                            <Card
                              key={key}
                              size="small"
                              className="mb-4 bg-slate-50 border-slate-200"
                              style={{
                                marginBottom: "20px",
                              }}
                              title={
                                !showEditMode ? (
                                  <span className="font-bold text-blue-800">
                                    {currentRole.role_name}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">
                                    {isExistingRole
                                      ? "Đang chỉnh sửa..."
                                      : "Thêm vai trò mới"}
                                  </span>
                                )
                              }
                              extra={
                                <Space>
                                  {isExistingRole && !showEditMode && (
                                    <Button
                                      type="link"
                                      icon={<EditOutlined />}
                                      onClick={() => handleStartEditRole(index)}
                                    >
                                      Sửa
                                    </Button>
                                  )}

                                  {/* --- 3. DÙNG POPCONFIRM BỌC NÚT XÓA --- */}
                                  <Popconfirm
                                    title="Xóa vai trò?"
                                    description={
                                      isExistingRole
                                        ? "Sinh viên đã đăng ký sẽ bị hủy."
                                        : "Bạn có chắc chắn xóa?"
                                    }
                                    onConfirm={() =>
                                      handleDeleteRole(index, currentRole)
                                    }
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{
                                      danger: true,
                                      loading: roleActionLoading,
                                    }}
                                    icon={
                                      <QuestionCircleOutlined
                                        style={{ color: "red" }}
                                      />
                                    }
                                  >
                                    <Button
                                      type="link"
                                      danger
                                      icon={<DeleteOutlined />}
                                      disabled={roleActionLoading} // Disable khi đang xóa
                                    >
                                      Xóa
                                    </Button>
                                  </Popconfirm>
                                  {/* -------------------------------------- */}
                                </Space>
                              }
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "activity_role_id"]}
                                hidden
                              >
                                <Input />
                              </Form.Item>

                              {showEditMode ? (
                                <div className="animate-fade-in">
                                  <Form.Item
                                    {...restField}
                                    label="Tên vai trò"
                                    name={[name, "role_name"]}
                                    rules={[{ required: true }]}
                                  >
                                    <Input placeholder="Tên vai trò" />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    label="Mô tả"
                                    name={[name, "description"]}
                                  >
                                    <TextArea rows={2} />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    label="Yêu cầu"
                                    name={[name, "requirements"]}
                                  >
                                    <TextArea rows={2} />
                                  </Form.Item>
                                  <Row gutter={16}>
                                    <Col span={8}>
                                      <Form.Item
                                        {...restField}
                                        label="Điểm"
                                        name={[name, "points_awarded"]}
                                        rules={[{ required: true }]}
                                      >
                                        <InputNumber
                                          style={{ width: "100%" }}
                                          min={0}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        {...restField}
                                        label="Loại"
                                        name={[name, "point_type"]}
                                        rules={[{ required: true }]}
                                      >
                                        <Select
                                          options={[
                                            { label: "CTXH", value: "ctxh" },
                                            {
                                              label: "Rèn luyện",
                                              value: "ren_luyen",
                                            },
                                          ]}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        {...restField}
                                        label="Slot"
                                        name={[name, "max_slots"]}
                                      >
                                        <InputNumber
                                          style={{ width: "100%" }}
                                          min={1}
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                  {isExistingRole && (
                                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-200">
                                      <Button
                                        size="small"
                                        onClick={handleCancelEditRole}
                                        disabled={roleActionLoading}
                                      >
                                        <StopOutlined /> Hủy
                                      </Button>
                                      <Button
                                        type="primary"
                                        size="small"
                                        onClick={() =>
                                          handleUpdateSingleRole(index)
                                        }
                                        loading={roleActionLoading}
                                      >
                                        <CheckOutlined /> Lưu thay đổi
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-700">
                                  <p className="mb-1">
                                    <b>Mô tả:</b> {currentRole.description}
                                  </p>
                                  <p className="mb-1">
                                    <b>Yêu cầu:</b> {currentRole.requirements}
                                  </p>
                                  <div className="flex gap-4 mt-2">
                                    <Tag color="blue">
                                      Điểm: {currentRole.points_awarded}
                                    </Tag>
                                    <Tag color="cyan">
                                      Loại:{" "}
                                      {currentRole.point_type === "ctxh"
                                        ? "CTXH"
                                        : "Rèn luyện"}
                                    </Tag>
                                    <Tag color="purple">
                                      Slot: {currentRole.max_slots || "∞"}
                                    </Tag>
                                  </div>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                          style={{ marginBottom: 16 }}
                        >
                          Thêm vai trò mới
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    label="Đơn vị tổ chức"
                    name="organizer_unit_id"
                    rules={[{ required: true }]}
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
                    rules={[{ required: true }]}
                  >
                    <Select
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
                  }}
                >
                  {isEdit ? "Cập nhật hoạt động " : "Tạo hoạt động"}
                </Button>
                <Button
                  size="large"
                  icon={<CloseOutlined />}
                  onClick={() => navigate("/advisor/activities")}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </Space>
            </Form>
          </Card>
        </div>
      </Spin>
    </AdvisorLayout>
  );
};

export default CreateEditActivity;
