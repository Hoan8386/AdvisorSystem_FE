import { useCallback, useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Table,
  Button,
  Space,
  Drawer,
  Tag,
  Modal,
  Select,
  Row,
  Col,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getMonitoringNotesAPI,
  deleteMonitoringNoteAPI,
  getMonitoringNoteDetailAPI,
} from "../../../services/pointFeedback.service";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

function AdvisorMonitoringNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [semesterFilter, setSemesterFilter] = useState(undefined);

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

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleViewDetail = async (record) => {
    try {
      const response = await getMonitoringNoteDetailAPI(record.note_id);
      if (response && response.data) {
        setSelectedNote(response.data);
        setDrawerOpen(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xóa ghi chú",
      content: "Chắc chắn xóa?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteMonitoringNoteAPI(record.note_id);
          toast.success("Xóa thành công");
          fetchNotes();
        } catch (error) {
          toast.error(error.response?.data?.message || "Lỗi");
        }
      },
    });
  };

  const getCategoryColor = (category) => {
    const map = {
      academic: { color: "blue", label: "Học tập" },
      personal: { color: "green", label: "Cá nhân" },
      attendance: { color: "orange", label: "Chuyên cần" },
      other: { color: "gray", label: "Khác" },
    };
    return map[category] || { color: "gray", label: "Khác" };
  };

  const columns = [
    { title: "ID", dataIndex: "note_id", key: "note_id", width: 80 },
    {
      title: "Sinh viên",
      render: (_, r) => (
        <div>
          <div className="font-semibold">{r.student?.full_name}</div>
          <div className="text-xs text-gray-500">{r.student?.user_code}</div>
        </div>
      ),
      width: 150,
    },
    { title: "Tiêu đề", dataIndex: "title", key: "title", ellipsis: true },
    {
      title: "Danh mục",
      render: (_, r) => {
        const item = getCategoryColor(r.category);
        return <Tag color={item.color}>{item.label}</Tag>;
      },
      width: 120,
    },
    {
      title: "Học kỳ",
      render: (_, r) =>
        `${r.semester?.semester_name} - ${r.semester?.academic_year}`,
      width: 150,
    },
    {
      title: "Ngày tạo",
      render: (_, r) => dayjs(r.created_at).format("DD/MM/YYYY HH:mm"),
      width: 150,
    },
    {
      title: "Hành động",
      width: 150,
      fixed: "right",
      render: (_, r) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(r)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              navigate(`/advisor/monitoring-notes/${r.note_id}/edit`, {
                state: { note: r },
              })
            }
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(r)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AdvisorLayout>
      <div className="p-6">
        <Card>
          <div className="mb-6 flex justify-between items-center">
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

          <Row gutter={16} className="mb-6">
            <Col xs={24} md={8}>
              <div className="mb-2 text-sm font-medium">Danh mục</div>
              <Select
                placeholder="Tất cả"
                allowClear
                value={categoryFilter}
                onChange={setCategoryFilter}
                className="w-full"
                options={[
                  { label: "Học tập", value: "academic" },
                  { label: "Cá nhân", value: "personal" },
                  { label: "Chuyên cần", value: "attendance" },
                  { label: "Khác", value: "other" },
                ]}
              />
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-2 text-sm font-medium">Học kỳ</div>
              <Select
                placeholder="Tất cả"
                allowClear
                value={semesterFilter}
                onChange={setSemesterFilter}
                className="w-full"
                options={[
                  { label: "HK1 - 2024-2025", value: 1 },
                  { label: "HK2 - 2024-2025", value: 2 },
                ]}
              />
            </Col>
            <Col xs={24} md={8} className="flex items-end">
              <Button block onClick={fetchNotes} loading={loading}>
                Làm mới
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={notes}
            loading={loading}
            rowKey="note_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </Card>

        <Drawer
          title="Chi tiết ghi chú"
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={600}
        >
          {selectedNote && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold">ID</label>
                <p>{selectedNote.note_id}</p>
              </div>
              <div>
                <label className="font-semibold">Sinh viên</label>
                <p>
                  {selectedNote.student?.full_name} (
                  {selectedNote.student?.user_code})
                </p>
              </div>
              <div>
                <label className="font-semibold">Tiêu đề</label>
                <p>{selectedNote.title}</p>
              </div>
              <div>
                <label className="font-semibold">Danh mục</label>
                <div className="mt-1">
                  <Tag color={getCategoryColor(selectedNote.category).color}>
                    {getCategoryColor(selectedNote.category).label}
                  </Tag>
                </div>
              </div>
              <div>
                <label className="font-semibold">Nội dung</label>
                <p className="whitespace-pre-wrap">{selectedNote.content}</p>
              </div>
              <div>
                <label className="font-semibold">Học kỳ</label>
                <p>
                  {selectedNote.semester?.semester_name} -{" "}
                  {selectedNote.semester?.academic_year}
                </p>
              </div>
              <div>
                <label className="font-semibold">Ngày tạo</label>
                <p>
                  {dayjs(selectedNote.created_at).format("DD/MM/YYYY HH:mm:ss")}
                </p>
              </div>
              <Space className="mt-6 w-full">
                <Button
                  type="primary"
                  onClick={() => {
                    navigate(
                      `/advisor/monitoring-notes/${selectedNote.note_id}/edit`,
                      { state: { note: selectedNote } }
                    );
                    setDrawerOpen(false);
                  }}
                >
                  Sửa
                </Button>
                <Button
                  danger
                  onClick={() => {
                    handleDelete(selectedNote);
                    setDrawerOpen(false);
                  }}
                >
                  Xóa
                </Button>
              </Space>
            </div>
          )}
        </Drawer>
      </div>
    </AdvisorLayout>
  );
}

export default AdvisorMonitoringNotes;
