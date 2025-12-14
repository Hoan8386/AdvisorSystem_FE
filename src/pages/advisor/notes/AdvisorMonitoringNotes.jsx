import { useCallback, useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
  Select,
  Row,
  Col,
  Popconfirm,
  Statistic,
  Timeline,
  Empty,
  Avatar,
  Divider,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  BookOutlined, // Icon cho Học tập
  UserOutlined, // Icon cho Cá nhân
  WarningOutlined, // Icon cho Cảnh báo/Khác
  CalendarOutlined, // Icon lịch
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getMonitoringNotesAPI,
  deleteMonitoringNoteAPI,
  getSemestersAPI,
  getMonitoringNoteStatisticsAPI,
  getStudentNoteTimelineAPI,
} from "../../../services/api.service";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

function AdvisorMonitoringNotes() {
  const navigate = useNavigate();
  // ... (giữ nguyên các state cũ: notes, loading, statistics, filter...)
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [semesterFilter, setSemesterFilter] = useState(undefined);
  const [semesters, setSemesters] = useState([]);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ... (giữ nguyên các hàm fetchSemesters, fetchNotes, fetchStatistics)
  const fetchSemesters = useCallback(async () => {
    try {
      const response = await getSemestersAPI();
      if (response && response.data) {
        const options = response.data.map((sem) => ({
          label: `${sem.semester_name} - ${sem.academic_year}`,
          value: sem.semester_id,
        }));
        setSemesters(options);
      }
    } catch (error) {
      console.error("Lỗi tải học kỳ:", error);
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (semesterFilter) params.semester_id = semesterFilter;
      const response = await getMonitoringNotesAPI(params);
      if (response && response.data) {
        setNotes(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi");
    }
    setLoading(false);
  }, [categoryFilter, semesterFilter]);

  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = {};
      if (semesterFilter) params.semester_id = semesterFilter;
      const response = await getMonitoringNoteStatisticsAPI(params);
      if (response && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    }
    setStatsLoading(false);
  }, [semesterFilter]);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  useEffect(() => {
    fetchNotes();
    fetchStatistics();
  }, [fetchNotes, fetchStatistics]);

  // --- LOGIC TIMELINE (GIỮ NGUYÊN) ---
  const handleViewNoteTimeline = async (studentRecord) => {
    setSelectedStudent(studentRecord);
    setTimelineLoading(true);
    try {
      const response = await getStudentNoteTimelineAPI(
        studentRecord.student_id
      );

      if (response && response.data) {
        const apiData = response.data;
        const groupedNotes = apiData.notes_by_category || {};
        let allNotes = [
          ...(groupedNotes.academic || []),
          ...(groupedNotes.personal || []),
          ...(groupedNotes.attendance || []),
          ...(groupedNotes.other || []),
        ];
        allNotes.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setTimelineData(allNotes);
        setTimelineModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi tải timeline");
    }
    setTimelineLoading(false);
  };

  const confirmDelete = async (noteId) => {
    try {
      await deleteMonitoringNoteAPI(noteId);
      toast.success("Xóa thành công");
      // Nếu đang mở modal timeline, reload lại timeline hoặc đóng modal
      // Đơn giản nhất là đóng modal và reload bảng chính
      setTimelineModalOpen(false);
      fetchNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  // --- UI HELPER: Cấu hình Icon và Màu sắc cho đẹp hơn ---
  const getCategoryConfig = (category) => {
    const configs = {
      academic: {
        color: "#1890ff", // Blue
        bg: "#e6f7ff",
        label: "Học tập",
        icon: <BookOutlined />,
      },
      personal: {
        color: "#52c41a", // Green
        bg: "#f6ffed",
        label: "Cá nhân",
        icon: <UserOutlined />,
      },
      attendance: {
        color: "#faad14", // Orange
        bg: "#fffbe6",
        label: "Chuyên cần",
        icon: <ClockCircleOutlined />,
      },
      other: {
        color: "#8c8c8c", // Gray
        bg: "#f5f5f5",
        label: "Khác",
        icon: <FileTextOutlined />,
      },
    };
    return configs[category] || configs.other;
  };

  // ... (giữ nguyên getGroupedData, tableData, columns)
  const getGroupedData = () => {
    const grouped = {};
    notes.forEach((note) => {
      const key = note.student_id;
      if (!grouped[key]) {
        grouped[key] = {
          student_id: note.student_id,
          user_code: note.student?.user_code,
          full_name: note.student?.full_name,
          class_name: note.student?.class?.class_name,
          class_id: note.student?.class?.class_id,
          cpa10: note.student_academic_data?.cpa_semester?.cpa_10 || 0,
          cpa4: note.student_academic_data?.cpa_semester?.cpa_4 || 0,
          warnings: note.student_academic_data?.academic_warnings_count || 0,
          notes: [],
        };
      }
      grouped[key].notes.push(note);
    });
    return Object.values(grouped);
  };

  const tableData = getGroupedData();

  const columns = [
    {
      title: "Mã SV",
      dataIndex: "user_code",
      key: "user_code",
      width: 100,
      sorter: (a, b) => a.user_code.localeCompare(b.user_code),
    },
    {
      title: "Tên sinh viên",
      dataIndex: "full_name",
      key: "full_name",
      width: 180,
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: "Lớp",
      dataIndex: "class_name",
      key: "class_name",
      width: 100,
    },
    {
      title: "CPA (Tích lũy)",
      key: "cpa",
      width: 140,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-blue-600">
            Hệ 10:{" "}
            {typeof record.cpa10 === "number" ? record.cpa10.toFixed(2) : "N/A"}
          </span>
          <span className="text-xs text-gray-500">
            Hệ 4:{" "}
            {typeof record.cpa4 === "number" ? record.cpa4.toFixed(2) : "N/A"}
          </span>
        </div>
      ),
      sorter: (a, b) => a.cpa10 - b.cpa10,
    },
    {
      title: "Cảnh cáo",
      dataIndex: "warnings",
      key: "warnings",
      width: 120,
      render: (warnings) => (
        <Tag color={warnings > 0 ? "red" : "green"}>{warnings} lần</Tag>
      ),
      sorter: (a, b) => a.warnings - b.warnings,
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost // Style nhẹ hơn
            icon={<ClockCircleOutlined />}
            size="small"
            onClick={() => handleViewNoteTimeline(record)}
            style={{
              color: "white",
            }}
          >
            Lịch sử
          </Button>
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() =>
              navigate("/advisor/monitoring-notes/create", {
                state: { selectedStudent: record },
              })
            }
          >
            Thêm
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdvisorLayout>
      <div className="p-6">
        <Card>
          <div className="mb-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Ghi chú theo dõi sinh viên</h1>
              <p className="text-gray-600 mt-1">
                Quản lý ghi chú theo dõi học tập và thái độ
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate("/advisor/monitoring-notes/create")}
            >
              Tạo mới
            </Button>
          </div>

          <Row gutter={8} className="mb-4 flex-wrap items-end">
            <Col xs="auto">
              <div className="mb-2 text-sm font-medium">Danh mục</div>
              <Select
                className="w-36"
                placeholder="Tất cả"
                allowClear
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { label: "Học tập", value: "academic" },
                  { label: "Cá nhân", value: "personal" },
                  { label: "Chuyên cần", value: "attendance" },
                  { label: "Khác", value: "other" },
                ]}
              />
            </Col>
            <Col xs="auto">
              <div className="mb-2 text-sm font-medium">Học kỳ</div>
              <Select
                className="w-48"
                placeholder="Tất cả"
                allowClear
                value={semesterFilter}
                onChange={setSemesterFilter}
                options={semesters}
              />
            </Col>
            <Col xs="auto">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchNotes();
                  fetchStatistics();
                }}
                loading={loading || statsLoading}
                className="mt-6"
              >
                Làm mới
              </Button>
            </Col>
          </Row>

          {/* Statistics Section (giữ nguyên) */}
          {statistics && (
            <Row gutter={[16, 16]} className="mb-5">
              <Col xs={24} sm={12} md={6}>
                <Card loading={statsLoading} size="small">
                  <Statistic
                    title="Tổng cộng"
                    value={statistics.total || 0}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card loading={statsLoading} size="small">
                  <Statistic
                    title="Học tập"
                    value={statistics.by_category?.academic || 0}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<BookOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card loading={statsLoading} size="small">
                  <Statistic
                    title="Cá nhân"
                    value={statistics.by_category?.personal || 0}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card loading={statsLoading} size="small">
                  <Statistic
                    title="Chuyên cần"
                    value={statistics.by_category?.attendance || 0}
                    valueStyle={{ color: "#faad14" }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            rowKey="student_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: loading ? null : (
                <Empty description="Không có dữ liệu" />
              ),
            }}
          />
        </Card>

        {/* --- MODAL TIMELINE ĐÃ ĐƯỢC LÀM ĐẸP --- */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-lg">
              <Avatar style={{ backgroundColor: "#1890ff" }}>
                {selectedStudent?.full_name?.charAt(0)}
              </Avatar>
              <div>
                <div className="font-bold">{selectedStudent?.full_name}</div>
                <div className="text-xs font-normal text-gray-500">
                  {selectedStudent?.user_code} - {selectedStudent?.class_name}
                </div>
              </div>
            </div>
          }
          open={timelineModalOpen}
          onCancel={() => setTimelineModalOpen(false)}
          width={700}
          footer={null} // Ẩn footer mặc định để nhìn thoáng hơn
          loading={timelineLoading}
          styles={{
            body: {
              padding: "24px 24px 0 24px",
              maxHeight: "70vh",
              overflowY: "auto",
            },
          }}
        >
          {timelineLoading ? (
            <div className="text-center py-8">Đang tải lịch sử...</div>
          ) : timelineData.length > 0 ? (
            <Timeline
              mode="left" // Hiển thị nội dung bên phải, thời gian bên trái (nếu có label)
              items={timelineData.map((note) => {
                const config = getCategoryConfig(note.category);
                return {
                  // Icon chấm tròn trên timeline
                  dot: <div style={{ fontSize: "16px" }}>{config.icon}</div>,
                  color: config.color,
                  // label: dayjs(note.created_at).format("DD/MM/YYYY"), // Có thể bật cái này nếu muốn ngày hiện bên trái
                  children: (
                    <div
                      className="mb-6 rounded-lg border shadow-sm transition-all hover:shadow-md"
                      style={{
                        backgroundColor: "#fff",
                        borderColor: "#f0f0f0",
                        overflow: "hidden",
                      }}
                    >
                      {/* Header của thẻ note */}
                      <div
                        className="px-4 py-3 flex justify-between items-start border-b border-gray-100"
                        style={{ backgroundColor: "#fafafa" }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Tag color={config.color} bordered={false}>
                              {config.label}
                            </Tag>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <CalendarOutlined />
                              {dayjs(note.created_at).format(
                                "HH:mm DD/MM/YYYY"
                              )}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-800 m-0 text-base">
                            {note.title}
                          </h4>
                        </div>
                      </div>

                      {/* Nội dung */}
                      <div className="p-4">
                        <p className="whitespace-pre-wrap text-gray-700 m-0 leading-relaxed">
                          {note.content}
                        </p>
                      </div>

                      {/* Footer: Metadata + Action Buttons */}
                      <div className="px-4 py-2 bg-gray-50 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
                        <div className="flex flex-col gap-1">
                          <span>
                            HK: {note.semester?.semester_name} (
                            {note.semester?.academic_year})
                          </span>
                          <span>GV: {note.advisor?.full_name}</span>
                        </div>

                        <Space>
                          <Tooltip title="Chỉnh sửa">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              className="text-blue-500 hover:bg-blue-50"
                              onClick={() => {
                                navigate(
                                  `/advisor/monitoring-notes/${note.note_id}/edit`,
                                  {
                                    state: {
                                      note: {
                                        ...note,
                                        student: {
                                          ...note.student,
                                          user_code:
                                            selectedStudent?.user_code ||
                                            note.student?.user_code,
                                          class_id:
                                            selectedStudent?.class_id ||
                                            note.student?.class_id,
                                        },
                                      },
                                    },
                                  }
                                );
                                setTimelineModalOpen(false);
                              }}
                            />
                          </Tooltip>

                          <Popconfirm
                            title="Xóa ghi chú này?"
                            onConfirm={() => confirmDelete(note.note_id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <Tooltip title="Xóa">
                              <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                                className="hover:bg-red-50"
                              />
                            </Tooltip>
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  ),
                };
              })}
            />
          ) : (
            <Empty description="Chưa có ghi chú nào" />
          )}
        </Modal>
      </div>
    </AdvisorLayout>
  );
}

export default AdvisorMonitoringNotes;
