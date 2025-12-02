import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Avatar,
  Empty,
  message,
  Popconfirm,
  Alert,
  Badge,
  Tooltip,
  Upload,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PaperClipOutlined,
  FileOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { StudentLayout } from "../../../components/layout/StudentLayout";
import {
  getConversationsApi,
  getMessagesApi,
  sendMessageApi,
  deleteMessageApi,
  searchMessagesApi,
} from "../../../services/api.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { TextArea } = Input;
const { Search } = Input;

export const StudentChat = () => {
  const [advisor, setAdvisor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await getConversationsApi();
      if (response?.success && response?.data && response.data.length > 0) {
        const advisorConv = response.data[0];
        setAdvisor(advisorConv);
        fetchMessages(advisorConv.partner_id);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      if (error?.response?.status === 404) {
        message.error("Lớp của bạn chưa có cố vấn");
      } else {
        message.error("Không thể tải thông tin cố vấn");
      }
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      setLoading(true);
      const response = await getMessagesApi(partnerId);
      if (response?.success && response?.data) {
        setMessages(response.data);
        if (advisor) {
          setAdvisor((prev) => ({ ...prev, unread_count: 0 }));
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      message.error("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() && fileList.length === 0) {
      message.warning("Vui lòng nhập nội dung hoặc chọn file đính kèm");
      return;
    }

    if (!advisor) {
      message.warning("Không thể gửi tin nhắn - chưa có cố vấn");
      return;
    }

    try {
      setSending(true);

      let attachmentPath = null;
      if (fileList.length > 0) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", fileList[0].originFileObj);

        // Upload file trước
        const uploadResponse = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          attachmentPath = uploadData.data.path;
        } else {
          message.error(uploadData.message || "Không thể upload file");
          setUploading(false);
          setSending(false);
          return;
        }
        setUploading(false);
      }

      const response = await sendMessageApi({
        partner_id: advisor.partner_id,
        content: messageContent.trim() || "",
        attachment_path: attachmentPath,
      });

      if (response?.success && response?.data) {
        setMessages((prev) => [...prev, response.data]);
        setMessageContent("");
        setFileList([]);
        setAdvisor((prev) => ({
          ...prev,
          last_message: response.data.content,
          last_message_time: response.data.sent_at,
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      message.error(error?.message || "Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await deleteMessageApi(messageId);
      if (response?.success) {
        message.success("Xóa tin nhắn thành công");
        setMessages((prev) =>
          prev.filter((msg) => msg.message_id !== messageId)
        );
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      message.error(error?.message || "Không thể xóa tin nhắn");
    }
  };

  const handleRefresh = () => {
    if (advisor) {
      fetchMessages(advisor.partner_id);
    } else {
      fetchConversation();
    }
  };

  const handleSearchMessages = async (keyword) => {
    if (!keyword.trim()) {
      if (advisor) {
        fetchMessages(advisor.partner_id);
      }
      return;
    }

    if (!advisor) {
      message.warning("Chưa có cố vấn để tìm kiếm");
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const response = await searchMessagesApi(
        advisor.partner_id,
        keyword.trim()
      );
      if (response?.success && response?.data) {
        setMessages(response.data);
        setSearchKeyword(keyword.trim());
      }
    } catch (error) {
      console.error("Error searching messages:", error);
      message.error("Không thể tìm kiếm tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
    setIsSearching(false);
    if (advisor) {
      fetchMessages(advisor.partner_id);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    // Chỉ cho phép 1 file
    setFileList(newFileList.slice(-1));
  };

  const handleRemoveFile = () => {
    setFileList([]);
  };

  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("File phải nhỏ hơn 10MB!");
      return false;
    }
    return false; // Prevent auto upload
  };

  const renderMessageItem = (msg) => {
    const isSentByMe = msg.sender_type === "student";
    const isDeleted = !msg.content && !msg.attachment_path;

    return (
      <div
        key={msg.message_id}
        className={`flex ${
          isSentByMe ? "justify-end" : "justify-start"
        } mb-4 group`}
      >
        <div
          className={`flex gap-3 max-w-[75%] ${
            isSentByMe ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {!isSentByMe && (
            <Avatar
              src={advisor?.partner_avatar}
              icon={<UserOutlined />}
              size={40}
              className="flex-shrink-0 shadow-md border-2 border-white"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            />
          )}
          <div
            className={`flex flex-col ${
              isSentByMe ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-5 py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                isDeleted
                  ? "bg-gray-50 text-gray-400 italic border border-gray-200"
                  : isSentByMe
                  ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white"
                  : "bg-white text-gray-800 border border-gray-100"
              }`}
              style={{
                borderBottomRightRadius: isSentByMe ? "6px" : "18px",
                borderBottomLeftRadius: isSentByMe ? "18px" : "6px",
              }}
            >
              {isDeleted ? (
                <span className="flex items-center gap-2">
                  <CloseCircleOutlined className="text-gray-400" />
                  <span className="text-sm">Tin nhắn đã bị xóa</span>
                </span>
              ) : (
                <>
                  {msg.content && (
                    <span className="whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </span>
                  )}
                  {msg.attachment_path && (
                    <div className="mt-3">
                      <Link
                        to={`http://localhost:8000${msg.attachment_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group/file ${
                          isSentByMe
                            ? "border-white/50 hover:bg-white/10" // Tin gửi: Viền trắng mờ
                            : "bg-white border-gray-200 hover:border-blue-400 shadow-sm" // Tin nhận: Nền trắng
                        }`}
                      >
                        {/* Icon Wrapper */}
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                            isSentByMe
                              ? "bg-white text-blue-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <FileOutlined className="text-xl" />
                        </div>

                        <div className="flex flex-col overflow-hidden text-left">
                          {/* Tên file */}
                          <span
                            className={`text-sm font-bold truncate pr-2 ${
                              isSentByMe ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {msg.attachment_path.split("/").pop()}
                          </span>

                          {/* Text phụ */}
                          <span
                            className={`text-[11px] font-medium ${
                              isSentByMe ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            Nhấn để xem
                          </span>
                        </div>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
            <div
              className={`flex items-center gap-2 mt-1.5 px-1 ${
                isSentByMe ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span className="text-xs text-gray-400 font-medium">
                {dayjs(msg.sent_at).format("HH:mm")}
              </span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">
                {dayjs(msg.sent_at).format("DD/MM/YYYY")}
              </span>
              {isSentByMe && !isDeleted && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <Tooltip
                    title={msg.is_read === 1 ? "Cố vấn đã đọc" : "Chưa đọc"}
                  >
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        msg.is_read === 1 ? "text-green-500" : "text-blue-500"
                      }`}
                    >
                      {msg.is_read === 1 ? (
                        <CheckCircleOutlined className="text-xs" />
                      ) : (
                        <ClockCircleOutlined className="text-xs" />
                      )}
                      <span className="font-medium">
                        {msg.is_read === 1 ? "Đã đọc" : "Đã gửi"}
                      </span>
                    </span>
                  </Tooltip>
                  <Popconfirm
                    title="Xóa tin nhắn"
                    description="Bạn có chắc chắn muốn xóa tin nhắn này?"
                    onConfirm={() => handleDeleteMessage(msg.message_id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 rounded-full"
                    />
                  </Popconfirm>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto p-6">
        <Card
          bodyStyle={{
            padding: 0,
            height: "calc(100vh - 200px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {advisor ? (
            <>
              {/* Chat Header */}
              <div
                className="p-5 border-b bg-gradient-to-r from-blue-50 via-white to-blue-50"
                style={{
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge dot status="success" offset={[-5, 35]}>
                      <Avatar
                        src={advisor.partner_avatar}
                        icon={<UserOutlined />}
                        size={56}
                        className="shadow-lg border-3 border-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                    </Badge>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {advisor.partner_name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Cố vấn học tập • Đang hoạt động
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Search
                      placeholder="Tìm kiếm tin nhắn..."
                      onSearch={handleSearchMessages}
                      style={{ width: 280 }}
                      enterButton={<SearchOutlined />}
                      allowClear
                      onClear={handleClearSearch}
                      size="large"
                      className="rounded-lg"
                    />
                    <Tooltip title="Làm mới">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                        type="default"
                        size="large"
                        className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      />
                    </Tooltip>
                  </div>
                </div>
                {isSearching && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <span className="text-sm text-blue-700 flex items-center gap-2">
                      <SearchOutlined className="text-lg" />
                      Tìm thấy{" "}
                      <strong className="font-bold">
                        {messages.length}
                      </strong>{" "}
                      kết quả cho "
                      <strong className="font-bold">{searchKeyword}</strong>"
                    </span>
                    <Button
                      type="text"
                      size="small"
                      onClick={handleClearSearch}
                      className="text-blue-600 hover:bg-blue-100 rounded-lg"
                      icon={<CloseCircleOutlined />}
                    >
                      Xóa tìm kiếm
                    </Button>
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-6"
                style={{
                  background:
                    "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-gray-500 font-medium">
                        Đang tải tin nhắn...
                      </p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div className="text-center">
                          <p className="text-gray-500 text-base mb-2">
                            {isSearching
                              ? "Không tìm thấy tin nhắn phù hợp"
                              : "Chưa có tin nhắn nào"}
                          </p>
                          {!isSearching && (
                            <p className="text-gray-400 text-sm">
                              Hãy bắt đầu cuộc trò chuyện với cố vấn của bạn!
                            </p>
                          )}
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(renderMessageItem)}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input - ĐÃ FORMAT LẠI */}
              <div
                className="p-5 bg-white border-t"
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
                }}
              >
                {/* File đã chọn */}
                {fileList.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 w-fit">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <FileOutlined className="text-blue-500 text-lg" />
                        <span className="text-sm font-medium text-gray-700">
                          {fileList[0].name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(fileList[0].size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<CloseOutlined />}
                        onClick={handleRemoveFile}
                        className="hover:bg-blue-100 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Input Controls */}
                <div className="flex items-end gap-3">
                  <Upload
                    fileList={fileList}
                    onChange={handleFileChange}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                    showUploadList={false}
                  >
                    <Button
                      icon={<PaperClipOutlined style={{ fontSize: "20px" }} />}
                      size="large"
                      className="rounded-xl border-gray-200 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-colors"
                      disabled={sending || uploading}
                      style={{
                        height: "46px", // Chiều cao bằng với TextArea mặc định
                        width: "46px", // Hình vuông
                        padding: 0,
                      }}
                    />
                  </Upload>

                  <div className="flex-1">
                    <TextArea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Nhập tin nhắn gửi cho cố vấn..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="rounded-xl border-gray-200 focus:border-blue-400 transition-colors"
                      style={{
                        padding: "10px 15px",
                        fontSize: "15px",
                        lineHeight: "24px",
                        resize: "none",
                      }}
                    />
                  </div>

                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={sending || uploading}
                    disabled={!messageContent.trim() && fileList.length === 0}
                    size="large"
                    className="rounded-xl shadow-md hover:shadow-lg transition-all font-medium flex items-center"
                    style={{
                      height: "46px", // Chiều cao bằng với TextArea
                      background:
                        messageContent.trim() || fileList.length > 0
                          ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                          : undefined,
                      border: "none",
                      paddingLeft: "10px", // Padding trái 10px như yêu cầu
                      paddingRight: "20px",
                    }}
                  >
                    Gửi
                  </Button>
                </div>

                <div className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-gray-100 rounded shadow-sm font-mono text-gray-600">
                      Enter
                    </kbd>
                    <span>để gửi</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-gray-100 rounded shadow-sm font-mono text-gray-600">
                      Shift + Enter
                    </kbd>
                    <span>để xuống dòng</span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div
              className="flex items-center justify-center h-full"
              style={{
                background: "linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 100%)",
              }}
            >
              {loading ? (
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-gray-500 font-medium">Đang tải...</p>
                </div>
              ) : (
                <Alert
                  message="Chưa có cố vấn"
                  description="Lớp của bạn chưa được phân công cố vấn. Vui lòng liên hệ phòng đào tạo để được hỗ trợ."
                  type="warning"
                  showIcon
                  action={
                    <Button
                      size="middle"
                      onClick={fetchConversation}
                      className="rounded-lg"
                    >
                      Thử lại
                    </Button>
                  }
                  style={{
                    maxWidth: 500,
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              )}
            </div>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};
