import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Tag,
  Tooltip,
  Spin,
  Empty,
  Drawer,
  Descriptions,
  Avatar,
} from "antd";
import { Eye, Trash2, Download, RotateCw } from "lucide-react";
import { toast } from "react-toastify";
import { getMeetingsApi, deleteMeetingApi } from "../../services/api.service";
import MeetingDetailModal from "../../components/admin/MeetingDetailModal";
import dayjs from "dayjs";

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    class_id: undefined,
    status: undefined,
    from_date: undefined,
    to_date: undefined,
  });
  const [searchText, setSearchText] = useState("");

  // Extract unique classes for filter
  const [classes, setClasses] = useState([]);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMeetingsApi(filters);

      if (result.success) {
        setMeetings(result.data);

        // Extract unique classes
        const uniqueClasses = [
          ...new Map(
            result.data.map((meeting) => [
              meeting.class.class_id,
              meeting.class,
            ])
          ).values(),
        ];
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Không thể tải danh sách cuộc họp");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Gọi lần đầu tiên khi component mount
    const initialFetch = async () => {
      try {
        setLoading(true);
        const result = await getMeetingsApi({});

        if (result.success) {
          setMeetings(result.data);

          // Extract unique classes
          const uniqueClasses = [
            ...new Map(
              result.data.map((meeting) => [
                meeting.class.class_id,
                meeting.class,
              ])
            ).values(),
          ];
          setClasses(uniqueClasses);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
        toast.error("Không thể tải danh sách cuộc họp");
      } finally {
        setLoading(false);
      }
    };
    initialFetch();
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [filters, fetchMeetings]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      class_id: undefined,
      status: undefined,
      from_date: undefined,
      to_date: undefined,
    });
    setSearchText("");
  };

  const handleViewDetail = (meeting) => {
    setSelectedMeeting(meeting);
    setDetailModalVisible(true);
  };

  const handleDeleteMeeting = (meetingId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa cuộc họp này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteMeetingApi(meetingId);
          toast.success("Xóa cuộc họp thành công");
          fetchMeetings();
        } catch (error) {
          console.error("Error deleting meeting:", error);
          toast.error("Không thể xóa cuộc họp");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDownloadMinutes = async (meeting) => {
    if (!meeting.minutes_file_path) {
      toast.warning("Cuộc họp này chưa có biên bản");
      return;
    }

    // Download file
    const link = document.createElement("a");
    link.href = `/storage/${meeting.minutes_file_path}`;
    link.download = meeting.minutes_file_path.split("/").pop();
    link.click();
  };

  // Filter meetings by search text
  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchText.toLowerCase()) ||
      meeting.class.class_name
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      meeting.advisor.full_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{record.class.class_name}</div>
        </div>
      ),
    },
    {
      title: "Cố vấn",
      dataIndex: ["advisor", "full_name"],
      key: "advisor",
      width: 180,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500">
            {record.advisor.user_code}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian họp",
      dataIndex: "meeting_time",
      key: "meeting_time",
      width: 160,
      render: (time) => {
        const formattedTime = dayjs(time).format("DD/MM/YYYY HH:mm");
        return formattedTime;
      },
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 120,
      render: (location) =>
        location || <span className="text-gray-400">-</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          scheduled: { color: "blue", label: "Đã lên lịch" },
          completed: { color: "green", label: "Đã hoàn thành" },
          cancelled: { color: "red", label: "Đã hủy" },
        };
        const config = statusConfig[status] || {
          color: "default",
          label: status,
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Biên bản",
      dataIndex: "minutes_file_path",
      key: "minutes",
      width: 100,
      render: (minutes, record) => {
        if (minutes) {
          return (
            <Tooltip title="Tải biên bản">
              <Button
                type="text"
                size="small"
                onClick={() => handleDownloadMinutes(record)}
              >
                <Download size={16} />
              </Button>
            </Tooltip>
          );
        }
        return <span className="text-gray-400 text-xs">Chưa có</span>;
      },
    },
    {
      title: "Điểm danh",
      dataIndex: "attendees",
      key: "attendance",
      width: 120,
      render: (attendees) => {
        const attended = attendees.filter((a) => a.attended).length;
        const total = attendees.length;
        return (
          <div>
            <div className="font-semibold">
              {attended}/{total}
            </div>
            <div className="text-xs text-gray-500">
              {total > 0 ? ((attended / total) * 100).toFixed(0) : 0}%
            </div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              size="small"
              onClick={() => handleViewDetail(record)}
            >
              <Eye size={16} />
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Quản lý cuộc họp
      </h1>

      <Card className="shadow-lg " style={{ marginBottom: "20px" }}>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} lg={6}>
            <Input.Search
              placeholder="Tìm kiếm tiêu đề, lớp, cố vấn..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Chọn lớp"
              value={filters.class_id}
              onChange={(value) => handleFilterChange("class_id", value)}
              allowClear
              className="w-full"
              options={classes.map((cls) => ({
                label: cls.class_name,
                value: cls.class_id,
              }))}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Chọn trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
              className="w-full"
              options={[
                { label: "Đã lên lịch", value: "scheduled" },
                { label: "Đã hoàn thành", value: "completed" },
                { label: "Đã hủy", value: "cancelled" },
              ]}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Button onClick={handleResetFilters} className="w-full">
              <RotateCw className="inline mr-2" size={16} />
              Đặt lại
            </Button>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <p className="text-gray-600">
              Tổng số cuộc họp:{" "}
              <span className="font-semibold">{filteredMeetings.length}</span>
            </p>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-lg">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredMeetings}
            rowKey="meeting_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} cuộc họp`,
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: <Empty description="Không có dữ liệu" />,
            }}
          />
        </Spin>
      </Card>

      {selectedMeeting && (
        <MeetingDetailModal
          visible={detailModalVisible}
          meeting={selectedMeeting}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedMeeting(null);
          }}
          onRefresh={fetchMeetings}
        />
      )}
    </div>
  );
};

export default AdminMeetings;
