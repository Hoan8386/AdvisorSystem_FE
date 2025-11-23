import { useCallback, useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Table,
  Button,
  Space,
  Drawer,
  Tag,
  Select,
  Row,
  Col,
  Popconfirm, // <--- 1. Import Popconfirm
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
  getSemestersAPI,
} from "../../../services/api.service";
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
  const [semesters, setSemesters] = useState([]);

  // Fetch semesters
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

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

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

  // 2. Logic xóa (Không còn Modal.confirm ở đây nữa, chỉ gọi API)
  const confirmDelete = async (noteId) => {
    try {
      await deleteMonitoringNoteAPI(noteId);
      toast.success("Xóa thành công");
      fetchNotes();

      // Nếu đang mở drawer của note vừa xóa thì đóng lại
      if (drawerOpen && selectedNote?.note_id === noteId) {
        setDrawerOpen(false);
        setSelectedNote(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    }
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
          {/* 3. Áp dụng Popconfirm trong bảng */}
          <Popconfirm
            title="Xóa ghi chú"
            description="Bạn chắc chắn muốn xóa ghi chú này?"
            onConfirm={() => confirmDelete(r.note_id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
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
            {/* Filter danh mục */}
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

            {/* Filter học kỳ */}
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

            {/* Nút làm mới */}
            <Col xs="auto">
              <Button
                type="primary"
                onClick={fetchNotes}
                loading={loading}
                className="mt-6 w-28"
              >
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

                {/* 4. Áp dụng Popconfirm trong Drawer */}
                <Popconfirm
                  title="Xóa ghi chú"
                  description="Bạn chắc chắn muốn xóa ghi chú này?"
                  onConfirm={() => confirmDelete(selectedNote.note_id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger>Xóa</Button>
                </Popconfirm>
              </Space>
            </div>
          )}
        </Drawer>
      </div>
    </AdvisorLayout>
  );
}

export default AdvisorMonitoringNotes;
