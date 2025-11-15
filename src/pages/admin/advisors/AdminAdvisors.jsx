import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Avatar,
  Upload,
  Modal,
  message,
} from "antd";
import {
  UserOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getClassesApi,
  downloadTemplateApi,
  importAdvisorsApi,
} from "../../../services/api.service";

export const AdminAdvisors = () => {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const response = await getClassesApi();
      if (response?.success && response?.data) {
        // Extract unique advisors from classes
        const advisorMap = new Map();
        response.data.forEach((classItem) => {
          if (classItem.advisor) {
            const advisorId = classItem.advisor.advisor_id;
            if (!advisorMap.has(advisorId)) {
              advisorMap.set(advisorId, {
                ...classItem.advisor,
                classCount: 0,
                classes: [],
              });
            }
            const advisor = advisorMap.get(advisorId);
            advisor.classCount++;
            advisor.classes.push({
              class_id: classItem.class_id,
              class_name: classItem.class_name,
              description: classItem.description,
              faculty: classItem.faculty,
            });
          }
        });
        setAdvisors(Array.from(advisorMap.values()));
      }
    } catch (error) {
      console.error("Error fetching advisors:", error);
      message.error("Không thể tải danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  };

  // Download template for advisors
  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const response = await downloadTemplateApi("advisors");

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
      link.download = `Template_Advisors_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Tải template thành công");
    } catch (error) {
      console.error("Error downloading template:", error);
      message.error(error?.message || "Không thể tải template");
    } finally {
      setLoading(false);
    }
  };

  // Import advisors from Excel
  const handleImportAdvisors = async (file) => {
    try {
      setLoading(true);
      const response = await importAdvisorsApi(file);

      if (response?.success) {
        const { imported, errors } = response.data;
        message.success(`Import thành công ${imported} giảng viên`);

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

        fetchAdvisors();
      }
    } catch (error) {
      console.error("Error importing advisors:", error);
      message.error(error?.message || "Có lỗi xảy ra khi import file");
    } finally {
      setLoading(false);
    }

    return false;
  };

  const handleViewClasses = (advisor) => {
    navigate(`/admin/advisors/${advisor.advisor_id}/classes`, {
      state: { advisor },
    });
  };

  const columns = [
    {
      title: "Avatar",
      key: "avatar",
      width: 80,
      render: (_, record) => (
        <Avatar
          size={50}
          icon={<UserOutlined />}
          src={record.avatar_url}
          style={{ backgroundColor: "#1890ff" }}
        />
      ),
    },
    {
      title: "Mã GV",
      dataIndex: "user_code",
      key: "user_code",
      width: 100,
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Số lớp quản lý",
      dataIndex: "classCount",
      key: "classCount",
      width: 150,
      render: (count) => (
        <Tag color="blue" className="text-base font-semibold">
          {count} lớp
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewClasses(record)}
        >
          Xem lớp
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Danh sách Giảng viên</h1>
            <p className="text-gray-500 mt-1">
              Xem danh sách giảng viên và các lớp họ quản lý
            </p>
          </div>
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
              beforeUpload={handleImportAdvisors}
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                Import Excel
              </Button>
            </Upload>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAdvisors}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={advisors}
          rowKey="advisor_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} giảng viên`,
          }}
        />
      </Card>
    </div>
  );
};
