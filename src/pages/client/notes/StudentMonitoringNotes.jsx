import { useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  Card,
  Timeline,
  Spin,
  Empty,
  Select,
  Row,
  Col,
  Tag,
  Button,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { getMonitoringNoteTimelineAPI } from "../../../services/pointFeedback.service";
import dayjs from "dayjs";

export default function StudentMonitoringNotes() {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(undefined);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem("student_id");
      if (!studentId) {
        toast.error("Không tìm thấy thông tin sinh viên");
        return;
      }

      const response = await getMonitoringNoteTimelineAPI(studentId);
      if (response && response.data) {
        setTimeline(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: "blue",
      personal: "green",
      attendance: "orange",
      other: "gray",
    };
    const labels = {
      academic: "Học tập",
      personal: "Cá nhân",
      attendance: "Chuyên cần",
      other: "Khác",
    };
    return { color: colors[category], label: labels[category] };
  };

  const getAllNotes = () => {
    if (!timeline?.notes_by_category) return [];
    return Object.values(timeline.notes_by_category).flat();
  };

  const getFilteredNotes = () => {
    if (!selectedCategory) return getAllNotes();
    return timeline?.notes_by_category?.[selectedCategory] || [];
  };

  const filteredNotes = getFilteredNotes();

  return (
    <StudentLayout>
      <div className="p-6">
        <Card className="mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Ghi chú theo dõi của tôi
            </h1>
            {timeline?.student && (
              <p className="text-gray-600">
                {timeline.student.full_name} - {timeline.student.user_code}
              </p>
            )}
          </div>

          {timeline && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {timeline.total_notes}
                </p>
                <p className="text-sm text-gray-600">Tổng ghi chú</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-cyan-600">
                  {timeline.by_category?.academic || 0}
                </p>
                <p className="text-sm text-gray-600">Học tập</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  {timeline.by_category?.personal || 0}
                </p>
                <p className="text-sm text-gray-600">Cá nhân</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {timeline.by_category?.attendance || 0}
                </p>
                <p className="text-sm text-gray-600">Chuyên cần</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {timeline.by_category?.other || 0}
                </p>
                <p className="text-sm text-gray-600">Khác</p>
              </div>
            </div>
          )}

          <Row gutter={16} className="mb-6">
            <Col xs={24} md={6}>
              <div className="mb-2 text-sm font-medium">Danh mục</div>
              <Select
                className="w-full"
                placeholder="Tất cả danh mục"
                allowClear
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { label: "Học tập", value: "academic" },
                  { label: "Cá nhân", value: "personal" },
                  { label: "Chuyên cần", value: "attendance" },
                  { label: "Khác", value: "other" },
                ]}
              />
            </Col>
            <Col xs={24} md={6} className="flex items-end">
              <Button block onClick={loadTimeline} loading={loading}>
                Làm mới
              </Button>
            </Col>
          </Row>

          <Spin spinning={loading}>
            {filteredNotes && filteredNotes.length > 0 ? (
              <Timeline
                items={filteredNotes.map((note) => {
                  const { color, label } = getCategoryColor(note.category);
                  return {
                    dot: <CalendarOutlined className="timeline-clock-icon" />,
                    color: color,
                    children: (
                      <div className="bg-white p-4 rounded-lg border-l-4 border-gray-300">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {note.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {note.advisor?.full_name}
                            </p>
                          </div>
                          <Tag color={color}>{label}</Tag>
                        </div>

                        <p className="text-gray-700 mb-3">{note.content}</p>

                        {note.semester && (
                          <p className="text-xs text-gray-500">
                            {note.semester.semester_name} -{" "}
                            {note.semester.academic_year}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          {dayjs(note.created_at).format("DD/MM/YYYY HH:mm")}
                        </p>
                      </div>
                    ),
                  };
                })}
              />
            ) : (
              <Empty description="Không có ghi chú nào" />
            )}
          </Spin>
        </Card>
      </div>
    </StudentLayout>
  );
}
