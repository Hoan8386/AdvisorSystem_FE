import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Tag,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  getMyUnitCoursesApi,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
} from "../../../services/api.service";

export const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [unitInfo, setUnitInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getMyUnitCoursesApi();
      if (response?.success && response?.data) {
        setCourses(response.data.courses || []);
        setUnitInfo(response.data.unit_info || null);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error(error?.message || "Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    form.resetFields();
    if (unitInfo) {
      form.setFieldsValue({ unit_id: unitInfo.unit_id });
    }
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCourse(record);
    form.setFieldsValue({
      course_code: record.course_code,
      course_name: record.course_name,
      credits: record.credits,
      unit_id: record.unit_id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (courseId) => {
    try {
      const response = await deleteCourseApi(courseId);
      if (response?.success) {
        message.success("Xóa môn học thành công");
        fetchCourses();
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      message.error(error?.message || "Không thể xóa môn học");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingCourse) {
        // Update
        const response = await updateCourseApi(editingCourse.course_id, values);
        if (response?.success) {
          message.success("Cập nhật môn học thành công");
          setModalVisible(false);
          fetchCourses();
        }
      } else {
        // Create
        const response = await createCourseApi(values);
        if (response?.success) {
          message.success("Tạo môn học thành công");
          setModalVisible(false);
          fetchCourses();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(error?.message || "Có lỗi xảy ra");
    }
  };

  const columns = [
    {
      title: "Mã môn học",
      dataIndex: "course_code",
      key: "course_code",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên môn học",
      dataIndex: "course_name",
      key: "course_name",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Số tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 100,
      align: "center",
      render: (credits) => <Tag color="green">{credits} TC</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa môn học?"
            description="Bạn có chắc chắn muốn xóa môn học này? Chỉ có thể xóa nếu chưa có điểm."
            onConfirm={() => handleDelete(record.course_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Tổng số môn học"
              value={courses.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Khoa quản lý"
              value={unitInfo?.unit_name || "Chưa có"}
              valueStyle={{ fontSize: "16px" }}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Môn học</h1>
            <p className="text-gray-500 mt-1">
              Quản lý các môn học thuộc khoa {unitInfo?.unit_name}
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCourses}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Thêm môn học mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={courses}
          rowKey="course_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} môn học`,
          }}
        />
      </Card>

      <Modal
        title={editingCourse ? "Cập nhật môn học" : "Thêm môn học mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingCourse ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="course_code"
            label="Mã môn học"
            rules={[
              { required: true, message: "Vui lòng nhập mã môn học" },
              { max: 20, message: "Mã môn học không quá 20 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: CS101" />
          </Form.Item>

          <Form.Item
            name="course_name"
            label="Tên môn học"
            rules={[
              { required: true, message: "Vui lòng nhập tên môn học" },
              { max: 255, message: "Tên môn học không quá 255 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Lập trình căn bản" />
          </Form.Item>

          <Form.Item
            name="credits"
            label="Số tín chỉ"
            rules={[
              { required: true, message: "Vui lòng nhập số tín chỉ" },
              {
                type: "number",
                min: 1,
                max: 10,
                message: "Số tín chỉ phải từ 1 đến 10",
              },
            ]}
          >
            <InputNumber
              min={1}
              max={10}
              style={{ width: "100%" }}
              placeholder="Nhập số tín chỉ"
            />
          </Form.Item>

          <Form.Item name="unit_id" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
