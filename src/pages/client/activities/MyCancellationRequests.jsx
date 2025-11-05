import { useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import { Card, Button, Table, Tag, Empty, Space } from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getMyCancellationRequestsAPI } from "../../../services/api.service";

export const MyCancellationRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyCancellationRequests();
  }, []);

  const fetchMyCancellationRequests = async () => {
    try {
      setLoading(true);
      const res = await getMyCancellationRequestsAPI();
      if (res && res.data) {
        setRequests(res.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách yêu cầu hủy");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const requestStatusConfig = {
    pending: {
      color: "orange",
      text: "Chờ duyệt",
      icon: <ClockCircleOutlined />,
    },
    approved: {
      color: "green",
      text: "Đã duyệt",
      icon: <CheckCircleOutlined />,
    },
    rejected: {
      color: "red",
      text: "Đã từ chối",
      icon: <CloseCircleOutlined />,
    },
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Hoạt động",
      dataIndex: "activity_title",
      key: "activity_title",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500 mt-1">
            Vai trò: {record.role_name}
          </div>
        </div>
      ),
    },
    {
      title: "Lý do hủy",
      dataIndex: "reason",
      key: "reason",
      render: (text) => (
        <div className="max-w-md">
          <p className="m-0 line-clamp-2">{text}</p>
        </div>
      ),
    },
    {
      title: "Người phụ trách",
      dataIndex: "advisor_name",
      key: "advisor_name",
      width: 150,
    },
    {
      title: "Ngày gửi",
      dataIndex: "requested_at",
      key: "requested_at",
      width: 150,
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      align: "center",
      render: (status) => (
        <Tag
          color={requestStatusConfig[status]?.color}
          icon={requestStatusConfig[status]?.icon}
        >
          {requestStatusConfig[status]?.text}
        </Tag>
      ),
    },
  ];

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/student/activities/my-registrations")}
            size="large"
          />
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            📋 Yêu cầu hủy đăng ký
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Tổng yêu cầu</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Chờ duyệt</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-600">Đã duyệt</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-sm text-gray-600">Đã từ chối</div>
          </Card>
        </div>

        {/* Table */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="request_id"
            loading={loading}
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
              showSizeChanger: true,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Bạn chưa có yêu cầu hủy nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Space>
                    <Button
                      type="primary"
                      onClick={() =>
                        navigate("/student/activities/my-registrations")
                      }
                    >
                      Xem đăng ký của tôi
                    </Button>
                  </Space>
                </Empty>
              ),
            }}
          />
        </Card>

        {/* Help */}
        <Card
          size="small"
          style={{
            background: "#f0f9ff",
            borderRadius: 8,
            border: "1px solid #bae6fd",
          }}
        >
          <div style={{ fontSize: 13, color: "#0369a1" }}>
            <strong>💡 Lưu ý:</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
              <li>
                Yêu cầu hủy cần được giảng viên phụ trách xem xét và phê duyệt
              </li>
              <li>
                Nếu yêu cầu được duyệt, đăng ký của bạn sẽ chuyển sang trạng
                thái "Đã hủy"
              </li>
              <li>
                Nếu yêu cầu bị từ chối, bạn vẫn phải tham gia hoạt động đã đăng
                ký
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default MyCancellationRequests;
