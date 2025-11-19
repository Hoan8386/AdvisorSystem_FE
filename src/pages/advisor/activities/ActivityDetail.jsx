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
  DownloadOutlined,
  UploadOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getActivityDetailAPI,
  deleteActivityAPI,
  exportRegistrationsAPI,
  exportAttendanceTemplateAPI,
  importAttendanceAPI,
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
      navigate("/advisor/activities");
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
            navigate("/advisor/activities");
          }
        } catch (error) {
          toast.error(error?.message || "Lỗi khi xóa hoạt động");
        }
      },
    });
  };

  const handleExportRegistrations = async () => {
    try {
      const toastId = toast.loading("Đang xuất danh sách đăng ký...");
      const response = await exportRegistrationsAPI(id);

      // Lấy tên file từ Content-Disposition header hoặc tạo tên mặc định
      let fileName = "DanhSachDangKy.xlsx";
      const contentDisposition = response.headers?.["content-disposition"];
      console.log("Content-Disposition:", contentDisposition);

      if (contentDisposition) {
        // Try different patterns for filename extraction
        let matches = contentDisposition.match(
          /filename\*=(?:UTF-8'')?(.+?)(?:;|$)/
        );
        if (!matches) {
          matches = contentDisposition.match(/filename=(.+?)(?:;|$)/);
        }
        if (matches && matches[1]) {
          fileName = decodeURIComponent(matches[1]).replace(/"/g, "").trim();
          console.log("Extracted fileName:", fileName);
        }
      }

      // Download file - response.data là Blob từ axios interceptor
      const blob = response.data || response;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success("Xuất danh sách đăng ký thành công");
    } catch (error) {
      const errorMsg =
        error?.response?.status === 403
          ? "Bạn không có quyền xuất danh sách này"
          : error?.response?.status === 404
          ? "Hoạt động không tồn tại"
          : error?.message ||
            "Lỗi khi xuất danh sách đăng ký. Vui lòng thử lại.";
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const handleExportAttendanceTemplate = async () => {
    try {
      const toastId = toast.loading("Đang xuất file mẫu điểm danh...");
      const response = await exportAttendanceTemplateAPI(id);

      // Lấy tên file từ Content-Disposition header hoặc tạo tên mặc định
      let fileName = "DiemDanh.xlsx";
      const contentDisposition = response.headers?.["content-disposition"];
      console.log("Content-Disposition:", contentDisposition);

      if (contentDisposition) {
        // Try different patterns for filename extraction
        let matches = contentDisposition.match(
          /filename\*=(?:UTF-8'')?(.+?)(?:;|$)/
        );
        if (!matches) {
          matches = contentDisposition.match(/filename=(.+?)(?:;|$)/);
        }
        if (matches && matches[1]) {
          fileName = decodeURIComponent(matches[1]).replace(/"/g, "").trim();
          console.log("Extracted fileName:", fileName);
        }
      }

      // Download file - response.data là Blob từ axios interceptor
      const blob = response.data || response;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success("Xuất file mẫu điểm danh thành công");
    } catch (error) {
      const errorMsg =
        error?.response?.status === 400
          ? "Hoạt động chưa diễn ra hoặc không thể xuất file mẫu"
          : error?.response?.status === 403
          ? "Bạn không có quyền xuất file mẫu này"
          : error?.response?.status === 404
          ? "Hoạt động không tồn tại"
          : error?.message ||
            "Lỗi khi xuất file mẫu điểm danh. Vui lòng thử lại.";
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const handleImportAttendance = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Kiểm tra kích thước file (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File quá lớn. Tối đa 5MB.");
        return;
      }

      let toastId;
      try {
        toastId = toast.loading("Đang nhập file điểm danh...");
        const response = await importAttendanceAPI(id, file);

        toast.dismiss(toastId);

        // Hiển thị kết quả import bằng toast
        const importData = response.data.data || response.data;
        const message = `✅ Nhập thành công: ${
          importData.total_updated || 0
        } cập nhật${
          importData.total_skipped > 0
            ? `, ${importData.total_skipped} bỏ qua`
            : ""
        }${
          importData.total_errors > 0 ? `, ${importData.total_errors} lỗi` : ""
        }`;

        toast.success(message);
        fetchActivityDetail();
      } catch (error) {
        toast.dismiss(toastId);
        const errorMsg =
          error?.response?.status === 400
            ? error?.response?.data?.message ||
              "File không hợp lệ hoặc hoạt động chưa diễn ra"
            : error?.response?.status === 403
            ? "Bạn không có quyền cập nhật điểm danh"
            : error?.response?.status === 404
            ? "Hoạt động không tồn tại"
            : error?.response?.status === 422
            ? error?.response?.data?.message ||
              "Dữ liệu không hợp lệ. Kiểm tra lại file."
            : error?.message ||
              "Lỗi khi nhập file điểm danh. Vui lòng thử lại.";
        toast.error(errorMsg);
        console.error(error);
      }
    };
    input.click();
  };

  const handleViewAttendanceStatistics = () => {
    navigate(`/advisor/activities/${id}/statistics`);
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
          {record.registrations_count || 0}
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
        {/* Header Container */}
        <div className="flex flex-col gap-4 mb-6">
          {/* --- DÒNG 1: Tiêu đề và Các nút thao tác chính --- */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/advisor/activities")}
                size="large"
              />
              <h1 className="text-2xl font-bold text-gray-900 m-0">
                📋 Chi tiết hoạt động
              </h1>
            </div>

            {/* Right: Main Actions (Phân công, Danh sách, Sửa, Xóa) */}
            <Space size="middle" wrap>
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() =>
                  navigate(`/advisor/activities/${id}/assign-students`)
                }
                style={{
                  background:
                    "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                  border: "none",
                }}
              >
                Phân công sinh viên
              </Button>
              <Button
                type="primary"
                icon={<TeamOutlined />}
                onClick={() =>
                  navigate(`/advisor/activities/${id}/registrations`)
                }
                style={{
                  background:
                    "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                  border: "none",
                }}
              >
                Danh sách đăng ký
              </Button>

              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/advisor/activities/${id}/edit`)}
              >
                Chỉnh sửa
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                Xóa
              </Button>
            </Space>
          </div>

          {/* --- DÒNG 2: Các nút Export/Import/Thống kê (Căn phải) --- */}
          <div className="flex items-center justify-end flex-wrap gap-3">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportRegistrations}
              title="Xuất tất cả sinh viên đã đăng ký hoạt động"
              style={{
                borderRadius: "6px",
                color: "#1890ff",
                borderColor: "#1890ff",
              }}
            >
              Export danh sách
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportAttendanceTemplate}
              title="Xuất file Excel để điểm danh"
              style={{
                borderRadius: "6px",
                color: "#faad14",
                borderColor: "#faad14",
              }}
            >
              Export mẫu điểm danh
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={handleImportAttendance}
              title="Nhập file điểm danh và cập nhật trạng thái"
              style={{
                borderRadius: "6px",
                color: "#52c41a",
                borderColor: "#52c41a",
              }}
            >
              Import điểm danh
            </Button>
            <Button
              icon={<BarChartOutlined />}
              onClick={handleViewAttendanceStatistics}
              title="Xem báo cáo tổng hợp"
              style={{
                borderRadius: "6px",
                color: "#722ed1",
                borderColor: "#722ed1",
              }}
            >
              Thống kê điểm danh
            </Button>
          </div>
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

          <Descriptions
            column={1}
            bordered
            labelStyle={{
              fontWeight: 600,
              backgroundColor: "#fafafa",
              fontSize: "15px",
              width: "200px",
            }}
            contentStyle={{
              fontSize: "15px",
              fontWeight: 500,
              backgroundColor: "#ffffff",
            }}
          >
            <Descriptions.Item
              label={
                <span style={{ color: "#1890ff" }}>
                  <CalendarOutlined className="mr-2" />
                  Thời gian bắt đầu
                </span>
              }
            >
              <span
                style={{ color: "#262626", fontWeight: 600, fontSize: "16px" }}
              >
                {dayjs(activity.start_time).format("DD/MM/YYYY HH:mm")}
              </span>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span style={{ color: "#1890ff" }}>
                  <CalendarOutlined className="mr-2" />
                  Thời gian kết thúc
                </span>
              }
            >
              <span
                style={{ color: "#262626", fontWeight: 600, fontSize: "16px" }}
              >
                {dayjs(activity.end_time).format("DD/MM/YYYY HH:mm")}
              </span>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span style={{ color: "#52c41a" }}>
                  <EnvironmentOutlined className="mr-2" />
                  Địa điểm
                </span>
              }
            >
              <span
                style={{ color: "#262626", fontWeight: 600, fontSize: "16px" }}
              >
                {activity.location}
              </span>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span style={{ color: "#fa8c16" }}>
                  <TeamOutlined className="mr-2" />
                  Đơn vị tổ chức
                </span>
              }
            >
              <span
                style={{ color: "#262626", fontWeight: 600, fontSize: "16px" }}
              >
                {activity.organizer_unit?.unit_name || "N/A"}
              </span>
            </Descriptions.Item>

            {activity.general_description && (
              <Descriptions.Item
                label={<span style={{ color: "#722ed1" }}>📝 Mô tả chung</span>}
              >
                <div
                  className="whitespace-pre-wrap"
                  style={{
                    lineHeight: "1.8",
                    color: "#262626",
                    fontSize: "15px",
                    padding: "8px 0",
                    fontWeight: 500,
                  }}
                >
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
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
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
