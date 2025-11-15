import { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  Avatar,
  Space,
  Empty,
  message,
  Popconfirm,
  Alert,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
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
    if (!messageContent.trim()) {
      message.warning("Vui lòng nhập nội dung tin nhắn");
      return;
    }

    if (!advisor) {
      message.warning("Không thể gửi tin nhắn - chưa có cố vấn");
      return;
    }

    try {
      setSending(true);
      const response = await sendMessageApi({
        partner_id: advisor.partner_id,
        content: messageContent.trim(),
      });

      if (response?.success && response?.data) {
        setMessages((prev) => [...prev, response.data]);
        setMessageContent("");
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

  const renderMessageItem = (msg) => {
    const isSentByMe = msg.sender_type === "student";
    const isDeleted = !msg.content && !msg.attachment_path;

    return (
      <div
        key={msg.message_id}
        className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`flex gap-2 max-w-[70%] ${
            isSentByMe ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {!isSentByMe && (
            <Avatar
              src={advisor?.partner_avatar}
              icon={<UserOutlined />}
              size={32}
              className="flex-shrink-0"
            />
          )}
          <div
            className={`flex flex-col ${
              isSentByMe ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                isDeleted
                  ? "bg-gray-100 text-gray-400 italic border border-gray-200"
                  : isSentByMe
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
              style={{
                borderBottomRightRadius: isSentByMe ? "4px" : "16px",
                borderBottomLeftRadius: isSentByMe ? "16px" : "4px",
              }}
            >
              {isDeleted ? (
                <span className="flex items-center gap-1">
                  🚫 Tin nhắn đã bị xóa
                </span>
              ) : (
                <span className="whitespace-pre-wrap break-words">
                  {msg.content}
                </span>
              )}
            </div>
            <div
              className={`flex items-center gap-2 mt-1 px-1 ${
                isSentByMe ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span className="text-xs text-gray-400">
                {dayjs(msg.sent_at).format("HH:mm DD/MM/YYYY")}
              </span>
              {isSentByMe && !isDeleted && (
                <>
                  <span
                    className={`text-xs ${
                      msg.is_read === 1
                        ? "text-gray-400"
                        : "text-blue-500 font-medium"
                    }`}
                  >
                    {msg.is_read === 1 ? "Đã đọc" : "Chưa đọc"}
                  </span>
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
                      className="h-auto p-0 hover:text-red-600"
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
      <div className="max-w-7xl mx-auto p-4">
        <Card
          bodyStyle={{
            padding: 0,
            height: "calc(100vh - 200px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          style={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {advisor ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={advisor.partner_avatar}
                      icon={<UserOutlined />}
                      size={50}
                      className="border-2 border-blue-500"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Cố vấn: {advisor.partner_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        💬 Liên hệ với cố vấn học tập của bạn
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search
                      placeholder="Tìm kiếm tin nhắn..."
                      onSearch={handleSearchMessages}
                      style={{ width: 250 }}
                      enterButton={<SearchOutlined />}
                      allowClear
                      onClear={handleClearSearch}
                    />
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      loading={loading}
                      type="default"
                      size="large"
                    >
                      Làm mới
                    </Button>
                  </div>
                </div>
                {isSearching && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center justify-between">
                    <span>
                      🔍 Tìm thấy <strong>{messages.length}</strong> kết quả cho
                      "<strong>{searchKeyword}</strong>"
                    </span>
                    <Button
                      type="link"
                      size="small"
                      onClick={handleClearSearch}
                      className="text-blue-600"
                    >
                      Xóa tìm kiếm
                    </Button>
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                      <p className="text-gray-500">Đang tải tin nhắn...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Empty
                      description={
                        <span className="text-gray-500">
                          {isSearching
                            ? "Không tìm thấy tin nhắn phù hợp"
                            : "Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện với cố vấn!"}
                        </span>
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

              {/* Message Input */}
              <div className="p-4 bg-white border-t">
                <Space.Compact style={{ width: "100%" }} size="large">
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
                    className="rounded-lg"
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={sending}
                    disabled={!messageContent.trim()}
                    size="large"
                    className="bg-blue-500 hover:bg-blue-600 min-w-[100px]"
                  >
                    Gửi
                  </Button>
                </Space.Compact>
                <div className="text-xs text-gray-400 mt-2 text-center">
                  💡 Nhấn{" "}
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd>{" "}
                  để gửi,{" "}
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded">
                    Shift+Enter
                  </kbd>{" "}
                  để xuống dòng
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-gray-50">
              {loading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : (
                <Alert
                  message="Chưa có cố vấn"
                  description="Lớp của bạn chưa được phân công cố vấn. Vui lòng liên hệ phòng đào tạo để được hỗ trợ."
                  type="warning"
                  showIcon
                  action={
                    <Button size="small" onClick={fetchConversation}>
                      Thử lại
                    </Button>
                  }
                  style={{ maxWidth: 500 }}
                />
              )}
            </div>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};
