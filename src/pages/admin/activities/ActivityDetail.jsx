import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Button,
  Space,
  Descriptions,
  Tag,
  Table,
  Modal,
  Divider,
} from "antd";
import { toast } from "react-toastify";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getActivityDetailAPI,
  deleteActivityAPI,
} from "../../../services/api.service";

export const ActivityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      const res = await getActivityDetailAPI(id);
      if (res && res.data) {
        setActivity(res.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu hoạt động");
      console.error(error);
      navigate("/admin/activities");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa hoạt động này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteActivityAPI(id);
          if (res && res.success) {
            toast.success("Xóa hoạt động thành công");
            navigate("/admin/activities");
          }
        } catch (error) {
          toast.error(error?.message || "Lỗi khi xóa hoạt động");
        }
      },
    });
  };

  const statusConfig = {
    upcoming: { color: "blue", text: "Sắp diễn ra" },
    ongoing: { color: "green", text: "Đang diễn ra" },
    completed: { color: "default", text: "Đã hoàn thành" },
    cancelled: { color: "red", text: "Đã hủy" },
  };

  const pointTypeLabels = {
    ctxh: "Cộng tác xã hội",
    ren_luyen: "Rèn luyện",
  };

  const roleColumns = [
    {
      title: "Vai trò",
      dataIndex: "role_name",
      key: "role_name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Yêu cầu",
      dataIndex: "requirements",
      key: "requirements",
      render: (text) => text || "-",
    },
    {
      title: "Điểm thưởng",
      key: "points",
      render: (_, record) => (
        <Space>
          <Tag color="green">{record.points_awarded} điểm</Tag>
          <Tag color="blue">{pointTypeLabels[record.point_type]}</Tag>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      key: "slots",
      render: (_, record) => (
        <span>
          {record.current_registrations || 0}
          {record.max_slots ? ` / ${record.max_slots}` : " / ∞"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdvisorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Đang tải...</div>
        </div>
      </AdvisorLayout>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <AdvisorLayout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/activities")}
              size="large"
            />
            <h1 className="text-2xl font-bold text-gray-900 m-0">
              📋 Chi tiết hoạt động
            </h1>
          </div>

          <Space size="middle">
            <Button
              type="primary"
              icon={<TeamOutlined />}
              onClick={() => navigate(`/admin/activities/${id}/registrations`)}
              style={{
                background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                border: "none",
              }}
            >
              Danh sách đăng ký
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/activities/${id}/edit`)}
            >
              Chỉnh sửa
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Xóa
            </Button>
          </Space>
        </div>

        {/* Main Info */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">{activity.title}</h2>
            <Tag color={statusConfig[activity.status]?.color}>
              {statusConfig[activity.status]?.text}
            </Tag>
          </div>

          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered>
            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined className="mr-2" />
                  Thời gian bắt đầu
                </span>
              }
            >
              {dayjs(activity.start_time).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined className="mr-2" />
                  Thời gian kết thúc
                </span>
              }
            >
              {dayjs(activity.end_time).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <EnvironmentOutlined className="mr-2" />
                  Địa điểm
                </span>
              }
            >
              {activity.location}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <TeamOutlined className="mr-2" />
                  Đơn vị tổ chức
                </span>
              }
            >
              {activity.organizer_unit?.unit_name || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <TeamOutlined className="mr-2" />
                  Tổng đăng ký
                </span>
              }
            >
              {activity.total_registrations || 0} sinh viên
            </Descriptions.Item>

            {activity.general_description && (
              <Descriptions.Item label="Mô tả chung" span={3}>
                <div className="whitespace-pre-wrap">
                  {activity.general_description}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Roles */}
        <Card
          title={
            <span className="text-lg font-semibold">
              👥 Các vai trò trong hoạt động
            </span>
          }
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Table
            columns={roleColumns}
            dataSource={activity.roles || []}
            rowKey="activity_role_id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Stats */}
        {activity.statistics && (
          <Card
            title={<span className="text-lg font-semibold">📊 Thống kê</span>}
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {activity.statistics.total_registrations || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Tổng đăng ký</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {activity.statistics.attended || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Đã tham gia</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {activity.statistics.pending || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Đang chờ</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {activity.statistics.cancelled || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Đã hủy</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdvisorLayout>
  );
};

export default ActivityDetail;
