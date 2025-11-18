import { useEffect, useState } from "react";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  Card,
  Row,
  Col,
  Empty,
  Spin,
  Tag,
  Descriptions,
  Tabs,
  Table,
  Select,
  Button,
  Space,
  Modal,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  IdcardOutlined,
  AlertOutlined,
  FileTextOutlined,
  WarningOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getClassesAPI,
  getSemestersAPI,
  getAtRiskStudentsAPI,
  createAcademicWarningsAPI,
  getWarningsCreatedAPI,
} from "../../../services/api.service";
import { toast } from "react-toastify";

const { Option } = Select;

export const AdvisorClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("classes");

  // At-risk students state
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loadingAtRisk, setLoadingAtRisk] = useState(false);
  const [selectedWarningStudents, setSelectedWarningStudents] = useState([]);
  const [loadingCreateWarnings, setLoadingCreateWarnings] = useState(false);
  const [warningsList, setWarningsList] = useState([]);
  const [loadingWarnings, setLoadingWarnings] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (activeTab === "at-risk" && selectedSemester) {
      fetchAtRiskStudents();
    }
    if (activeTab === "warnings") {
      fetchWarnings();
    }
  }, [selectedSemester, activeTab]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getClassesAPI();

      // Response structure: response.data = { success: true, data: [...], message: "..." }
      if (response?.data?.success) {
        setClasses(response.data.data || []);
      } else if (response?.data) {
        // Fallback: nếu data trả về trực tiếp là array
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
      setLoadingSemesters(true);
      console.log("Fetching semesters...");
      const response = await getSemestersAPI();
      console.log("Semesters response:", response);

      if (response?.success) {
        const semesterData = response.data || [];
        console.log("Semester data:", semesterData);
        setSemesters(semesterData);
        if (semesterData.length > 0) {
          console.log("Setting default semester:", semesterData[0].semester_id);
          setSelectedSemester(semesterData[0].semester_id);
        }
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      toast.error("Không thể tải danh sách học kỳ");
    } finally {
      setLoadingSemesters(false);
    }
  };

  const fetchAtRiskStudents = async () => {
    if (!selectedSemester) return;

    try {
      setLoadingAtRisk(true);
      console.log("Fetching at-risk students for semester:", selectedSemester);
      const response = await getAtRiskStudentsAPI(selectedSemester);
      console.log("At-risk students response:", response);

      if (response?.success) {
        const students = response.data?.at_risk_students || [];
        console.log("Setting at-risk students:", students);
        setAtRiskStudents(students);

        // Auto-select students with academic warnings
        const studentsWithWarnings = students
          .filter((student) => student.has_academic_warning === true)
          .map((student) => student.student_id);
        setSelectedWarningStudents(studentsWithWarnings);
        console.log(
          "Auto-selected students with warnings:",
          studentsWithWarnings
        );
      } else {
        console.log("API response not successful:", response);
      }
    } catch (error) {
      console.error("Error fetching at-risk students:", error);
      toast.error("Không thể tải danh sách sinh viên có nguy cơ");
    } finally {
      setLoadingAtRisk(false);
    }
  };

  const handleCreateWarnings = async () => {
    if (selectedWarningStudents.length === 0) {
      toast.warning("Vui lòng chọn sinh viên để tạo cảnh cáo");
      return;
    }

    try {
      setLoadingCreateWarnings(true);
      const response = await createAcademicWarningsAPI({
        semester_id: selectedSemester,
        student_ids: selectedWarningStudents,
      });

      if (response?.data?.success) {
        const totalCreated = response.data.data?.total_created || 0;
        const errors = response.data.data?.errors || [];

        console.log("Response data:", { totalCreated, errors });

        if (totalCreated > 0) {
          toast.success(`Đã tạo ${totalCreated} cảnh cáo học vụ`);
        }

        if (errors.length > 0) {
          // Show each error as separate toast
          errors.forEach((error) => {
            toast.error(error, { autoClose: 4000 });
          });
        }

        setSelectedWarningStudents([]);
        fetchAtRiskStudents();
      }
    } catch (error) {
      console.error("Error creating warnings:", error);
      toast.error("Không thể tạo cảnh cáo học vụ");
    } finally {
      setLoadingCreateWarnings(false);
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
              Danh sách các lớp bạn đang quản lý và sinh viên có nguy cơ
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

                                {/* Student Count - Hidden for now, will be shown in detail page */}
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
                key: "at-risk",
                label: (
                  <span className="flex items-center gap-2">
                    <AlertOutlined />
                    Sinh viên có nguy cơ ({atRiskStudents.length})
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    {/* Semester Selector */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Học kỳ:
                        </span>
                        <Select
                          value={selectedSemester}
                          onChange={setSelectedSemester}
                          style={{ width: 220 }}
                          placeholder="Chọn học kỳ"
                          loading={loadingSemesters}
                          disabled={loadingSemesters || semesters.length === 0}
                        >
                          {semesters.map((sem) => (
                            <Option
                              key={sem.semester_id}
                              value={sem.semester_id}
                            >
                              {sem.semester_name} - {sem.academic_year}
                            </Option>
                          ))}
                        </Select>
                        {semesters.length === 0 && !loadingSemesters && (
                          <span className="text-sm text-red-500">
                            Không có học kỳ nào
                          </span>
                        )}
                      </div>
                      <Button
                        type="primary"
                        danger
                        icon={<WarningOutlined />}
                        disabled={selectedWarningStudents.length === 0}
                        onClick={handleCreateWarnings}
                        loading={loadingCreateWarnings}
                      >
                        Tạo cảnh cáo ({selectedWarningStudents.length})
                      </Button>
                    </div>

                    {/* At-Risk Students Table */}
                    <Spin spinning={loadingAtRisk}>
                      <Table
                        rowSelection={{
                          selectedRowKeys: selectedWarningStudents,
                          onChange: (selectedKeys) => {
                            setSelectedWarningStudents(selectedKeys);
                          },
                        }}
                        columns={[
                          {
                            title: "MSSV",
                            dataIndex: "user_code",
                            key: "user_code",
                            width: 100,
                          },
                          {
                            title: "Họ tên",
                            dataIndex: "full_name",
                            key: "full_name",
                            width: 180,
                          },
                          {
                            title: "Lớp",
                            dataIndex: "class_name",
                            key: "class_name",
                            width: 120,
                          },
                          {
                            title: "CPA (4.0)",
                            dataIndex: "cpa_4_scale",
                            key: "cpa_4_scale",
                            width: 100,
                            align: "center",
                            render: (cpa) => {
                              const numCpa = cpa ? Number(cpa) : 0;
                              const color =
                                numCpa >= 3.6
                                  ? "green"
                                  : numCpa >= 3.0
                                  ? "blue"
                                  : numCpa >= 2.0
                                  ? "orange"
                                  : "red";
                              return (
                                <Tag color={color}>{numCpa.toFixed(2)}</Tag>
                              );
                            },
                          },
                          {
                            title: "Ngưỡng",
                            dataIndex: "warning_threshold",
                            key: "warning_threshold",
                            width: 90,
                            align: "center",
                            render: (threshold) => {
                              const numThreshold = threshold
                                ? Number(threshold)
                                : 0;
                              return numThreshold.toFixed(2);
                            },
                          },
                          {
                            title: "Mức độ",
                            dataIndex: "risk_level",
                            key: "risk_level",
                            width: 110,
                            render: (level) => {
                              const config = {
                                critical: { color: "red", text: "Rất cao" },
                                high: { color: "orange", text: "Cao" },
                                medium: { color: "gold", text: "Trung bình" },
                                low: { color: "blue", text: "Thấp" },
                              };
                              const c = config[level] || {
                                color: "default",
                                text: level,
                              };
                              return <Tag color={c.color}>{c.text}</Tag>;
                            },
                          },
                          {
                            title: "Môn rớt",
                            dataIndex: "failed_courses_count",
                            key: "failed_courses_count",
                            width: 90,
                            align: "center",
                            render: (count) => (
                              <Tag color={count > 0 ? "red" : "default"}>
                                {count}
                              </Tag>
                            ),
                          },
                          {
                            title: "Lý do nguy cơ",
                            dataIndex: "risk_reasons",
                            key: "risk_reasons",
                            render: (reasons) => (
                              <ul className="list-disc list-inside text-xs">
                                {reasons?.slice(0, 2).map((reason, idx) => (
                                  <li key={idx} className="text-red-600">
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            ),
                          },
                        ]}
                        dataSource={atRiskStudents}
                        rowKey="student_id"
                        pagination={{
                          pageSize: 10,
                          showTotal: (total) => `Tổng ${total} sinh viên`,
                        }}
                        locale={{
                          emptyText: selectedSemester ? (
                            <Empty description="Không có sinh viên nguy cơ trong học kỳ này" />
                          ) : (
                            <Empty description="Vui lòng chọn học kỳ" />
                          ),
                        }}
                      />
                    </Spin>
                  </div>
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
                          // {
                          //   title: "Thao tác",
                          //   key: "action",
                          //   width: 120,
                          //   align: "center",
                          //   render: (_, record) => (
                          //     // <Button
                          //     //   type="link"
                          //     //   size="small"
                          //     //   icon={<EyeOutlined />}
                          //     //   onClick={() => {
                          //     //     Modal.info({
                          //     //       title: record.title,
                          //     //       width: 800,
                          //     //       content: (
                          //     //         <div className="space-y-4 mt-4">
                          //     //           <div>
                          //     //             <div className="font-semibold mb-2">
                          //     //               Thông tin sinh viên:
                          //     //             </div>
                          //     //             <div className="pl-4">
                          //     //               <p>MSSV: {record.user_code}</p>
                          //     //               <p>Họ tên: {record.student_name}</p>
                          //     //               <p>Lớp: {record.class_name}</p>
                          //     //             </div>
                          //     //           </div>
                          //     //           <div>
                          //     //             <div className="font-semibold mb-2">
                          //     //               Nội dung cảnh cáo:
                          //     //             </div>
                          //     //             <div className="pl-4 whitespace-pre-wrap">
                          //     //               {record.content ||
                          //     //                 "Không có nội dung"}
                          //     //             </div>
                          //     //           </div>
                          //     //           <div>
                          //     //             <div className="font-semibold mb-2">
                          //     //               Lời khuyên:
                          //     //             </div>
                          //     //             <div className="pl-4 whitespace-pre-wrap">
                          //     //               {record.advice ||
                          //     //                 "Không có lời khuyên"}
                          //     //             </div>
                          //     //           </div>
                          //     //         </div>
                          //     //       ),
                          //     //     });
                          //     //   }}
                          //     // >
                          //     //   Chi tiết
                          //     // </Button>
                          //   ),
                          // },
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
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorClasses;
