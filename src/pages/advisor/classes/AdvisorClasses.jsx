import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Row,
  Col,
  Empty,
  Spin,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  IdcardOutlined,
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getClassesAPI,
  getWarningsCreatedAPI,
  createMonitoringNoteAPI,
  getSemestersAPI,
} from "../../../services/api.service";
import { toast } from "react-toastify";

export const AdvisorClasses = () => {
  const navigate = useNavigate();

  // --- State cho Danh sách lớp ---
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State chung ---
  const [activeTab, setActiveTab] = useState("classes");

  // --- State cho Danh sách cảnh cáo đã tạo ---
  const [warningsList, setWarningsList] = useState([]);
  const [loadingWarnings, setLoadingWarnings] = useState(false);

  // --- State cho Modal tạo ghi chú ---
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [noteForm] = Form.useForm();
  const [loadingNote, setLoadingNote] = useState(false);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (activeTab === "warnings") {
      fetchWarnings();
    }
  }, [activeTab]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getClassesAPI();

      if (response?.data?.success) {
        setClasses(response.data.data || []);
      } else if (response?.data) {
        setClasses(Array.isArray(response.data) ? response.data : []);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Lỗi khi tải danh sách lớp");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await getSemestersAPI();
      if (response?.success) {
        setSemesters(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchWarnings = async () => {
    try {
      setLoadingWarnings(true);
      const response = await getWarningsCreatedAPI();
      console.log("Warnings response:", response);

      if (response?.success) {
        const warnings = response.data?.warnings || [];
        console.log("Setting warnings:", warnings);
        setWarningsList(warnings);
      }
    } catch (error) {
      console.error("Error fetching warnings:", error);
      toast.error("Không thể tải danh sách cảnh cáo");
    } finally {
      setLoadingWarnings(false);
    }
  };

  // --- ĐÃ SỬA: Fill user_code vào form ---
  const handleAddNote = (warning) => {
    setSelectedWarning(warning);

    // Tìm semester_id tương ứng với cảnh cáo (nếu có logic matching tên)
    const semesterMatch = warning.semester.match(/(\d+)/);
    const semesterObj = semesters.find((s) =>
      s.semester_name.includes(semesterMatch?.[1] || "")
    );

    noteForm.setFieldsValue({
      user_code: warning.user_code, // <--- Cập nhật dòng này để fill MSSV
      semester_id: semesterObj?.semester_id,
      category: "academic",
      title: "",
      content: "",
    });
    setNoteModalVisible(true);
  };

  const handleSubmitNote = async (values) => {
    if (!selectedWarning) return;

    setLoadingNote(true);
    try {
      const noteData = {
        user_code: values.user_code, // Lấy từ form values (vì field đã disabled nhưng vẫn submit value)
        semester_id: values.semester_id,
        category: values.category,
        title: values.title,
        content: values.content,
      };

      await createMonitoringNoteAPI(noteData);
      toast.success("Tạo ghi chú thành công");
      setNoteModalVisible(false);
      noteForm.resetFields();
      setSelectedWarning(null);
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo ghi chú");
    } finally {
      setLoadingNote(false);
    }
  };

  const handleCloseNoteModal = () => {
    setNoteModalVisible(false);
    noteForm.resetFields();
    setSelectedWarning(null);
  };

  const handleClassClick = (classId) => {
    navigate(`/advisor/classes/${classId}`);
  };

  return (
    <AdvisorLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4 ">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-2">
              <TeamOutlined /> Quản lý lớp học
            </h1>
            <p className="text-gray-500 text-sm mt-1 mb-0">
              Danh sách các lớp bạn đang quản lý và lịch sử cảnh cáo
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Card
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "classes",
                label: (
                  <span className="flex items-center gap-2">
                    <TeamOutlined />
                    Danh sách lớp ({classes.length})
                  </span>
                ),
                children: (
                  <>
                    {/* Stats */}
                    <Card
                      size="small"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        color: "white",
                        marginBottom: "20px",
                      }}
                    >
                      <div className="flex items-center justify-between ">
                        <div>
                          <div className="text-3xl font-bold">
                            {classes.length}
                          </div>
                          <div className="text-sm opacity-90 mt-1">
                            Tổng số lớp quản lý
                          </div>
                        </div>
                        <TeamOutlined style={{ fontSize: 48, opacity: 0.3 }} />
                      </div>
                    </Card>

                    {/* Classes Grid */}
                    {loading ? (
                      <div className="flex justify-center items-center py-20">
                        <Spin size="large" tip="Đang tải danh sách lớp..." />
                      </div>
                    ) : classes.length === 0 ? (
                      <Card>
                        <Empty
                          description="Bạn chưa quản lý lớp nào"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      </Card>
                    ) : (
                      <Row gutter={[16, 16]}>
                        {classes.map((cls) => (
                          <Col xs={24} sm={12} lg={8} key={cls.class_id}>
                            <Card
                              hoverable
                              onClick={() => handleClassClick(cls.class_id)}
                              style={{
                                borderRadius: 12,
                                border: "1px solid #e5e7eb",
                                height: "100%",
                                transition: "all 0.3s ease",
                              }}
                              bodyStyle={{ padding: "20px" }}
                              className="hover:shadow-lg"
                            >
                              <div className="space-y-4">
                                {/* Class Header */}
                                <div className="flex items-start gap-3">
                                  <div
                                    style={{
                                      width: 48,
                                      height: 48,
                                      borderRadius: 12,
                                      background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontSize: 20,
                                      fontWeight: "bold",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {cls.class_name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3
                                      className="text-lg font-bold text-gray-900 m-0 truncate"
                                      title={cls.class_name}
                                    >
                                      {cls.class_name}
                                    </h3>
                                    {cls.description && (
                                      <p
                                        className="text-sm text-gray-500 m-0 mt-1"
                                        style={{
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                          overflow: "hidden",
                                        }}
                                        title={cls.description}
                                      >
                                        {cls.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Faculty Info */}
                                {cls.faculty && (
                                  <div
                                    style={{
                                      padding: "10px 12px",
                                      background: "#f0f9ff",
                                      borderRadius: 8,
                                      borderLeft: "3px solid #3b82f6",
                                    }}
                                  >
                                    <div className="flex items-center gap-2 text-sm">
                                      <BankOutlined
                                        style={{ color: "#3b82f6" }}
                                      />
                                      <span className="text-gray-700 font-medium">
                                        {cls.faculty.unit_name}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Advisor Info */}
                                {cls.advisor && (
                                  <div
                                    style={{
                                      padding: "10px 12px",
                                      background: "#fef3c7",
                                      borderRadius: 8,
                                      borderLeft: "3px solid #f59e0b",
                                    }}
                                  >
                                    <div className="flex items-center gap-2 text-sm">
                                      <IdcardOutlined
                                        style={{ color: "#f59e0b" }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-gray-700 font-medium truncate">
                                          {cls.advisor.full_name}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                          {cls.advisor.email}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    padding: "12px",
                                    background: "#f9fafb",
                                    borderRadius: 8,
                                  }}
                                >
                                  <UserOutlined
                                    style={{ color: "#667eea", fontSize: 18 }}
                                  />
                                  <span className="text-sm text-gray-600">
                                    Xem chi tiết lớp học
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </>
                ),
              },
              {
                key: "warnings",
                label: (
                  <span className="flex items-center gap-2">
                    <FileTextOutlined />
                    Danh sách cảnh cáo học vụ
                  </span>
                ),
                children: (
                  <Spin spinning={loadingWarnings}>
                    {warningsList.length > 0 ? (
                      <Table
                        columns={[
                          {
                            title: "STT",
                            key: "index",
                            width: 60,
                            align: "center",
                            render: (_, __, index) => index + 1,
                          },
                          {
                            title: "Tiêu đề",
                            dataIndex: "title",
                            key: "title",
                            width: 300,
                            render: (title) => (
                              <span className="font-medium">{title}</span>
                            ),
                          },
                          {
                            title: "MSSV",
                            dataIndex: "user_code",
                            key: "user_code",
                            width: 100,
                          },
                          {
                            title: "Họ tên",
                            dataIndex: "student_name",
                            key: "student_name",
                            width: 180,
                          },
                          {
                            title: "Lớp",
                            dataIndex: "class_name",
                            key: "class_name",
                            width: 100,
                          },
                          {
                            title: "Học kỳ",
                            dataIndex: "semester",
                            key: "semester",
                            width: 150,
                          },
                          {
                            title: "Ngày tạo",
                            dataIndex: "created_at",
                            key: "created_at",
                            width: 150,
                            align: "center",
                          },
                          {
                            title: "Thao tác",
                            key: "action",
                            width: 150,
                            align: "center",
                            render: (_, record) => (
                              <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => handleAddNote(record)}
                              >
                                Thêm ghi chú
                              </Button>
                            ),
                          },
                        ]}
                        dataSource={warningsList}
                        rowKey="warning_id"
                        pagination={{
                          pageSize: 10,
                          showTotal: (total) => `Tổng ${total} cảnh cáo`,
                        }}
                      />
                    ) : (
                      <Empty description="Chưa có cảnh cáo học vụ nào được tạo" />
                    )}
                  </Spin>
                ),
              },
            ]}
          />
        </Card>

        {/* Modal Tạo Ghi Chú */}
        <Modal
          title="Tạo ghi chú theo dõi sinh viên"
          open={noteModalVisible}
          onOk={() => noteForm.submit()}
          onCancel={handleCloseNoteModal}
          width={700}
          loading={loadingNote}
          okText="Tạo"
          cancelText="Hủy"
        >
          {selectedWarning && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">MSSV:</span>{" "}
                  {selectedWarning.user_code}
                </div>
                <div>
                  <span className="font-semibold">Họ tên:</span>{" "}
                  {selectedWarning.student_name}
                </div>
                <div>
                  <span className="font-semibold">Lớp:</span>{" "}
                  {selectedWarning.class_name}
                </div>
                <div>
                  <span className="font-semibold">Cảnh cáo:</span>{" "}
                  {selectedWarning.title}
                </div>
              </div>
            </div>
          )}

          <Form form={noteForm} layout="vertical" onFinish={handleSubmitNote}>
            {/* Field user_code đã được fill và disabled */}
            <Form.Item
              label="Mã số sinh viên (user_code)"
              name="user_code"
              rules={[{ required: true, message: "Mã số sinh viên" }]}
            >
              <Input placeholder="Mã số sinh viên" disabled />
            </Form.Item>

            <Form.Item
              label="Học kỳ"
              name="semester_id"
              rules={[{ required: true, message: "Chọn học kỳ" }]}
            >
              <Select placeholder="Chọn học kỳ">
                {semesters.map((sem) => (
                  <Select.Option key={sem.semester_id} value={sem.semester_id}>
                    {sem.semester_name} - {sem.academic_year}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Danh mục"
              name="category"
              rules={[{ required: true, message: "Chọn danh mục" }]}
            >
              <Select placeholder="Chọn danh mục">
                <Select.Option value="academic">Học tập</Select.Option>
                <Select.Option value="personal">Cá nhân</Select.Option>
                <Select.Option value="attendance">Chuyên cần</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[
                { required: true, message: "Nhập tiêu đề" },
                { min: 5, message: "Tối thiểu 5 ký tự" },
                { max: 255, message: "Tối đa 255 ký tự" },
              ]}
            >
              <Input placeholder="Nhập tiêu đề ghi chú" />
            </Form.Item>

            <Form.Item
              label="Nội dung"
              name="content"
              rules={[
                { required: true, message: "Nhập nội dung" },
                { min: 10, message: "Tối thiểu 10 ký tự" },
                { max: 5000, message: "Tối đa 5000 ký tự" },
              ]}
            >
              <Input.TextArea rows={6} placeholder="Nhập nội dung ghi chú" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorClasses;
