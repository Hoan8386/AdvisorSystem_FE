import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import { StudentLayout } from "../components/layout/StudentLayout";
import {
  getNotificationsAPI,
  getNotificationDetailAPI,
  submitNotificationResponseAPI,
  getUnreadNotificationsAPI,
  markAllNotificationsReadAPI,
} from "../services/api.service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Card,
  Tag,
  Empty,
  Spin,
  message,
  Button,
  Avatar,
  Space,
  Modal,
  Divider,
  List,
  Alert,
  Input,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const StudentPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [responseContent, setResponseContent] = useState("");
  const [submitingResponse, setSubmitingResponse] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterUnread, setFilterUnread] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/login");
      return;
    }
    fetchNotifications();
    fetchUnreadCount();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsAPI();
      if (res && res.success) {
        const notif = res.data || [];
        setNotifications(notif);
        // Tính số thông báo chưa đọc từ danh sách
        const unread = notif.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách thông báo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationsAPI();
      if (res && res.success) {
        setUnreadCount(res.data?.count || res.data?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const res = await markAllNotificationsReadAPI();
      if (res?.success) {
        message.success(
          res?.message || "Đã đánh dấu tất cả thông báo là đã đọc"
        );
        fetchNotifications();
        setUnreadCount(0);
      } else {
        message.error(res?.message || "Không thể đánh dấu thông báo");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      message.error(error?.message || "Lỗi khi đánh dấu thông báo");
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type) => {
    const typeMap = {
      general: {
        icon: "📋",
        text: "Thông báo chung",
        color: "#1890ff",
        bg: "#e6f7ff",
      },
      academic: {
        icon: "📚",
        text: "Học tập",
        color: "#ff4d4f",
        bg: "#fff1f0",
      },
      event: { icon: "🎉", text: "Sự kiện", color: "#52c41a", bg: "#f6ffed" },
      urgent: { icon: "⚠️", text: "Khẩn", color: "#ff7a45", bg: "#fff7e6" },
    };
    return (
      typeMap[type] || { icon: "📌", text: type, color: "#999", bg: "#fafafa" }
    );
  };

  const handleViewDetail = async (record) => {
    try {
      setDetailLoading(true);
      setDetailModalOpen(true);

      // Fetch detailed notification from API
      const res = await getNotificationDetailAPI(record.notification_id);

      if (res && res.success) {
        // API returns { success: true, data: { notification } } or { success: true, data: notification }
        const detailData = res.data?.notification || res.data;
        setSelectedNotification(detailData);
      } else if (res && res.data) {
        setSelectedNotification(res.data);
      } else {
        // Fallback to record data if API fails
        setSelectedNotification(record);
        message.warning(
          "Không thể tải chi tiết đầy đủ, hiển thị dữ liệu từ danh sách"
        );
      }
    } catch (error) {
      console.error("Error fetching notification detail:", error);
      // Fallback to record data
      setSelectedNotification(record);
      message.error("Lỗi khi tải chi tiết thông báo");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedNotification(null);
    setResponseContent("");
    // Refresh danh sách thông báo khi đóng modal
    fetchNotifications();
    fetchUnreadCount();
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const baseUrl =
        import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;
      const fileUrl = `${baseUrl}storage/${attachment.file_path}`;

      // Tạo link tạm để download trực tiếp (tránh CORS)
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = attachment.file_name;
      link.target = "_blank"; // Mở trong tab mới nếu download thất bại
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Đang tải file...");
    } catch (error) {
      console.error("Download error:", error);
      message.error("Lỗi khi tải file");
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseContent.trim()) {
      message.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    if (responseContent.trim().length < 10) {
      message.warning("Nội dung phản hồi phải có ít nhất 10 ký tự");
      return;
    }

    if (!selectedNotification?.notification_id) {
      message.error("Lỗi: Không tìm thấy ID thông báo");
      return;
    }

    try {
      setSubmitingResponse(true);
      const res = await submitNotificationResponseAPI(
        selectedNotification.notification_id,
        { content: responseContent }
      );

      // Check if response has success flag = false
      if (res?.success === false) {
        message.warning(res?.message);
        return;
      }

      // Success case
      if (res?.success) {
        toast.success("✓ Phản hồi thành công!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Success case
        if (res?.success === false) {
          toast.error("✓ Phản hồi thất bại", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }

        setResponseContent("");

        // Refresh notification detail to show new response
        setTimeout(() => {
          handleViewDetail({
            notification_id: selectedNotification.notification_id,
          });
        }, 500);
      }
    } catch (error) {
      console.error("Submit response error:", error);
      // Show error message from API
      toast.error(error?.message || "Lỗi khi gửi phản hồi");
    } finally {
      setSubmitingResponse(false);
    }
  };

  // Statistics calculation
  const totalNotifications = notifications.length;
  const readCount = notifications.filter((n) => n.is_read).length;
  const todayNotifications = notifications.filter((n) =>
    dayjs(n.created_at).isAfter(dayjs().startOf("day"))
  ).length;

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Banner with Gradient */}
        <div
          className="rounded-2xl shadow-xl p-8 mb-5 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(to right, #1da1f2, #1a8cd8)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">
                Xin chào, {user?.full_name || "Sinh viên"}! 🎓
              </h1>
              <p className="text-white/90 text-lg">
                Chúc bạn một ngày học tập vui vẻ và hiệu quả!
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm">
              <span className="text-6xl">📚</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1 uppercase tracking-wide">
                  Tổng thông báo
                </p>
                <p className="text-4xl font-bold text-blue-700">
                  {totalNotifications}
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📬</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#1da1f2] text-sm font-semibold mb-1 uppercase tracking-wide">
                  Chưa đọc
                </p>
                <p className="text-4xl font-bold text-[#1a91da]">
                  {unreadCount}
                </p>
              </div>
              <div className="w-16 h-16 bg-[#1da1f2] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🔔</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold mb-1 uppercase tracking-wide">
                  Đã đọc
                </p>
                <p className="text-4xl font-bold text-green-700">{readCount}</p>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold mb-1 uppercase tracking-wide">
                  Hôm nay
                </p>
                <p className="text-4xl font-bold text-purple-700">
                  {todayNotifications}
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-5">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Title and Counter */}
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                Danh sách thông báo
                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                  {notifications.length}
                </span>
              </h3>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterUnread(!filterUnread)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    filterUnread
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {filterUnread ? "Tất cả" : "Chưa đọc"}
                </button>

                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0 || loading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium transition-all duration-300 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                >
                  ✓ Đánh dấu
                </button>

                <button
                  onClick={fetchNotifications}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium transition-all duration-300 hover:bg-blue-700"
                >
                  🔄 Mới
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Spin spinning={loading}>
              {(() => {
                const displayedNotifications = filterUnread
                  ? notifications.filter((n) => !n.is_read)
                  : notifications;

                // Pagination logic
                const totalPages = Math.ceil(
                  displayedNotifications.length / itemsPerPage
                );
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedNotifications = displayedNotifications.slice(
                  startIndex,
                  endIndex
                );

                return displayedNotifications.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {paginatedNotifications.map((notif) => {
                        const typeInfo = getTypeInfo(notif.type);
                        return (
                          <div
                            key={notif.notification_id}
                            onClick={() => handleViewDetail(notif)}
                            className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${
                              !notif.is_read ? "ring-4 ring-blue-200" : ""
                            }`}
                            style={{
                              borderColor: !notif.is_read
                                ? "#1da1f2"
                                : "#e5e7eb",
                              backgroundColor: !notif.is_read
                                ? "#e8f5fe"
                                : "#fafafa",
                            }}
                          >
                            {/* Unread indicator badge */}
                            {!notif.is_read && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#1da1f2] to-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-white text-sm font-bold">
                                  NEW
                                </span>
                              </div>
                            )}

                            <div className="flex items-start gap-4">
                              {/* Icon with gradient background */}
                              <div
                                className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110"
                                style={{
                                  background: `linear-gradient(135deg, ${typeInfo.color}dd, ${typeInfo.color})`,
                                }}
                              >
                                <span className="text-3xl">
                                  {typeInfo.icon}
                                </span>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <h4
                                    className={`font-bold text-lg leading-tight ${
                                      notif.is_read
                                        ? "text-gray-500"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {notif.title}
                                  </h4>
                                  <Tag
                                    className="flex-shrink-0 font-semibold"
                                    style={{
                                      color: "white",
                                      background: typeInfo.color,
                                      border: "none",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    {typeInfo.text}
                                  </Tag>
                                </div>

                                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                  {notif.summary?.substring(0, 120)}
                                  {notif.summary?.length > 120 ? "..." : ""}
                                </p>

                                {/* Meta info */}
                                <div className="flex flex-wrap items-center gap-4 text-xs">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    👤 {notif.advisor?.full_name || "N/A"}
                                  </span>
                                  <span
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium"
                                    title={dayjs(notif.created_at).format(
                                      "DD/MM/YYYY HH:mm"
                                    )}
                                  >
                                    📅 {dayjs(notif.created_at).fromNow()}
                                  </span>
                                  {notif.is_read ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                                      ✓ Đã đọc
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1da1f2] rounded-full font-bold">
                                      ● Chưa đọc
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Hover effect border */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                        <div className="text-sm text-gray-600 font-medium">
                          Trang{" "}
                          <span className="font-bold text-blue-600">
                            {currentPage}
                          </span>{" "}
                          / <span className="font-bold">{totalPages}</span>
                          <span className="ml-2 text-gray-500">
                            ({displayedNotifications.length} thông báo)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-300 hover:border-blue-400"
                          >
                            ««
                          </button>
                          <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-300 hover:border-blue-400"
                          >
                            ‹
                          </button>
                          <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all border-2 ${
                                  currentPage === index + 1
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 shadow-lg"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                                }`}
                              >
                                {index + 1}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-300 hover:border-blue-400"
                          >
                            ›
                          </button>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-300 hover:border-blue-400"
                          >
                            »»
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-10 px-5 text-center">
                    <Empty
                      description={
                        filterUnread
                          ? "Không có thông báo chưa đọc"
                          : "Chưa có thông báo nào"
                      }
                    />
                  </div>
                );
              })()}
            </Spin>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết thông báo"
        open={detailModalOpen}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>,
        ]}
        width={800}
        style={{ top: 20, fontSize: "36px" }}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto", padding: "24px" }}
      >
        <Spin spinning={detailLoading}>
          {selectedNotification && (
            <div className="flex flex-col gap-5">
              {/* Title Section */}
              <div className="pb-4 border-b-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedNotification.title}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    📅{" "}
                    {dayjs(selectedNotification.created_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </span>
                  <Tag
                    style={{
                      color: "white",
                      background: getTypeInfo(selectedNotification.type).color,
                      border: "none",
                      padding: "4px 12px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {getTypeInfo(selectedNotification.type).icon}{" "}
                    {getTypeInfo(selectedNotification.type).text}
                  </Tag>
                </div>
              </div>

              {/* Content Section */}
              {selectedNotification.summary && (
                <div className="py-4 border-b border-gray-200">
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
                    📝 Nội dung
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedNotification.summary}
                  </p>
                </div>
              )}

              {/* Link Section */}
              {selectedNotification.link && (
                <div className="py-4 border-b border-gray-200">
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
                    🔗 Liên kết
                  </h4>
                  <a
                    href={selectedNotification.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold break-all hover:underline text-sm hover:text-blue-800 transition-colors p-3 bg-blue-50 rounded-lg inline-block max-w-full"
                  >
                    {selectedNotification.link}
                  </a>
                </div>
              )}

              {/* Attachments Section */}
              {selectedNotification.attachments &&
                selectedNotification.attachments.length > 0 && (
                  <div className="py-4 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
                      📎 Tài liệu đính kèm (
                      {selectedNotification.attachments.length})
                    </h4>
                    <div className="flex flex-col gap-2">
                      {selectedNotification.attachments.map((attachment) => (
                        <button
                          key={attachment.attachment_id}
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="flex items-center gap-2 p-3 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors border border-blue-200 hover:border-blue-400 cursor-pointer"
                        >
                          📄 {attachment.file_name}
                          <span className="ml-auto text-xs text-gray-500">
                            Tải
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Conversation History Section */}
              {selectedNotification.my_response &&
                selectedNotification.my_response.length > 0 && (
                  <div className="py-4 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
                      💬 Lịch sử hội thoại (
                      {selectedNotification.my_response.length})
                    </h4>

                    <div className="space-y-4">
                      {selectedNotification.my_response.map(
                        (response, index) => (
                          <div
                            key={response.response_id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                          >
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-200">
                              Hội thoại #{index + 1}
                            </div>

                            {/* Question */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
                                ❓ Câu hỏi của bạn
                              </p>
                              <p className="text-gray-700 whitespace-pre-wrap text-sm mb-2">
                                {response.content}
                              </p>
                              <p className="text-xs text-gray-500">
                                📅{" "}
                                {dayjs(response.created_at).format(
                                  "HH:mm DD/MM/YYYY"
                                )}
                              </p>
                            </div>

                            {/* Response */}
                            {response.advisor_response ? (
                              <div>
                                <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">
                                  ✅ Phản hồi từ{" "}
                                  {response.advisor?.full_name || "Giảng viên"}
                                </p>
                                <p className="text-gray-700 whitespace-pre-wrap text-sm mb-2">
                                  {response.advisor_response}
                                </p>
                                {response.response_at && (
                                  <p className="text-xs text-gray-500 mb-3">
                                    📅{" "}
                                    {dayjs(response.response_at).format(
                                      "HH:mm DD/MM/YYYY"
                                    )}
                                  </p>
                                )}
                                <Tag
                                  color="success"
                                  style={{ fontSize: "12px" }}
                                >
                                  ✅ Đã phản hồi
                                </Tag>
                              </div>
                            ) : (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs font-semibold text-yellow-800 mb-1">
                                  ⏳ Chờ phản hồi
                                </p>
                                <p className="text-xs text-yellow-700">
                                  Câu hỏi của bạn đang được xem xét.
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Response Form Section */}
              <div className="pt-4">
                <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
                  💬{" "}
                  {selectedNotification.my_response
                    ? "Gửi câu hỏi mới"
                    : "Gửi phản hồi"}
                </h4>
                <p className="text-xs text-gray-500 mb-4 italic">
                  {selectedNotification.my_response
                    ? "Bạn vẫn có thể gửi thêm câu hỏi nếu cần thêm thông tin hoặc làm rõ."
                    : "Bạn có câu hỏi hoặc muốn phản hồi? Hãy để lại tin nhắn của bạn dưới đây."}
                </p>
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập nội dung phản hồi của bạn (tối thiểu 10 ký tự)..."
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  maxLength={5000}
                  showCount
                  className="mb-3 border-gray-300 rounded-lg mb-5"
                />
                <Button
                  type="primary"
                  loading={submitingResponse}
                  disabled={
                    submitingResponse || responseContent.trim().length < 10
                  }
                  onClick={handleSubmitResponse}
                  className="w-full font-semibold"
                  size="large"
                >
                  Gửi phản hồi ({responseContent.trim().length}/10)
                </Button>
              </div>
            </div>
          )}
        </Spin>
      </Modal>
    </StudentLayout>
  );
};

export default StudentPage;
