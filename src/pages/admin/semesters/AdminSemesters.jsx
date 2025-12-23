import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Popconfirm,
  Card,
  Tabs,
  Upload,
  Spin,
  Result,
  Collapse,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  getSemestersApi,
  createSemesterApi,
  updateSemesterApi,
  deleteSemesterApi,
  downloadWarningsTemplateApi,
  importWarningsApi,
} from "../../../services/api.service";
import { AdminDialogues } from "./AdminDialogues";

export const AdminSemesters = () => {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [form] = Form.useForm();

  // Warnings state
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importingFile, setImportingFile] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showImportResult, setShowImportResult] = useState(false);

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
      toast.error("Không thể tải danh sách học kỳ");
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
      setDeleteLoadingId(semesterId);
      const response = await deleteSemesterApi(semesterId);
      if (response?.success) {
        toast.success("Xóa học kỳ thành công");
        fetchSemesters();
      }
    } catch (error) {
      console.error("Error deleting semester:", error);
      toast.error(error?.message || "Không thể xóa học kỳ");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
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
          toast.success("Cập nhật học kỳ thành công");
          setModalVisible(false);
          fetchSemesters();
        }
      } else {
        // Create
        const response = await createSemesterApi(data);
        if (response?.success) {
          toast.success("Tạo học kỳ thành công");
          setModalVisible(false);
          fetchSemesters();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleViewReports = (semesterId) => {
    navigate(`/admin/semesters/${semesterId}/reports`);
  };

  // Warnings handlers
  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await downloadWarningsTemplateApi();
      if (response) {
        // Create blob from response data
        const blob = new Blob([response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = dayjs().format("YYYYMMDD_HHmmss");
        link.href = url;
        link.setAttribute(
          "download",
          `Template_Import_Canh_Cao_Hoc_Vu_${timestamp}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Tải template thành công");
      }
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error(
        error?.message || "Không thể tải template. Vui lòng thử lại."
      );
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImportWarnings = async (file) => {
    try {
      setImportingFile(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await importWarningsApi(formData);

      if (response?.success) {
        setImportResult(response.data);
        setShowImportResult(true);
        toast.success("Import cảnh cáo hoàn tất");
      }
    } catch (error) {
      console.error("Error importing warnings:", error);
      toast.error(error?.message || "Không thể import file. Vui lòng thử lại.");
    } finally {
      setImportingFile(false);
    }
  };

  const beforeUpload = (file) => {
    const isXlsx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    const isLt10m = file.size / 1024 / 1024 < 10;

    if (!isXlsx) {
      toast.error("File phải có định dạng xlsx hoặc xls");
      return false;
    }
    if (!isLt10m) {
      toast.error("Kích thước file không được vượt quá 10MB");
      return false;
    }

    handleImportWarnings(file);
    return false; // Prevent automatic upload
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
            disabled={deleteLoadingId === record.semester_id}
          >
            Báo cáo
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={deleteLoadingId === record.semester_id}
          />
          <Popconfirm
            title="Xác nhận xóa học kỳ?"
            description="Bạn có chắc chắn muốn xóa học kỳ này?"
            onConfirm={() => handleDelete(record.semester_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoadingId === record.semester_id}
              disabled={
                deleteLoadingId !== null &&
                deleteLoadingId !== record.semester_id
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-5">Quản lý Học kỳ</h1>

        <Tabs
          type="card"
          items={[
            {
              key: "semesters",
              label: "Danh sách học kỳ",
              children: (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchSemesters}
                        loading={loading}
                        disabled={submitLoading || deleteLoadingId !== null}
                      >
                        Làm mới
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        disabled={
                          loading || submitLoading || deleteLoadingId !== null
                        }
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
                </div>
              ),
            },
            {
              key: "warnings",
              label: "Cảnh cáo học vụ",
              children: (
                <div className="space-y-6">
                  {/* Download Template Section */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-900">
                      Tải Template Import
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tải file Excel template để chuẩn bị dữ liệu import cảnh
                      cáo học vụ.
                    </p>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      loading={downloadingTemplate}
                      onClick={handleDownloadTemplate}
                      size="large"
                    >
                      Tải Template
                    </Button>
                  </div>

                  {/* Import Section */}
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold mb-4 text-green-900">
                      Import Cảnh cáo Học vụ
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Chọn file Excel (.xlsx hoặc .xls) để import cảnh cáo học
                      vụ hàng loạt. Kích thước tối đa 10MB.
                    </p>
                    <Upload
                      accept=".xlsx,.xls"
                      maxCount={1}
                      beforeUpload={beforeUpload}
                      disabled={importingFile}
                      listType="text"
                    >
                      <Button
                        icon={<UploadOutlined />}
                        loading={importingFile}
                        disabled={importingFile}
                        size="large"
                      >
                        Chọn file để import
                      </Button>
                    </Upload>
                  </div>

                  {/* Import Result Section */}
                  {showImportResult && importResult && (
                    <div className="bg-white p-6 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Kết quả Import
                        </h3>
                        <Button
                          type="text"
                          onClick={() => setShowImportResult(false)}
                        >
                          Đóng
                        </Button>
                      </div>

                      {/* Summary Section */}
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Tổng dòng xử lý
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {importResult.summary?.total_rows_processed || 0}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Thành công</p>
                          <p className="text-2xl font-bold text-green-600">
                            {importResult.summary?.success_count || 0}
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Cảnh báo</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {importResult.summary?.warning_count || 0}
                          </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Lỗi</p>
                          <p className="text-2xl font-bold text-red-600">
                            {importResult.summary?.error_count || 0}
                          </p>
                        </div>
                      </div>

                      {/* Success Details */}
                      {importResult.details?.success &&
                        importResult.details.success.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3 text-green-700 flex items-center gap-2">
                              <span className="text-lg">✓</span>Cảnh cáo thành
                              công ({importResult.details.success.length})
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-green-100">
                                    <th className="border p-2 text-left">
                                      Dòng
                                    </th>
                                    <th className="border p-2 text-left">
                                      Mã SV
                                    </th>
                                    <th className="border p-2 text-left">
                                      Tên SV
                                    </th>
                                    <th className="border p-2 text-left">
                                      Lớp
                                    </th>
                                    <th className="border p-2 text-left">
                                      Cố vấn
                                    </th>
                                    <th className="border p-2 text-left">
                                      Học kỳ
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {importResult.details.success.map(
                                    (item, index) => (
                                      <tr
                                        key={index}
                                        className="border-b hover:bg-green-50"
                                      >
                                        <td className="border p-2">
                                          {item.row}
                                        </td>
                                        <td className="border p-2">
                                          {item.user_code}
                                        </td>
                                        <td className="border p-2">
                                          {item.student_name}
                                        </td>
                                        <td className="border p-2">
                                          {item.class_name}
                                        </td>
                                        <td className="border p-2">
                                          {item.advisor_name}
                                        </td>
                                        <td className="border p-2">
                                          {item.semester}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                      {/* Warnings Details */}
                      {importResult.details?.warnings &&
                        importResult.details.warnings.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-semibold mb-3 text-yellow-700 flex items-center gap-2">
                              <ExclamationCircleOutlined /> Cảnh báo (
                              {importResult.details.warnings.length})
                            </h4>
                            <div className="space-y-2">
                              {importResult.details.warnings.map(
                                (item, index) => (
                                  <div
                                    key={index}
                                    className="bg-yellow-50 border border-yellow-200 p-3 rounded"
                                  >
                                    <p className="font-medium text-yellow-900">
                                      Dòng {item.row} - Mã SV: {item.user_code}
                                    </p>
                                    <p className="text-yellow-800 text-sm">
                                      {item.warning}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Error Details */}
                      {importResult.details?.errors &&
                        importResult.details.errors.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 text-red-700 flex items-center gap-2">
                              <span className="text-lg">✕</span>Lỗi (
                              {importResult.details.errors.length})
                            </h4>
                            <div className="space-y-2">
                              {importResult.details.errors.map(
                                (item, index) => (
                                  <div
                                    key={index}
                                    className="bg-red-50 border border-red-200 p-3 rounded"
                                  >
                                    <p className="font-medium text-red-900">
                                      Dòng {item.row} - Mã SV: {item.user_code}
                                    </p>
                                    <p className="text-red-800 text-sm">
                                      {item.error}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "dialogues",
              label: (
                <span>
                  <CommentOutlined /> Tổng hợp ý kiến
                </span>
              ),
              children: <AdminDialogues />,
            },
          ]}
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
        confirmLoading={submitLoading}
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
