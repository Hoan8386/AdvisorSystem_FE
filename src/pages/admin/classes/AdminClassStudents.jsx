import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Table,
  Button,
  Card,
  Descriptions,
  Space,
  Tag,
  Upload,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import {
  getClassDetailApi,
  getClassStudentsApi,
  downloadTemplateApi,
  importStudentsApi,
  exportStudentsByClassApi,
} from "../../../services/api.service";

export const AdminClassStudents = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const response = await getClassDetailApi(classId);
        if (response?.success && response?.data) {
          setClassInfo(response.data);
        }
      } catch (error) {
        console.error("Error fetching class info:", error);
        toast.error("Không thể tải thông tin lớp");
      }
    };

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await getClassStudentsApi(classId);
        if (response?.success && response?.data) {
          setStudents(response.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Không thể tải danh sách sinh viên");
      } finally {
        setLoading(false);
      }
    };

    fetchClassInfo();
    fetchStudents();
  }, [classId]);

  const refreshStudents = async () => {
    try {
      setLoading(true);
      const response = await getClassStudentsApi(classId);
      if (response?.success && response?.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setLoading(false);
    }
  };

  // Download template for students
  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const response = await downloadTemplateApi("students");

      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      link.download = `Template_Students_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Tải template thành công");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error(error?.message || "Không thể tải template");
    } finally {
      setLoading(false);
    }
  };

  // Import students from Excel
  const handleImportStudents = async (file) => {
    try {
      setLoading(true);
      const response = await importStudentsApi(file);

      if (response?.success) {
        const { imported, errors } = response.data;
        toast.success(`Import thành công ${imported} sinh viên`);

        if (errors && errors.length > 0) {
          Modal.warning({
            title: `Có ${errors.length} lỗi khi import`,
            content: (
              <div style={{ maxHeight: "400px", overflow: "auto" }}>
                {errors.map((err, index) => (
                  <div key={index} className="mb-2">
                    {err}
                  </div>
                ))}
              </div>
            ),
            width: 600,
          });
        }

        refreshStudents();
      }
    } catch (error) {
      console.error("Error importing students:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi import file");
    } finally {
      setLoading(false);
    }

    return false;
  };

  // Export students by class
  const handleExportStudents = async () => {
    try {
      setLoading(true);
      const response = await exportStudentsByClassApi(classId);

      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const className = classInfo?.class_name || "class";
      link.download = `Danh_sach_SV_${className}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất danh sách sinh viên thành công");
    } catch (error) {
      console.error("Error exporting students:", error);
      toast.error(error?.message || "Không thể xuất danh sách");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã SV",
      dataIndex: "user_code",
      key: "user_code",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "studying" ? "green" : "red"}>
          {status === "studying" ? "Đang học" : "Đã nghỉ"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/classes")}
            className="mb-4"
          >
            Quay lại
          </Button>

          <h1 className="text-2xl font-bold mb-4">
            Danh sách sinh viên - {classInfo?.class_name}
          </h1>

          {classInfo && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên lớp">
                {classInfo.class_name}
              </Descriptions.Item>
              <Descriptions.Item label="Cố vấn">
                {classInfo.advisor?.full_name || "Chưa có"}
              </Descriptions.Item>
              <Descriptions.Item label="Khoa">
                {classInfo.faculty?.unit_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số sinh viên">
                {students.length}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {classInfo.description || "Không có mô tả"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách sinh viên</h2>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              loading={loading}
            >
              Tải template
            </Button>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={handleImportStudents}
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                Import Excel
              </Button>
            </Upload>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExportStudents}
              loading={loading}
            >
              Xuất danh sách
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshStudents}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="student_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} sinh viên`,
          }}
        />
      </Card>
    </div>
  );
};
