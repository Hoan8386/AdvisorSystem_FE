import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  Card,
  Tag,
  Popconfirm,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  ExportOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getSemestersApi,
  getMyUnitCoursesApi,
  getClassesApi,
  getStudentGradesDetailApi,
  createGradeApi,
  updateGradeApi,
  deleteGradeApi,
  downloadGradeTemplateApi,
  importGradesExcelApi,
  exportGradesExcelApi,
  exportClassGradesApi,
} from "../../../services/api.service";

export const AdminGrades = () => {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [classGradesData, setClassGradesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'detail'
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [uploadFileList, setUploadFileList] = useState([]);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchClasses(), fetchSemesters()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getMyUnitCoursesApi();
      if (response?.success && response?.data) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await getClassesApi();
      if (response?.success && response?.data) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await getSemestersApi();
      if (response?.success && response?.data) {
        setSemesters(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    setSelectedStudent(null);
    setStudentGrades([]);
    setClassGradesData(null);

    if (!classId) {
      return;
    }

    // Fetch class grades if semester is selected
    if (selectedSemester) {
      await fetchClassGrades(classId, selectedSemester);
    }
  };

  const handleSemesterChange = async (semesterId) => {
    setSelectedSemester(semesterId);

    if (selectedStudent) {
      try {
        setLoading(true);
        const response = await getStudentGradesDetailApi(
          selectedStudent,
          semesterId
        );
        if (response?.success && response?.data) {
          setStudentGrades(response.data.grades || []);
        }
      } catch (error) {
        console.error("Error fetching student grades:", error);
        toast.error("Không thể tải điểm sinh viên");
      } finally {
        setLoading(false);
      }
    } else if (selectedClass && semesterId) {
      // Fetch class grades when semester changes
      await fetchClassGrades(selectedClass, semesterId);
    }
  };

  const fetchClassGrades = async (classId, semesterId) => {
    try {
      setLoading(true);
      const response = await exportClassGradesApi(classId, semesterId);
      if (response?.success && response?.data) {
        setClassGradesData(response.data);
        setViewMode("list"); // Reset to list view when fetching new class data
        setSelectedStudentDetail(null);
      }
    } catch (error) {
      console.error("Error fetching class grades:", error);
      toast.error("Không thể tải điểm lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentGrades = (studentRecord) => {
    setSelectedStudentDetail(studentRecord);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedStudentDetail(null);
  };

  const handleCreate = () => {
    setEditingGrade(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      // If editing from student detail view (no grade_id), fetch the full grade data
      if (!record.grade_id && selectedStudentDetail && record.course_code) {
        const course = courses.find(
          (c) => c.course_code === record.course_code
        );
        if (!course) {
          toast.error("Không tìm thấy thông tin môn học");
          return;
        }

        // Fetch student's grades to find the grade_id
        const response = await getStudentGradesDetailApi(
          selectedStudentDetail.student_id,
          selectedSemester
        );

        console.log("API Response:", response);
        console.log("Response data:", response?.data);

        // Handle both response formats
        const responseData = response?.data?.data || response?.data;
        const grades = responseData?.grades;

        console.log("Grades array:", grades);

        if (grades && Array.isArray(grades)) {
          const gradeData = grades.find(
            (g) => g.course_code === record.course_code
          );
          console.log("Found grade data:", gradeData);

          if (gradeData && gradeData.grade_id) {
            // Found the grade_id, now set up the edit
            setEditingGrade({
              ...record,
              grade_id: gradeData.grade_id,
              course_id: course.course_id,
              student_id: selectedStudentDetail.student_id,
              semester_id: selectedSemester,
            });

            form.setFieldsValue({
              student_id: selectedStudentDetail.student_id,
              course_id: course.course_id,
              semester_id: selectedSemester,
              grade_value: parseFloat(record.grade_10) || record.grade_value,
            });
            setModalVisible(true);
          } else {
            toast.error("Không tìm thấy điểm của môn học này");
          }
        } else {
          toast.error("Không thể tải thông tin điểm");
        }
      } else {
        // Editing from class list view (has grade_id)
        setEditingGrade(record);

        // Find course_id from course_code if not available
        let courseId = record.course_id;
        if (!courseId && record.course_code) {
          const course = courses.find(
            (c) => c.course_code === record.course_code
          );
          courseId = course?.course_id;
        }

        form.setFieldsValue({
          student_id: record.student_id || selectedStudentDetail?.student_id,
          course_id: courseId,
          semester_id: record.semester_id || selectedSemester,
          grade_value: parseFloat(record.grade_10) || record.grade_value,
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error in handleEdit:", error);
      toast.error("Có lỗi khi tải thông tin điểm");
    }
  };

  const handleDelete = async (gradeId) => {
    try {
      setLoading(true);
      const response = await deleteGradeApi(gradeId);
      if (response?.success) {
        toast.success("Xóa điểm thành công");
        // Refresh class grades if available
        if (selectedClass && selectedSemester) {
          await fetchClassGrades(selectedClass, selectedSemester);
        }
      }
    } catch (error) {
      console.error("Error deleting grade:", error);
      const errorData = error?.response?.data || error;
      toast.error(errorData?.message || error?.message || "Không thể xóa điểm");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editingGrade) {
        // Update
        const response = await updateGradeApi(editingGrade.grade_id, {
          grade_value: values.grade_value,
        });
        if (response?.success) {
          toast.success("Cập nhật điểm thành công");
          setModalVisible(false);
          // Refresh class grades if available
          if (selectedClass && selectedSemester) {
            await fetchClassGrades(selectedClass, selectedSemester);
          }
        } else {
          const errorData = response;
          if (errorData?.errors) {
            Object.keys(errorData.errors).forEach((field) => {
              errorData.errors[field].forEach((msg) => {
                toast.error(msg);
              });
            });
          } else {
            toast.error(errorData?.message || "Cập nhật điểm thất bại");
          }
        }
      } else {
        // Create
        const response = await createGradeApi(values);
        if (response?.success) {
          toast.success("Nhập điểm thành công");
          setModalVisible(false);
          // Refresh class grades if available
          if (selectedClass && selectedSemester) {
            await fetchClassGrades(selectedClass, selectedSemester);
          }
        } else {
          const errorData = response;
          if (errorData?.errors) {
            Object.keys(errorData.errors).forEach((field) => {
              errorData.errors[field].forEach((msg) => {
                toast.error(msg);
              });
            });
          } else {
            toast.error(errorData?.message || "Nhập điểm thất bại");
          }
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorData = error?.response?.data || error;

      if (errorData?.errors) {
        Object.keys(errorData.errors).forEach((field) => {
          errorData.errors[field].forEach((msg) => {
            toast.error(msg);
          });
        });
      } else {
        toast.error(errorData?.message || error?.message || "Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBatchImport = () => {
    batchForm.resetFields();
    setUploadFileList([]);
    setBatchModalVisible(true);
  };

  const handleBatchSubmit = async () => {
    try {
      const values = await batchForm.validateFields();
      if (!values.file || uploadFileList.length === 0) {
        toast.warning("Vui lòng chọn file Excel");
        return;
      }

      // Get file from upload list
      const file = uploadFileList[0];
      await handleImportExcel(file);
    } catch (error) {
      console.error("Error batch import:", error);
    }
  };

  // Download Excel template
  const handleDownloadTemplate = async () => {
    try {
      setDownloadLoading(true);
      const response = await downloadGradeTemplateApi();

      // Lấy blob từ response
      let blob;

      // Check if response itself is Blob (từ axios interceptor)
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        // Nếu response.data là Blob
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        // Nếu là string, convert thành blob
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        // Mặc định convert object thành blob
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

      // Kiểm tra blob có dữ liệu
      if (!blob || blob.size === 0) {
        toast.error("File template trống hoặc không hợp lệ");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      link.download = `template_import_diem_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Tải template thành công");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error(error?.message || "Không thể tải template");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Import grades from Excel
  const handleImportExcel = async (file) => {
    try {
      setImportLoading(true);
      const response = await importGradesExcelApi(file);

      if (response?.success) {
        const { data } = response;
        const { summary, errors } = data;

        // Show success message with summary
        toast.success(
          `Import hoàn tất: ${summary.success_count} thành công, ${summary.updated_count} cập nhật, ${summary.error_count} lỗi`
        );

        // Show detailed errors if any
        if (errors && errors.length > 0) {
          Modal.warning({
            title: `Có ${errors.length} lỗi khi import`,
            content: (
              <div style={{ maxHeight: "400px", overflow: "auto" }}>
                {errors.map((err, index) => (
                  <div key={index} className="mb-2">
                    <strong>Dòng {err.row}:</strong> {err.error}
                    {err.user_code && ` (Mã SV: ${err.user_code})`}
                  </div>
                ))}
              </div>
            ),
            width: 600,
          });
        }

        // Refresh data if needed
        setBatchModalVisible(false);
        batchForm.resetFields();
        setUploadFileList([]);
        // Refresh class grades if available
        if (selectedClass && selectedSemester) {
          await fetchClassGrades(selectedClass, selectedSemester);
        }
      }
    } catch (error) {
      console.error("Error importing Excel:", error);
      const errorData = error?.response?.data || error;

      if (errorData?.errors) {
        Object.keys(errorData.errors).forEach((field) => {
          errorData.errors[field].forEach((msg) => {
            toast.error(msg);
          });
        });
      } else {
        toast.error(
          errorData?.message ||
            error?.message ||
            "Có lỗi xảy ra khi import file"
        );
      }
    } finally {
      setImportLoading(false);
    }
  };

  // Export grades to Excel
  const handleExportExcel = async () => {
    if (!selectedClass || !selectedSemester) {
      toast.warning("Vui lòng chọn lớp và học kỳ để xuất điểm");
      return;
    }

    try {
      setExportLoading(true);
      const response = await exportGradesExcelApi(
        selectedClass,
        selectedSemester
      );

      // Lấy blob từ response
      let blob;

      // Check if response itself is Blob (từ axios interceptor)
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        // Nếu response.data là Blob
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        // Nếu là string, convert thành blob
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        // Mặc định convert object thành blob
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

      // Kiểm tra blob có dữ liệu
      if (!blob || blob.size === 0) {
        toast.error("File xuất trống hoặc không hợp lệ");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const className =
        classes.find((c) => c.class_id === selectedClass)?.class_name ||
        "class";
      const semesterName =
        semesters.find((s) => s.semester_id === selectedSemester)
          ?.semester_name || "semester";
      link.download = `bangdiem_${className}_${semesterName}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất điểm thành công");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error(error?.message || "Không thể xuất điểm");
    } finally {
      setExportLoading(false);
    }
  };

  const classGradesColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã SV",
      dataIndex: "user_code",
      key: "user_code",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      width: 200,
    },
    {
      title: "Số môn học",
      key: "course_count",
      width: 120,
      align: "center",
      render: (_, record) => (
        <span className="font-semibold">{record.courses?.length || 0} môn</span>
      ),
    },
    {
      title: "Điểm TB",
      key: "average",
      width: 100,
      align: "center",
      render: (_, record) => {
        const grades =
          record.courses
            ?.map((c) => parseFloat(c.grade_10))
            .filter((g) => !isNaN(g)) || [];
        if (grades.length === 0) return "-";
        const avg = grades.reduce((sum, g) => sum + g, 0) / grades.length;
        return <strong className="text-blue-600">{avg.toFixed(2)}</strong>;
      },
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
          icon={<EyeOutlined />}
          onClick={() => handleViewStudentGrades(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const studentDetailColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã môn",
      dataIndex: "course_code",
      key: "course_code",
      width: 120,
    },
    {
      title: "Tên môn học",
      dataIndex: "course_name",
      key: "course_name",
      width: 250,
    },
    {
      title: "Số TC",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center",
    },
    {
      title: "Điểm 10",
      dataIndex: "grade_10",
      key: "grade_10",
      width: 100,
      align: "center",
      render: (grade) => (
        <span className="font-bold text-blue-600 text-lg">{grade || "-"}</span>
      ),
    },
    {
      title: "Điểm chữ",
      dataIndex: "grade_letter",
      key: "grade_letter",
      width: 100,
      align: "center",
      render: (grade) => (
        <Tag color="blue" className="text-base">
          {grade || "-"}
        </Tag>
      ),
    },
    {
      title: "Điểm 4",
      dataIndex: "grade_4",
      key: "grade_4",
      width: 100,
      align: "center",
      render: (grade) => <span className="font-semibold">{grade || "-"}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => (
        <Tag color={status === "passed" ? "green" : "red"} className="text-sm">
          {status === "passed" ? "Đạt" : "Không đạt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa điểm?"
            description="Bạn có chắc chắn muốn xóa điểm này?"
            onConfirm={() => handleDelete(record.grade_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const gradeColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã môn",
      dataIndex: "course_code",
      key: "course_code",
      width: 100,
    },
    {
      title: "Tên môn học",
      dataIndex: "course_name",
      key: "course_name",
    },
    {
      title: "Số tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 100,
      align: "center",
    },
    {
      title: "Học kỳ",
      dataIndex: "semester",
      key: "semester",
      width: 180,
    },
    {
      title: "Điểm số",
      dataIndex: "grade_10",
      key: "grade_10",
      width: 100,
      align: "center",
      render: (value) => (
        <span className="font-bold text-lg">{value?.toFixed(1) || "-"}</span>
      ),
    },
    {
      title: "Điểm chữ",
      dataIndex: "grade_letter",
      key: "grade_letter",
      width: 100,
      align: "center",
      render: (value) => (
        <Tag color="blue" className="font-bold">
          {value || "-"}
        </Tag>
      ),
    },
    {
      title: "Điểm hệ 4",
      dataIndex: "grade_4",
      key: "grade_4",
      width: 100,
      align: "center",
      render: (value) => (
        <span className="font-semibold">{value?.toFixed(2) || "-"}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => (
        <Tag color={status === "passed" ? "green" : "red"}>
          {status === "passed" ? "Đạt" : "Không đạt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa điểm?"
            description="Bạn có chắc chắn muốn xóa điểm này?"
            onConfirm={() => handleDelete(record.grade_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Điểm</h1>
            <p className="text-gray-500 mt-1">
              Nhập và quản lý điểm số của sinh viên
            </p>
          </div>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              loading={downloadLoading}
              disabled={exportLoading || importLoading}
            >
              Tải template
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExportExcel}
              loading={exportLoading}
              disabled={
                !selectedClass ||
                !selectedSemester ||
                downloadLoading ||
                importLoading
              }
            >
              Xuất điểm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {}}
              loading={loading}
              disabled={downloadLoading || exportLoading || importLoading}
            >
              Làm mới
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={handleBatchImport}
              disabled={downloadLoading || exportLoading || importLoading}
            >
              Nhập hàng loạt
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              disabled={
                loading || downloadLoading || exportLoading || importLoading
              }
            >
              Nhập điểm
            </Button>
          </Space>
        </div>

        <div className="mb-4 flex gap-4">
          <Select
            placeholder="Chọn lớp"
            style={{ width: 250 }}
            onChange={handleClassChange}
            value={selectedClass}
            allowClear
          >
            {classes.map((cls) => (
              <Select.Option key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Chọn học kỳ"
            style={{ width: 250 }}
            onChange={handleSemesterChange}
            value={selectedSemester}
            allowClear
          >
            {semesters.map((sem) => (
              <Select.Option key={sem.semester_id} value={sem.semester_id}>
                {sem.semester_name} - {sem.academic_year}
              </Select.Option>
            ))}
          </Select>
        </div>

        {!selectedStudent &&
          selectedClass &&
          selectedSemester &&
          classGradesData && (
            <Card
              title={
                viewMode === "list" ? (
                  `Bảng điểm lớp ${
                    classGradesData.class_info?.class_name || ""
                  }`
                ) : (
                  <Space>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={handleBackToList}
                      size="small"
                    >
                      Quay lại danh sách
                    </Button>
                    <span>
                      Chi tiết điểm - {selectedStudentDetail?.user_code} -{" "}
                      {selectedStudentDetail?.full_name}
                    </span>
                  </Space>
                )
              }
              extra={
                <Tag color="blue">
                  {classGradesData.semester_info?.semester_name} -{" "}
                  {classGradesData.semester_info?.academic_year}
                </Tag>
              }
            >
              {viewMode === "list" ? (
                <Table
                  columns={classGradesColumns}
                  dataSource={classGradesData.students_grades || []}
                  rowKey="student_id"
                  loading={loading}
                  scroll={{ x: 1000 }}
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} sinh viên`,
                  }}
                />
              ) : (
                <Table
                  columns={studentDetailColumns}
                  dataSource={selectedStudentDetail?.courses || []}
                  rowKey={(record, index) => `${record.course_code}_${index}`}
                  loading={loading}
                  scroll={{ x: 1000 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} môn học`,
                  }}
                  summary={(pageData) => {
                    if (pageData.length === 0) return null;
                    const passedCount = pageData.filter(
                      (g) => g.status === "passed"
                    ).length;
                    const totalCredits = pageData.reduce(
                      (sum, g) => sum + (g.credits || 0),
                      0
                    );
                    const grades = pageData
                      .map((g) => parseFloat(g.grade_10))
                      .filter((g) => !isNaN(g));
                    const avgGrade =
                      grades.length > 0
                        ? grades.reduce((sum, g) => sum + g, 0) / grades.length
                        : 0;

                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={3}>
                            <strong>Tổng kết</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} align="center">
                            <strong>{totalCredits} TC</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} align="center">
                            <strong className="text-blue-600 text-lg">
                              {avgGrade.toFixed(2)}
                            </strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={5} colSpan={3}>
                            <Space>
                              <Tag color="green" className="text-sm">
                                {passedCount} đạt
                              </Tag>
                              <Tag color="red" className="text-sm">
                                {pageData.length - passedCount} không đạt
                              </Tag>
                            </Space>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />
              )}
            </Card>
          )}

        {selectedStudent && (
          <Card
            title={`Bảng điểm - ${
              classGradesData?.students_grades?.find(
                (s) => s.student_id === selectedStudent
              )?.full_name || ""
            } (${
              classGradesData?.students_grades?.find(
                (s) => s.student_id === selectedStudent
              )?.user_code || ""
            })`}
            extra={
              selectedSemester ? (
                <Tag color="blue">
                  {
                    semesters.find((s) => s.semester_id === selectedSemester)
                      ?.semester_name
                  }{" "}
                  -
                  {
                    semesters.find((s) => s.semester_id === selectedSemester)
                      ?.academic_year
                  }
                </Tag>
              ) : (
                <Tag color="green">Tất cả học kỳ</Tag>
              )
            }
          >
            <Table
              columns={gradeColumns}
              dataSource={studentGrades}
              rowKey="grade_id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} môn học`,
              }}
              summary={(pageData) => {
                if (pageData.length === 0) return null;
                const passedCount = pageData.filter(
                  (g) => g.status === "passed"
                ).length;
                const totalCredits = pageData.reduce(
                  (sum, g) => sum + (g.credits || 0),
                  0
                );
                const avgGrade =
                  pageData.reduce((sum, g) => sum + (g.grade_10 || 0), 0) /
                  pageData.length;

                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Tổng kết</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="center">
                        <strong>{totalCredits}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="center">
                        <strong>{avgGrade.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} colSpan={3}>
                        <Tag color="green">{passedCount} đạt</Tag>
                        <Tag color="red">
                          {pageData.length - passedCount} không đạt
                        </Tag>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </Card>
        )}
      </Card>

      {/* Single Grade Modal */}
      <Modal
        title={editingGrade ? "Cập nhật điểm" : "Nhập điểm"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingGrade ? "Cập nhật" : "Nhập điểm"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="student_id"
            label="Sinh viên"
            rules={[{ required: true, message: "Vui lòng chọn sinh viên" }]}
          >
            <Select
              placeholder="Chọn sinh viên"
              showSearch
              optionFilterProp="children"
              disabled={!!editingGrade}
            >
              {(classGradesData?.students_grades || []).map((student) => (
                <Select.Option
                  key={student.student_id}
                  value={student.student_id}
                >
                  {student.user_code} - {student.full_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="course_id"
            label="Môn học"
            rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
          >
            <Select
              placeholder="Chọn môn học"
              showSearch
              optionFilterProp="children"
              disabled={!!editingGrade}
            >
              {courses.map((course) => (
                <Select.Option key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="semester_id"
            label="Học kỳ"
            rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
          >
            <Select placeholder="Chọn học kỳ" disabled={!!editingGrade}>
              {semesters.map((sem) => (
                <Select.Option key={sem.semester_id} value={sem.semester_id}>
                  {sem.semester_name} - {sem.academic_year}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="grade_value"
            label="Điểm số"
            rules={[
              { required: true, message: "Vui lòng nhập điểm" },
              {
                type: "number",
                min: 0,
                max: 10,
                message: "Điểm phải từ 0 đến 10",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={10}
              step={0.5}
              style={{ width: "100%" }}
              placeholder="Nhập điểm (0-10)"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Batch Import Modal */}
      <Modal
        title={
          <Space>
            <FileExcelOutlined />
            Nhập điểm từ Excel
          </Space>
        }
        open={batchModalVisible}
        onOk={handleBatchSubmit}
        onCancel={() => {
          setBatchModalVisible(false);
          setUploadFileList([]);
        }}
        okText="Nhập điểm"
        cancelText="Hủy"
        width={700}
        confirmLoading={loading}
      >
        <Form form={batchForm} layout="vertical" className="mt-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">
              📌 Hướng dẫn nhập điểm từ Excel:
            </p>
            <ol className="list-decimal ml-5 space-y-1 text-sm">
              <li>
                Tải file Excel mẫu bằng nút <strong>"Tải template"</strong>
              </li>
              <li>
                Điền thông tin vào 2 sheet: <strong>ThongTinChung</strong> và{" "}
                <strong>DanhSachDiem</strong>
              </li>
              <li>File chỉ chấp nhận định dạng .xlsx hoặc .xls (tối đa 5MB)</li>
              <li>
                Tải file lên và nhấn <strong>"Nhập điểm"</strong>
              </li>
            </ol>
          </div>

          <Form.Item
            name="file"
            label="Chọn file Excel"
            rules={[{ required: true, message: "Vui lòng chọn file Excel" }]}
          >
            <Upload
              accept=".xlsx,.xls"
              maxCount={1}
              fileList={uploadFileList}
              beforeUpload={(file) => {
                setUploadFileList([file]);
                batchForm.setFieldsValue({ file: file });
                return false; // Prevent auto upload
              }}
              onRemove={() => {
                setUploadFileList([]);
                batchForm.setFieldsValue({ file: null });
              }}
            >
              <Button icon={<UploadOutlined />} block>
                Chọn file Excel (.xlsx, .xls)
              </Button>
            </Upload>
          </Form.Item>

          <div className="text-xs text-gray-500 mt-2">
            <p>✓ Hệ thống sẽ tự động tạo mới hoặc cập nhật điểm có sẵn</p>
            <p>✓ Các lỗi (nếu có) sẽ được hiển thị chi tiết sau khi import</p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
