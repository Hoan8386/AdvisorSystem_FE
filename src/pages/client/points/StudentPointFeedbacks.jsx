import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Drawer,
  Spin,
  Select,
  Row,
  Col,
  Empty,
  Image,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getPointFeedbacksAPI,
  deletePointFeedbackAPI,
} from "../../../services/pointFeedback.service";
import { getSemestersAPI } from "../../../services/api.service";
import dayjs from "dayjs";

export default function StudentPointFeedbacks() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [semesterFilter, setSemesterFilter] = useState(undefined);

  const fetchSemesters = useCallback(async () => {
    try {
      const response = await getSemestersAPI();
      if (response && response.data) {
        const semesterOptions = response.data.map((sem) => ({
          label: sem.semester_name,
          value: sem.semester_id,
        }));
        setSemesters(semesterOptions);
      }
    } catch (error) {
      console.error("Lỗi khi tải học kỳ:", error);
    }
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (semesterFilter) params.semester_id = semesterFilter;

      const response = await getPointFeedbacksAPI(params);
      if (response && response.data) {
        setFeedbacks(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, semesterFilter]);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleDownloadAttachment = async (attachment) => {
    try {
      const baseUrl =
        import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;
      const fileUrl = `${baseUrl}storage/${attachment}`;

      // Fetch file as blob
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Tạo link tạm để download
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Lỗi khi tải file");
    }
  };

  const handleViewDetail = (record) => {
    setSelectedFeedback(record);
    setDrawerVisible(true);
  };

  const handleEdit = (record) => {
    navigate(`/student/point-feedbacks/${record.feedback_id}/edit`);
  };

  const handleDelete = (record) => {
    if (record.status !== "pending") {
      toast.error("Chỉ có thể xóa phản hồi ở trạng thái chờ duyệt");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
      deletePointFeedbackAPI(record.feedback_id)
        .then(() => {
          toast.success("Xóa phản hồi thành công");
          fetchFeedbacks();
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || "Lỗi khi xóa phản hồi");
        });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "feedback_id",
      key: "feedback_id",
      width: 60,
    },
    {
      title: "Nội dung",
      dataIndex: "feedback_content",
      key: "feedback_content",
      width: 250,
      render: (text) => (
        <div className="truncate max-w-xs" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colors = {
          pending: "orange",
          approved: "green",
          rejected: "red",
        };
        const labels = {
          pending: "Chờ duyệt",
          approved: "Đã duyệt",
          rejected: "Từ chối",
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: "Ngày gửi",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Sửa
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              >
                Xóa
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-5">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Phản hồi điểm của tôi</h1>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/student/point-feedbacks/create")}
              >
                Tạo phản hồi mới
              </Button>
            </div>

            <Row gutter={8} className="mb-4 flex-wrap items-end">
              {/* Filter trạng thái */}
              <Col xs="auto">
                <div className="mb-2 text-sm font-medium">Trạng thái</div>
                <Select
                  className="w-36"
                  placeholder="Tất cả trạng thái"
                  allowClear
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: "Chờ duyệt", value: "pending" },
                    { label: "Đã duyệt", value: "approved" },
                    { label: "Từ chối", value: "rejected" },
                  ]}
                />
              </Col>

              {/* Filter học kỳ */}
              <Col xs="auto">
                <div className="mb-2 text-sm font-medium">Học kỳ</div>
                <Select
                  className="w-36"
                  placeholder="Tất cả học kỳ"
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
                  onClick={fetchFeedbacks}
                  loading={loading}
                  className="mt-6 w-28"
                >
                  Làm mới
                </Button>
              </Col>
            </Row>

            <Spin spinning={loading}>
              {feedbacks.length === 0 ? (
                <Empty description="Không có phản hồi nào" />
              ) : (
                <Table
                  dataSource={feedbacks}
                  columns={columns}
                  rowKey="feedback_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} phản hồi`,
                  }}
                  scroll={{ x: 1200 }}
                />
              )}
            </Spin>
          </Card>

          {/* Chi tiết Drawer */}
          <Drawer
            title="Chi tiết phản hồi"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={600}
          >
            {selectedFeedback && (
              <div className="space-y-4">
                <div>
                  <label className="font-medium block mb-2">Trạng thái:</label>
                  <Tag
                    color={
                      selectedFeedback.status === "pending"
                        ? "orange"
                        : selectedFeedback.status === "approved"
                        ? "green"
                        : "red"
                    }
                  >
                    {selectedFeedback.status === "pending"
                      ? "Chờ duyệt"
                      : selectedFeedback.status === "approved"
                      ? "Đã duyệt"
                      : "Từ chối"}
                  </Tag>
                </div>

                <div>
                  <label className="font-medium block mb-2">Học kỳ:</label>
                  <p>{selectedFeedback.semester?.semester_name}</p>
                </div>

                <div>
                  <label className="font-medium block mb-2">
                    Nội dung phản hồi:
                  </label>
                  <p className="bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {selectedFeedback.feedback_content}
                  </p>
                </div>

                {selectedFeedback.attachment_path && (
                  <div>
                    <label className="font-medium block mb-2">
                      Tệp đính kèm:
                    </label>
                    <div className="flex flex-col gap-2">
                      {/\.(jpg|jpeg|png|gif)$/i.test(
                        selectedFeedback.attachment_path
                      ) ? (
                        <div className="border rounded p-2 inline-block">
                          <Image
                            src={`${
                              import.meta.env.VITE_BACKEND_URL ||
                              import.meta.env.VITE_API_BASE_URL
                            }storage/${selectedFeedback.attachment_path}`}
                            alt="Attachment"
                            style={{ maxHeight: "300px", width: "auto" }}
                            preview={{ mask: "Xem" }}
                          />
                        </div>
                      ) : null}
                      <button
                        onClick={() =>
                          handleDownloadAttachment(
                            selectedFeedback.attachment_path
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0 text-left"
                      >
                        📥 Tải xuống (
                        {selectedFeedback.attachment_path.split("/").pop()})
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-medium block mb-2">Ngày gửi:</label>
                  <p>
                    {dayjs(selectedFeedback.created_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
                </div>

                {selectedFeedback.status !== "pending" && (
                  <>
                    <div>
                      <label className="font-medium block mb-2">
                        Phản hồi của cố vấn:
                      </label>
                      <p className="bg-blue-50 p-3 rounded whitespace-pre-wrap">
                        {selectedFeedback.advisor_response}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium block mb-2">Cố vấn:</label>
                      <p>{selectedFeedback.advisor?.full_name}</p>
                    </div>
                    <div>
                      <label className="font-medium block mb-2">
                        Ngày phê duyệt:
                      </label>
                      <p>
                        {dayjs(selectedFeedback.response_at).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </Drawer>
        </div>
      </div>
    </StudentLayout>
  );
}
