import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Card,
  Button,
  Space,
  Select,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Empty,
} from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import {
  getClassesApi,
  getSemestersApi,
  exportTrainingPointsByClassApi,
  exportTrainingPointsByFacultyApi,
  exportSocialPointsByClassApi,
  exportSocialPointsByFacultyApi,
  exportInsufficientSocialPointsByClassApi,
  exportInsufficientSocialPointsByFacultyApi,
} from "../../../services/api.service";

export const AdminActivityPoints = () => {
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [trainingFacultyLoading, setTrainingFacultyLoading] = useState(false);
  const [socialFacultyLoading, setSocialFacultyLoading] = useState(false);
  const [insufficientClassLoading, setInsufficientClassLoading] =
    useState(false);
  const [insufficientFacultyLoading, setInsufficientFacultyLoading] =
    useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classesRes, semestersRes] = await Promise.all([
        getClassesApi(),
        getSemestersApi(),
      ]);

      if (classesRes?.data) {
        setClasses(classesRes.data);
      }
      if (semestersRes?.data) {
        setSemesters(semestersRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleExportTrainingPoints = async () => {
    if (!selectedClass || !selectedSemester) {
      toast.warning("Vui lòng chọn lớp và học kỳ");
      return;
    }

    try {
      setTrainingLoading(true);
      const response = await exportTrainingPointsByClassApi(
        selectedClass,
        selectedSemester
      );

      // Lấy blob từ response
      let blob;

      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

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
      link.download = `DiemRenLuyen_${className}_${semesterName}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất điểm rèn luyện thành công");
    } catch (error) {
      console.error("Error exporting training points:", error);
      toast.error(error?.message || "Không thể xuất điểm rèn luyện");
    } finally {
      setTrainingLoading(false);
    }
  };

  const handleExportSocialPoints = async () => {
    if (!selectedClass) {
      toast.warning("Vui lòng chọn lớp");
      return;
    }

    try {
      setSocialLoading(true);
      const response = await exportSocialPointsByClassApi(selectedClass);

      // Lấy blob từ response
      let blob;

      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

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
      link.download = `DiemCTXH_TichLuy_${className}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất điểm CTXH thành công");
    } catch (error) {
      console.error("Error exporting social points:", error);
      toast.error(error?.message || "Không thể xuất điểm CTXH");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleExportTrainingPointsByFaculty = async () => {
    if (!selectedSemester) {
      toast.warning("Vui lòng chọn học kỳ");
      return;
    }

    try {
      setTrainingFacultyLoading(true);
      const response = await exportTrainingPointsByFacultyApi(selectedSemester);

      let blob;
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

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
      const semesterName =
        semesters.find((s) => s.semester_id === selectedSemester)
          ?.semester_name || "semester";
      link.download = `DiemRenLuyen_TheoKhoa_${semesterName}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất điểm rèn luyện theo khoa thành công");
    } catch (error) {
      console.error("Error exporting training points by faculty:", error);
      toast.error(error?.message || "Không thể xuất điểm rèn luyện theo khoa");
    } finally {
      setTrainingFacultyLoading(false);
    }
  };

  const handleExportSocialPointsByFaculty = async () => {
    try {
      setSocialFacultyLoading(true);
      const response = await exportSocialPointsByFacultyApi();

      let blob;
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

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
      link.download = `DiemCTXH_TichLuy_TheoKhoa_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất điểm CTXH theo khoa thành công");
    } catch (error) {
      console.error("Error exporting social points by faculty:", error);
      toast.error(error?.message || "Không thể xuất điểm CTXH theo khoa");
    } finally {
      setSocialFacultyLoading(false);
    }
  };

  const handleExportInsufficientSocialPointsByClass = async () => {
    if (!selectedClass) {
      toast.warning("Vui lòng chọn lớp");
      return;
    }

    try {
      setInsufficientClassLoading(true);
      const response = await exportInsufficientSocialPointsByClassApi(
        selectedClass
      );

      let blob;
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

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
      link.download = `SinhVienThieuDiemCTXH_${className}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất danh sách sinh viên thiếu điểm CTXH thành công");
    } catch (error) {
      console.error(
        "Error exporting insufficient social points by class:",
        error
      );
      toast.error(
        error?.message || "Không thể xuất danh sách sinh viên thiếu điểm CTXH"
      );
    } finally {
      setInsufficientClassLoading(false);
    }
  };

  const handleExportInsufficientSocialPointsByFaculty = async () => {
    try {
      setInsufficientFacultyLoading(true);
      const response = await exportInsufficientSocialPointsByFacultyApi();

      let blob;
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else if (typeof response.data === "string") {
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        blob = new Blob([response.data || response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

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
      link.download = `SinhVienThieuDiemCTXH_TheoKhoa_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        "Xuất danh sách sinh viên thiếu điểm CTXH theo khoa thành công"
      );
    } catch (error) {
      console.error(
        "Error exporting insufficient social points by faculty:",
        error
      );
      toast.error(
        error?.message ||
          "Không thể xuất danh sách sinh viên thiếu điểm CTXH theo khoa"
      );
    } finally {
      setInsufficientFacultyLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Quản lý Hoạt động & CTXH
            </h1>
            <p className="text-gray-500">
              Xuất điểm rèn luyện và công tác xã hội theo lớp học
            </p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            size="large"
            onClick={fetchInitialData}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Selection Filters */}
        <Card className="mb-6" style={{ background: "#f5f7fa" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Chọn lớp học <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Chọn lớp"
                value={selectedClass}
                onChange={setSelectedClass}
                style={{ width: "100%" }}
                size="large"
                loading={loading}
              >
                {classes.map((cls) => (
                  <Select.Option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Chọn học kỳ{" "}
                <span className="text-gray-500">
                  (bắt buộc cho điểm rèn luyện)
                </span>
              </label>
              <Select
                placeholder="Chọn học kỳ"
                value={selectedSemester}
                onChange={setSelectedSemester}
                style={{ width: "100%" }}
                size="large"
                loading={loading}
              >
                {semesters.map((sem) => (
                  <Select.Option key={sem.semester_id} value={sem.semester_id}>
                    {sem.semester_name} - {sem.academic_year}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {/* Điểm Rèn Luyện */}
            <div className="flex gap-3 flex-wrap">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                onClick={handleExportTrainingPoints}
                loading={trainingLoading}
                disabled={!selectedClass || !selectedSemester}
              >
                Xuất Điểm Rèn Luyện (Lớp)
              </Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                onClick={handleExportTrainingPointsByFaculty}
                loading={trainingFacultyLoading}
                disabled={!selectedSemester}
              >
                Xuất Điểm Rèn Luyện (Khoa)
              </Button>
            </div>

            {/* Điểm CTXH Tích Lũy */}
            <div className="flex gap-3 flex-wrap">
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                size="large"
                onClick={handleExportSocialPoints}
                loading={socialLoading}
                disabled={!selectedClass}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                Xuất Điểm CTXH (Lớp)
              </Button>

              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                size="large"
                onClick={handleExportSocialPointsByFaculty}
                loading={socialFacultyLoading}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                Xuất Điểm CTXH (Khoa)
              </Button>
            </div>

            {/* Danh Sách Thiếu CTXH */}
            <div className="flex gap-3 flex-wrap">
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                size="large"
                onClick={handleExportInsufficientSocialPointsByClass}
                loading={insufficientClassLoading}
                disabled={!selectedClass}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                DS Thiếu CTXH (Lớp)
              </Button>

              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                size="large"
                onClick={handleExportInsufficientSocialPointsByFaculty}
                loading={insufficientFacultyLoading}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                DS Thiếu CTXH (Khoa)
              </Button>
            </div>
          </div>
        </Card>

        {/* Information Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Điểm Rèn Luyện"
                value="Theo Học Kỳ"
                suffix={<span className="text-sm">70 điểm ban đầu</span>}
                valueStyle={{ color: "#1890ff" }}
              />
              <div className="text-xs text-gray-600 mt-2">
                <p>
                  Cách tính: lấy <strong>70 điểm khởi đầu</strong> cộng với tổng
                  điểm của tất cả các hoạt động mà sinh viên đã tham gia, rồi
                  trừ đi điểm của những hoạt động vắng mặt.
                </p>
                <p className="mt-1">
                  Xếp loại: Xuất sắc (từ 90 điểm trở lên) → Tốt → Khá → Trung
                  bình → Yếu → Kém (dưới 35 điểm).
                </p>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Điểm CTXH"
                value="Tích Lũy"
                suffix={<span className="text-sm">từ đầu khóa</span>}
                valueStyle={{ color: "#52c41a" }}
              />
              <div className="text-xs text-gray-600 mt-2">
                <p>
                  Cách tính: cộng lại toàn bộ điểm của tất cả hoạt động công tác
                  xã hội mà sinh viên đã tham gia từ khi bắt đầu khóa học.
                </p>
                <p className="mt-1">
                  Xếp loại: Đạt (từ 170 điểm trở lên) / Không đạt (dưới 170
                  điểm).
                </p>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Help Section */}
        <Card style={{ background: "#f0f5ff", borderColor: "#1890ff" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">📋</span> Hướng dẫn sử dụng
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              ✓ <strong>Điểm Rèn Luyện (Lớp):</strong> Chọn lớp + học kỳ → Xuất
              danh sách theo lớp
            </li>
            <li>
              ✓ <strong>Điểm Rèn Luyện (Khoa):</strong> Chọn học kỳ → Xuất danh
              sách toàn khoa
            </li>
            <li>
              ✓ <strong>Điểm CTXH (Lớp):</strong> Chọn lớp (không cần học kỳ) →
              Xuất danh sách tích lũy theo lớp
            </li>
            <li>
              ✓ <strong>Điểm CTXH (Khoa):</strong> Không cần chọn gì → Xuất danh
              sách tích lũy toàn khoa
            </li>
            <li>
              ✓ <strong>DS Thiếu CTXH (Lớp):</strong> Chọn lớp → Xuất chỉ sinh
              viên có điểm CTXH &lt; 170
            </li>
            <li>
              ✓ <strong>DS Thiếu CTXH (Khoa):</strong> Xuất toàn bộ sinh viên
              thiếu CTXH trong khoa
            </li>
            <li>
              ✓ File Excel sẽ tự động download và có thể mở trực tiếp trên máy
              tính
            </li>
            <li>✓ Mỗi lần xuất file sẽ lấy dữ liệu mới nhất từ hệ thống</li>
          </ul>
        </Card>
      </Card>
    </div>
  );
};
