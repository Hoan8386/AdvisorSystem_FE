import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Table, Button, Card, Descriptions, Tag, Avatar, Space } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getAvatarUrl } from "../../../utils/avatarHelper";

export const AdminAdvisorClasses = () => {
  const { advisorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (location.state?.advisor) {
      const advisorData = location.state.advisor;
      setAdvisor(advisorData);
      setClasses(advisorData.classes || []);
    }
  }, [location.state, advisorId]);

  const handleViewStudents = (classId) => {
    navigate(`/admin/classes/${classId}/students`);
  };

  const columns = [
    {
      title: "Mã lớp",
      dataIndex: "class_id",
      key: "class_id",
      width: 100,
    },
    {
      title: "Tên lớp",
      dataIndex: "class_name",
      key: "class_name",
      render: (text) => <span className="font-semibold text-lg">{text}</span>,
    },
    {
      title: "Khoa",
      key: "faculty",
      render: (_, record) => (
        <Tag color="purple">{record.faculty?.unit_name || "N/A"}</Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewStudents(record.class_id)}
        >
          Xem sinh viên
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/advisors")}
          className="mb-4"
        >
          Quay lại danh sách giảng viên
        </Button>

        {advisor && (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  src={getAvatarUrl(advisor.avatar_url)}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <div>
                  <h1 className="text-2xl font-bold">{advisor.full_name}</h1>
                  <p className="text-gray-500">{advisor.user_code}</p>
                </div>
              </div>

              <Descriptions bordered column={2}>
                <Descriptions.Item label="Email">
                  {advisor.email}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {advisor.phone_number}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  <Tag color="blue">Giảng viên</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số lớp quản lý">
                  <Tag color="green">{classes.length} lớp</Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Danh sách lớp do {advisor.full_name} quản lý
              </h2>
            </div>

            <Table
              columns={columns}
              dataSource={classes}
              rowKey="class_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} lớp`,
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
};
