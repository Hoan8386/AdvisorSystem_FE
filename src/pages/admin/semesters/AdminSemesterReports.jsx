import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Card, Descriptions, message, Tag } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getSemesterDetailApi,
  getSemesterReportsApi,
} from "../../../services/api.service";

export const AdminSemesterReports = () => {
  const { semesterId } = useParams();
  const navigate = useNavigate();
  const [semesterInfo, setSemesterInfo] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSemesterInfo = async () => {
      try {
        const response = await getSemesterDetailApi(semesterId);
        if (response?.success && response?.data) {
          setSemesterInfo(response.data);
        }
      } catch (error) {
        console.error("Error fetching semester info:", error);
        message.error("Không thể tải thông tin học kỳ");
      }
    };

    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getSemesterReportsApi(semesterId);
        if (response?.success && response?.data) {
          setReports(response.data.reports || []);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        message.error("Không thể tải báo cáo học kỳ");
      } finally {
        setLoading(false);
      }
    };

    if (semesterId) {
      fetchSemesterInfo();
      fetchReports();
    }
  }, [semesterId]);

  const refreshReports = async () => {
    try {
      setLoading(true);
      const response = await getSemesterReportsApi(semesterId);
      if (response?.success && response?.data) {
        setReports(response.data.reports || []);
        message.success("Đã cập nhật dữ liệu");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      message.error("Không thể tải báo cáo học kỳ");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC CẬP NHẬT MÀU SẮC KẾT QUẢ ---
  const getOutcomeColor = (outcome) => {
    if (!outcome) return "default";

    // Chuyển về chữ thường để so sánh tương đối (contains)
    const text = outcome.toLowerCase();

    // Ưu tiên các trạng thái nghiêm trọng hoặc đặc biệt
    if (text.includes("buộc thôi học") || text.includes("thôi học")) {
      return "error"; // Màu đỏ
    }
    if (text.includes("cảnh cáo")) {
      return "warning"; // Màu cam
    }
    if (text.includes("khen thưởng") || text.includes("xuất sắc")) {
      return "purple"; // Màu tím (cho sinh viên giỏi)
    }
    if (text.includes("học tiếp")) {
      return "success"; // Màu xanh lá
    }
    if (text.includes("chưa có điểm")) {
      return "default"; // Màu xám
    }

    return "default";
  };
  // ---------------------------------------

  const columns = [
    {
      title: "Mã SV",
      key: "user_code",
      render: (_, record) => record.student?.user_code,
      width: 100,
    },
    {
      title: "Họ và tên",
      key: "full_name",
      render: (_, record) => record.student?.full_name,
      width: 180,
    },
    {
      title: "Lớp",
      key: "class",
      render: (_, record) => record.student?.class?.class_name,
      width: 100,
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      width: 80,
      align: "center",
      render: (gpa) => (gpa ? parseFloat(gpa).toFixed(2) : "-"),
    },
    {
      title: "CPA",
      dataIndex: "cpa_10_scale",
      key: "cpa_10_scale",
      width: 80,
      align: "center",
      render: (cpa) => (cpa ? parseFloat(cpa).toFixed(2) : "-"),
    },
    {
      title: "TC ĐK",
      dataIndex: "credits_registered",
      key: "credits_registered",
      width: 80,
      align: "center",
    },
    {
      title: "TC Đạt",
      dataIndex: "credits_passed",
      key: "credits_passed",
      width: 80,
      align: "center",
    },
    {
      title: "Điểm RL",
      dataIndex: "training_point_summary",
      key: "training_point_summary",
      width: 90,
      align: "center",
    },
    {
      title: "Kết quả",
      dataIndex: "outcome",
      key: "outcome",
      width: 250,
      render: (outcome) => (
        <Tag color={getOutcomeColor(outcome)} style={{ whiteSpace: "normal" }}>
          {outcome || "Chưa xét"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-5">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/semesters")}
            className="mb-4"
          >
            Quay lại
          </Button>

          <h1 className="text-2xl font-bold mb-4">
            Báo cáo học kỳ - {semesterInfo?.semester_name || "..."}
          </h1>

          {semesterInfo && (
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 4 }}>
              <Descriptions.Item label="Tên học kỳ">
                {semesterInfo.semester_name}
              </Descriptions.Item>
              <Descriptions.Item label="Năm học">
                {semesterInfo.academic_year}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {semesterInfo.start_date
                  ? dayjs(semesterInfo.start_date).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {semesterInfo.end_date
                  ? dayjs(semesterInfo.end_date).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Số báo cáo" span={4}>
                <b>{reports.length}</b> sinh viên
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách báo cáo</h2>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshReports}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={reports}
          rowKey="report_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} báo cáo`,
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: "Chưa có dữ liệu báo cáo cho học kỳ này",
          }}
        />
      </Card>
    </div>
  );
};
