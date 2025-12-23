import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Select,
  DatePicker,
  Input,
  Tag,
  Modal,
  Descriptions,
  Statistic,
  Row,
  Col,
  Spin,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  getDialoguesApi,
  getDialogueDetailApi,
  getDialogueStatisticsApi,
  exportDialoguesReportApi,
  getClassesApi,
} from "../../../services/api.service";

const { RangePicker } = DatePicker;
const { Option } = Select;

export const AdminDialogues = () => {
  const [dialogues, setDialogues] = useState([]);
  const [classes, setClasses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDialogue, setSelectedDialogue] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    source: "all",
    class_id: null,
    status: null,
    notification_type: null,
    from_date: null,
    to_date: null,
    keyword: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  useEffect(() => {
    fetchClasses();
    fetchDialogues();
    fetchStatistics();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await getClassesApi();
      if (response?.success && response?.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchDialogues = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      // Remove null/empty values
      Object.keys(params).forEach((key) => {
        if (params[key] === null || params[key] === "") {
          delete params[key];
        }
      });

      const response = await getDialoguesApi(params);
      if (response?.success && response?.data) {
        setDialogues(response.data);
      }
    } catch (error) {
      console.error("Error fetching dialogues:", error);
      toast.error("Không thể tải danh sách ý kiến đối thoại");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === null || params[key] === "") {
          delete params[key];
        }
      });

      const response = await getDialogueStatisticsApi(params);
      if (response?.success && response?.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setStatisticsLoading(false);
    }
  };

  const handleViewDetail = async (record) => {
    try {
      setDetailLoading(true);
      setDetailModalVisible(true);
      const response = await getDialogueDetailApi(record.source, record.id);
      if (response?.success && response?.data) {
        setSelectedDialogue(response.data);
      }
    } catch (error) {
      console.error("Error fetching dialogue detail:", error);
      toast.error("Không thể tải chi tiết ý kiến");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setExportLoading(true);
      const params = {
        class_id: filters.class_id,
        from_date: filters.from_date,
        to_date: filters.to_date,
        source: filters.source,
      };

      const response = await exportDialoguesReportApi(params);

      // Lấy blob từ response
      let blob;

      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

      if (!blob || blob.size === 0) {
        toast.error("File xuất trống hoặc không hợp lệ");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BaoCao_YKienDoiThoai_${dayjs().format(
        "YYYYMMDDHHmmss"
      )}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất báo cáo thành công");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Không thể xuất báo cáo");
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        from_date: dates[0].format("YYYY-MM-DD"),
        to_date: dates[1].format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        from_date: null,
        to_date: null,
      }));
    }
  };

  const handleSearch = () => {
    fetchDialogues();
    fetchStatistics();
  };

  const handleReset = () => {
    setFilters({
      source: "all",
      class_id: null,
      status: null,
      notification_type: null,
      from_date: null,
      to_date: null,
      keyword: "",
      sort_by: "created_at",
      sort_order: "desc",
    });
    setTimeout(() => {
      fetchDialogues();
      fetchStatistics();
    }, 100);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nguồn",
      dataIndex: "source",
      key: "source",
      width: 120,
      render: (source) => (
        <Tag color={source === "meeting" ? "blue" : "green"}>
          {source === "meeting" ? "Cuộc họp" : "Thông báo"}
        </Tag>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "source_title",
      key: "source_title",
      ellipsis: true,
    },
    {
      title: "Sinh viên",
      key: "student",
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.student_name}</div>
          <div className="text-xs text-gray-500">{record.student_code}</div>
        </div>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "class_name",
      key: "class_name",
      width: 120,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => {
        if (record.source === "meeting") {
          return null;
        }
        return status === "resolved" ? (
          <Tag color="success">Đã xử lý</Tag>
        ) : (
          <Tag color="warning">Chưa xử lý</Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Section */}
      {statisticsLoading ? (
        <Card>
          <Spin />
        </Card>
      ) : (
        statistics && (
          <Card title="Thống kê tổng quan" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Statistic
                  title="Tổng số ý kiến"
                  value={statistics.overview?.total_all || 0}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Statistic
                  title="Từ cuộc họp"
                  value={statistics.overview?.total_meeting || 0}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Statistic
                  title="Từ thông báo"
                  value={statistics.overview?.total_notification || 0}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Statistic
                  title="TB Chưa xử lý"
                  value={statistics.overview?.notification_pending || 0}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Statistic
                  title="TB Đã xử lý"
                  value={statistics.overview?.notification_resolved || 0}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Statistic
                  title="TB Đã phản hồi"
                  value={statistics.overview?.notification_responded || 0}
                  valueStyle={{ color: "#13c2c2" }}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Statistic
                  title="Tỷ lệ phản hồi"
                  value={statistics.overview?.notification_response_rate || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>
          </Card>
        )
      )}

      {/* Filters Section */}
      <Card
        title={
          <>
            <FilterOutlined /> Bộ lọc
          </>
        }
        size="small"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Nguồn ý kiến"
              value={filters.source}
              onChange={(value) => handleFilterChange("source", value)}
            >
              <Option value="all">Tất cả</Option>
              <Option value="meeting">Cuộc họp</Option>
              <Option value="notification">Thông báo</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn lớp"
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={filters.class_id}
              onChange={(value) => handleFilterChange("class_id", value)}
            >
              {classes.map((cls) => (
                <Option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Trạng thái (chỉ thông báo)"
              allowClear
              disabled={filters.source !== "notification"}
              value={filters.source === "notification" ? filters.status : null}
              onChange={(value) => handleFilterChange("status", value)}
            >
              <Option value="pending">Chưa xử lý</Option>
              <Option value="resolved">Đã xử lý</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Loại thông báo"
              allowClear
              disabled={filters.source !== "notification"}
              value={
                filters.source === "notification"
                  ? filters.notification_type
                  : null
              }
              onChange={(value) =>
                handleFilterChange("notification_type", value)
              }
            >
              <Option value="announcement">Thông báo chung</Option>
              <Option value="academic">Học vụ</Option>
              <Option value="warning">Cảnh báo</Option>
              <Option value="activity">Hoạt động</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              onChange={handleDateRangeChange}
              value={
                filters.from_date && filters.to_date
                  ? [dayjs(filters.from_date), dayjs(filters.to_date)]
                  : null
              }
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm từ khóa..."
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>Đặt lại</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Data Table Section */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách ý kiến đối thoại</h2>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchDialogues();
                fetchStatistics();
              }}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportReport}
              loading={exportLoading}
            >
              Xuất báo cáo
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={dialogues}
          rowKey={(record) => `${record.source}-${record.id}`}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} ý kiến`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết ý kiến đối thoại"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedDialogue(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedDialogue(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {detailLoading ? (
          <Spin />
        ) : (
          selectedDialogue && (
            <div className="space-y-4">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Nguồn">
                  <Tag
                    color={
                      selectedDialogue.source === "meeting" ? "blue" : "green"
                    }
                  >
                    {selectedDialogue.source === "meeting"
                      ? "Cuộc họp"
                      : "Thông báo"}
                  </Tag>
                </Descriptions.Item>

                {selectedDialogue.source === "meeting" &&
                  selectedDialogue.meeting && (
                    <>
                      <Descriptions.Item label="Tiêu đề cuộc họp">
                        {selectedDialogue.meeting.title}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian họp">
                        {dayjs(selectedDialogue.meeting.meeting_time).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Cố vấn">
                        {selectedDialogue.meeting.advisor?.full_name}
                      </Descriptions.Item>
                    </>
                  )}

                {selectedDialogue.source === "notification" &&
                  selectedDialogue.notification && (
                    <>
                      <Descriptions.Item label="Tiêu đề thông báo">
                        {selectedDialogue.notification.title}
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại thông báo">
                        {selectedDialogue.notification.type}
                      </Descriptions.Item>
                    </>
                  )}

                <Descriptions.Item label="Sinh viên">
                  {selectedDialogue.student?.full_name} (
                  {selectedDialogue.student?.user_code})
                </Descriptions.Item>

                <Descriptions.Item label="Lớp">
                  {selectedDialogue.student?.class?.class_name}
                </Descriptions.Item>

                <Descriptions.Item label="Nội dung ý kiến">
                  <div className="whitespace-pre-wrap">
                    {selectedDialogue.content}
                  </div>
                </Descriptions.Item>

                {selectedDialogue.advisor_response && (
                  <Descriptions.Item label="Phản hồi của cố vấn">
                    <div className="whitespace-pre-wrap">
                      {selectedDialogue.advisor_response}
                    </div>
                  </Descriptions.Item>
                )}

                {selectedDialogue.advisor && (
                  <Descriptions.Item label="Cố vấn phản hồi">
                    {selectedDialogue.advisor.full_name}
                  </Descriptions.Item>
                )}

                {selectedDialogue.source === "notification" && (
                  <Descriptions.Item label="Trạng thái">
                    {selectedDialogue.status === "resolved" ? (
                      <Tag color="success">Đã xử lý</Tag>
                    ) : (
                      <Tag color="warning">Chưa xử lý</Tag>
                    )}
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Ngày tạo">
                  {dayjs(selectedDialogue.created_at).format(
                    "DD/MM/YYYY HH:mm:ss"
                  )}
                </Descriptions.Item>

                {selectedDialogue.response_at && (
                  <Descriptions.Item label="Ngày phản hồi">
                    {dayjs(selectedDialogue.response_at).format(
                      "DD/MM/YYYY HH:mm:ss"
                    )}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};
