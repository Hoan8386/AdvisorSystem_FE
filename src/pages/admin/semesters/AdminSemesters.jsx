import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  getSemestersApi,
  createSemesterApi,
  updateSemesterApi,
  deleteSemesterApi,
} from "../../../services/api.service";

export const AdminSemesters = () => {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await getSemestersApi();
      if (response?.success && response?.data) {
        setSemesters(response.data);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      message.error("Không thể tải danh sách học kỳ");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSemester(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSemester(record);
    form.setFieldsValue({
      semester_name: record.semester_name,
      academic_year: record.academic_year,
      start_date: dayjs(record.start_date),
      end_date: dayjs(record.end_date),
    });
    setModalVisible(true);
  };

  const handleDelete = async (semesterId) => {
    try {
      const response = await deleteSemesterApi(semesterId);
      if (response?.success) {
        message.success("Xóa học kỳ thành công");
        fetchSemesters();
      }
    } catch (error) {
      console.error("Error deleting semester:", error);
      message.error(error?.message || "Không thể xóa học kỳ");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        ...values,
        start_date: values.start_date.format("YYYY-MM-DD"),
        end_date: values.end_date.format("YYYY-MM-DD"),
      };

      if (editingSemester) {
        // Update
        const response = await updateSemesterApi(
          editingSemester.semester_id,
          data
        );
        if (response?.success) {
          message.success("Cập nhật học kỳ thành công");
          setModalVisible(false);
          fetchSemesters();
        }
      } else {
        // Create
        const response = await createSemesterApi(data);
        if (response?.success) {
          message.success("Tạo học kỳ thành công");
          setModalVisible(false);
          fetchSemesters();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(error?.message || "Có lỗi xảy ra");
    }
  };

  const handleViewReports = (semesterId) => {
    navigate(`/admin/semesters/${semesterId}/reports`);
  };

  const columns = [
    {
      title: "Mã HK",
      dataIndex: "semester_id",
      key: "semester_id",
      width: 80,
    },
    {
      title: "Tên học kỳ",
      dataIndex: "semester_name",
      key: "semester_name",
    },
    {
      title: "Năm học",
      dataIndex: "academic_year",
      key: "academic_year",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleViewReports(record.semester_id)}
          >
            Báo cáo
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa học kỳ?"
            description="Bạn có chắc chắn muốn xóa học kỳ này?"
            onConfirm={() => handleDelete(record.semester_id)}
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
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý Học kỳ</h1>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSemesters}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Thêm học kỳ mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={semesters}
          rowKey="semester_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} học kỳ`,
          }}
        />
      </Card>

      <Modal
        title={editingSemester ? "Cập nhật học kỳ" : "Thêm học kỳ mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingSemester ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="semester_name"
            label="Tên học kỳ"
            rules={[
              { required: true, message: "Vui lòng nhập tên học kỳ" },
              { max: 50, message: "Tên học kỳ không quá 50 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Học kỳ 1" />
          </Form.Item>

          <Form.Item
            name="academic_year"
            label="Năm học"
            rules={[
              { required: true, message: "Vui lòng nhập năm học" },
              { max: 20, message: "Năm học không quá 20 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: 2024-2025" />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue("start_date")) {
                    return Promise.resolve();
                  }
                  if (value.isAfter(getFieldValue("start_date"))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Ngày kết thúc phải sau ngày bắt đầu")
                  );
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày kết thúc"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
