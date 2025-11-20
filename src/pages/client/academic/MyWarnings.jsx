import { useEffect, useState } from "react";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import { Card, Empty, Spin, Timeline, Tag, Alert, Collapse } from "antd";
import { toast } from "react-toastify";
import {
  WarningOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { getMyWarningsAPI } from "../../../services/api.service";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { Panel } = Collapse;

export const MyWarnings = () => {
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const res = await getMyWarningsAPI();
      if (res && res.success) {
        // API returns res.data as array of warnings
        const warningList = Array.isArray(res.data)
          ? res.data
          : res.data.warnings || [];
        setWarnings(warningList);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách cảnh cáo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getWarningLevel = (title) => {
    if (title.includes("mức 3")) return { color: "red", text: "Mức 3 - Nặng" };
    if (title.includes("mức 2"))
      return { color: "orange", text: "Mức 2 - Vừa" };
    if (title.includes("mức 1")) return { color: "gold", text: "Mức 1 - Nhẹ" };
    return { color: "default", text: "Cảnh cáo" };
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <WarningOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />
            <h1 className="text-2xl font-bold text-gray-900 m-0">
              Cảnh cáo học vụ
            </h1>
          </div>

          {warnings.length > 0 && (
            <Alert
              message="Thông báo quan trọng"
              description={`Bạn hiện có ${warnings.length} cảnh cáo học vụ. Vui lòng liên hệ với cố vấn học tập để được tư vấn và hỗ trợ.`}
              type="warning"
              showIcon
              style={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                marginBottom: "20px",
              }}
            />
          )}

          <Card
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginBottom: "20px",
            }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : warnings.length > 0 ? (
              <Timeline
                items={warnings.map((warning, index) => {
                  const level = getWarningLevel(warning.title);
                  return {
                    key: warning.warning_id,
                    color: level.color,
                    // dot: <WarningOutlined style={{ fontSize: 16 }} />,
                    children: (
                      <Card
                        size="small"
                        style={{
                          borderRadius: 8,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                          marginBottom: index < warnings.length - 1 ? 16 : 0,
                        }}
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 m-0">
                              {warning.title}
                            </h3>
                            <Tag color={level.color}>{level.text}</Tag>
                          </div>

                          {/* Thông tin */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <ClockCircleOutlined className="text-gray-500" />
                              <span className="text-gray-600">Thời gian:</span>
                              <span className="font-medium">
                                {warning.created_at}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOutlined className="text-gray-500" />
                              <span className="text-gray-600">Học kỳ:</span>
                              <span className="font-medium">
                                {warning.semester}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserOutlined className="text-gray-500" />
                              <span className="text-gray-600">Cố vấn:</span>
                              <span className="font-medium">
                                {warning.advisor_name}
                              </span>
                            </div>
                          </div>

                          {/* Nội dung cảnh cáo */}
                          <Collapse
                            ghost
                            defaultActiveKey={index === 0 ? ["1"] : []}
                          >
                            <Panel
                              header={
                                <span className="font-medium text-blue-600">
                                  Xem chi tiết nội dung cảnh cáo
                                </span>
                              }
                              key="1"
                            >
                              <div className="space-y-3">
                                <div>
                                  <div className="font-semibold text-gray-700 mb-2">
                                    📋 Nội dung:
                                  </div>
                                  <div
                                    className="text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded"
                                    style={{ lineHeight: 1.6 }}
                                  >
                                    {warning.content}
                                  </div>
                                </div>

                                {warning.advice && (
                                  <div>
                                    <div className="font-semibold text-gray-700 mb-2">
                                      💡 Lời khuyên:
                                    </div>
                                    <div
                                      className="text-gray-600 whitespace-pre-line bg-blue-50 p-3 rounded border-l-4 border-blue-400"
                                      style={{ lineHeight: 1.6 }}
                                    >
                                      {warning.advice}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Panel>
                          </Collapse>
                        </div>
                      </Card>
                    ),
                  };
                })}
              />
            ) : (
              <Empty
                description={
                  <div>
                    <div className="text-lg font-medium text-gray-600 mb-2">
                      Chúc mừng! 🎉
                    </div>
                    <div className="text-gray-500">
                      Bạn không có cảnh cáo học vụ nào. Hãy tiếp tục cố gắng!
                    </div>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Hướng dẫn */}
          <Card
            title={
              <span className="text-base font-semibold">
                📌 Lưu ý về cảnh cáo học vụ
              </span>
            }
            style={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginBottom: "20px",
            }}
          >
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Ngưỡng cảnh cáo theo năm học:</strong>
              </div>
              <ul className="ml-5 space-y-1">
                <li>Năm 1: CPA thang 4 {"<"} 1.20</li>
                <li>Năm 2: CPA thang 4 {"<"} 1.40</li>
                <li>Năm 3: CPA thang 4 {"<"} 1.60</li>
                <li>Năm 4+: CPA thang 4 {"<"} 1.80</li>
              </ul>
              <div className="mt-3">
                <strong>Mức độ cảnh cáo:</strong>
              </div>
              <ul className="ml-5 space-y-1">
                <li>
                  <Tag color="gold">Mức 1 - Nhẹ</Tag>: Khoảng cách với ngưỡng{" "}
                  {"<"} 0.3
                </li>
                <li>
                  <Tag color="orange">Mức 2 - Vừa</Tag>: Khoảng cách 0.3 - 0.5
                </li>
                <li>
                  <Tag color="red">Mức 3 - Nặng</Tag>: Khoảng cách {">="} 0.5
                </li>
              </ul>
              <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <strong className="text-blue-700">💬 Cần hỗ trợ?</strong>
                <p className="mt-1 mb-0">
                  Hãy liên hệ với cố vấn học tập của bạn để được tư vấn chi tiết
                  về kế hoạch học tập và cải thiện kết quả học tập.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default MyWarnings;
