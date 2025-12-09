import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom"; // Import Link
import {
  Card,
  List,
  Input,
  Button,
  Avatar,
  Badge,
  Empty,
  message,
  Popconfirm,
  Tooltip,
  Upload,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  SearchOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PaperClipOutlined,
  FileOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";
import {
  getConversationsApi,
  getMessagesApi,
  sendMessageApi,
  deleteMessageApi,
  searchMessagesApi,
} from "../../../services/api.service";
import { AuthContext } from "../../../components/context/auth.context";
import { getEcho, initEcho } from "../../../utils/echo";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { TextArea } = Input;
const { Search } = Input;

export const AdvisorChat = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // Loading cho conversations list
  const [messagesLoading, setMessagesLoading] = useState(false); // Loading cho messages
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [studentSearchKeyword, setStudentSearchKeyword] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const echoChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Khởi tạo Echo với token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !getEcho()) {
      initEcho(token);
    }
  }, []);

  // Subscribe WebSocket channel khi có user
  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    // Subscribe vào channel advisor
    const channelName = `chat.advisor.${user.id}`;
    console.log("🔵 [Advisor] Subscribing to channel:", channelName);
    console.log("🔵 [Advisor] User ID:", user.id);
    console.log("🔵 [Advisor] User Role:", user.role);

    echoChannelRef.current = echo.private(channelName);

    // Listen sự kiện tin nhắn mới
    echoChannelRef.current.listen(".message.sent", (event) => {
      console.log("📩 [Advisor] Received new message:", event);
      console.log("📩 [Advisor] Sender info:", event.sender);
      console.log("📩 [Advisor] Sender type:", event.sender?.type);
      console.log(
        "📩 [Advisor] Current selected conversation:",
        selectedConversation?.partner_id
      );

      // ✅ Reload conversations để cập nhật tin nhắn mới nhất và unread count
      // Giống như advisor-chat.blade.php dòng 702: loadStudents()
      fetchConversations();

      // ✅ CHỈ hiển thị tin nhắn từ student (không phải từ chính mình)
      // Giống như trong advisor-chat.blade.php: if (e.sender.type !== currentUser.role && selectedStudent && e.sender.id === selectedStudent.id)
      if (event.sender && event.sender.type !== 'advisor') {
        // Thêm tin nhắn vào danh sách nếu đang xem conversation đó
        if (
          selectedConversation &&
          event.message.student_id === selectedConversation.partner_id
        ) {
          setMessages((prev) => {
            // Kiểm tra tin nhắn đã tồn tại chưa
            const exists = prev.some(
              (msg) => msg.message_id === event.message.message_id
            );
            if (!exists) {
              return [...prev, event.message];
            }
            return prev;
          });
        }

        // Hiển thị thông báo nếu không đang xem conversation đó
        if (
          !selectedConversation ||
          selectedConversation.partner_id !== event.message.student_id
        ) {
          message.info(`Tin nhắn mới từ ${event.sender?.name || "Sinh viên"}`);
        }
      }
    });

    // Listen sự kiện đã đọc
    echoChannelRef.current.listen(".message.read", (event) => {
      console.log("Message read:", event);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === event.message.message_id
            ? { ...msg, is_read: 1 }
            : msg
        )
      );
    });

    // Listen sự kiện typing
    echoChannelRef.current.listen(".user.typing", (event) => {
      console.log("User typing:", event);
      if (
        selectedConversation &&
        event.sender_id === selectedConversation.partner_id
      ) {
        setIsTyping(event.is_typing);
        setTypingUser(event.sender_name);

        // Tự động tắt typing indicator sau 3 giây
        if (event.is_typing) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        }
      }
    });

    console.log(
      `✅ [Advisor] Successfully subscribed to channel: ${channelName}`
    );

    // Cleanup khi unmount
    return () => {
      if (echoChannelRef.current) {
        echo.leave(channelName);
        console.log(`❌ [Advisor] Unsubscribed from channel: ${channelName}`);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user?.id, selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversationsApi();
      if (response?.success && response?.data) {
        setConversations(response.data);
        setFilteredConversations(response.data);
      } else if (response?.data) {
        setConversations(response.data);
        setFilteredConversations(response.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (error.response?.status === 404) {
        setConversations([]);
        setFilteredConversations([]);
      } else {
        message.error("Không thể tải danh sách hội thoại");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      setMessagesLoading(true);
      const response = await getMessagesApi(partnerId);
      if (response?.success && response?.data) {
        setMessages(response.data);
        setIsSearching(false);
        setSearchKeyword("");
        setConversations((prev) =>
          prev.map((conv) =>
            conv.partner_id === partnerId ? { ...conv, unread_count: 0 } : conv
          )
        );
      } else if (response?.data) {
        setMessages(response.data);
        setIsSearching(false);
        setSearchKeyword("");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 404) {
        setMessages([]);
      } else {
        message.error("Không thể tải tin nhắn");
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.partner_id);
    
    // ✅ Reload conversations sau khi xem tin nhắn để cập nhật unread count = 0
    // Giống như advisor-chat.blade.php dòng 676-678
    setTimeout(() => {
      fetchConversations();
    }, 500); // Delay để backend kịp mark messages as read
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() && fileList.length === 0) {
      message.warning("Vui lòng nhập nội dung hoặc chọn file đính kèm");
      return;
    }

    if (!selectedConversation) {
      message.warning("Vui lòng chọn sinh viên để gửi tin nhắn");
      return;
    }

    try {
      setSending(true);

      // ✅ Gửi file trực tiếp cùng với tin nhắn (giống Blade.php)
      const formData = new FormData();
      formData.append('partner_id', selectedConversation.partner_id);
      if (messageContent.trim()) {
        formData.append('content', messageContent.trim());
      }
      if (fileList.length > 0) {
        formData.append('attachment', fileList[0].originFileObj);
      }

      const response = await fetch('http://localhost:8000/api/dialogs/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data?.success && data?.data) {
        setMessages((prev) => [...prev, data.data]);
        setMessageContent("");
        setFileList([]);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.partner_id === selectedConversation.partner_id
              ? {
                  ...conv,
                  last_message: data.data.content || "Đã gửi file đính kèm",
                  last_message_time: data.data.sent_at,
                }
              : conv
          )
        );
        message.success("Gửi tin nhắn thành công");
      } else {
        message.error(data?.message || "Không thể gửi tin nhắn");
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

  const handleSearchMessages = async (keyword) => {
    if (!keyword.trim()) {
      fetchMessages(selectedConversation.partner_id);
      return;
    }

    if (!selectedConversation) {
      message.warning("Vui lòng chọn sinh viên trước");
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const response = await searchMessagesApi(
        selectedConversation.partner_id,
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
    if (selectedConversation) {
      fetchMessages(selectedConversation.partner_id);
    }
  };

  const handleSearchStudent = (keyword) => {
    setStudentSearchKeyword(keyword);
    if (!keyword.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter((conv) => {
      const searchLower = keyword.toLowerCase().trim();
      return (
        conv.partner_name?.toLowerCase().includes(searchLower) ||
        conv.partner_code?.toLowerCase().includes(searchLower) ||
        conv.class_name?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredConversations(filtered);
  };

  const handleFileChange = ({ fileList: newFileList }) => {
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
    return false;
  };

  const renderMessageItem = (msg) => {
    const isSentByMe = msg.sender_type === "advisor";
    const isDeleted = !msg.content && !msg.attachment_path;

    return (
      <div
        key={msg.message_id}
        className={`flex ${
          isSentByMe ? "justify-end" : "justify-start"
        } mb-4 group`}
      >
        <div
          className={`flex gap-3 max-w-[70%] ${
            isSentByMe ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {!isSentByMe && (
            <Avatar
              src={selectedConversation.partner_avatar}
              icon={<UserOutlined />}
              size={36}
              className="flex-shrink-0 shadow-md ring-2 ring-white"
            />
          )}
          <div
            className={`flex flex-col ${
              isSentByMe ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-5 py-3 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg ${
                isDeleted
                  ? "bg-gray-100 text-gray-400 italic border border-gray-200"
                  : isSentByMe
                  ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
              style={{
                borderBottomRightRadius: isSentByMe ? "6px" : "18px",
                borderBottomLeftRadius: isSentByMe ? "18px" : "6px",
              }}
            >
              {isDeleted ? (
                <span className="flex items-center gap-2 text-sm">
                  <DeleteOutlined className="text-gray-400" />
                  Tin nhắn đã bị xóa
                </span>
              ) : (
                <>
                  {msg.content && (
                    <span className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                      {msg.content}
                    </span>
                  )}
                  {msg.attachment_path && (
                    <div className={msg.content ? "mt-3" : ""}>
                      <Link
                        to={`http://localhost:8000${msg.attachment_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group/file ${
                          isSentByMe
                            ? "border-white/50 hover:bg-white/10"
                            : "bg-white border-gray-200 hover:border-blue-400 shadow-sm"
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
                          <span
                            className={`text-sm font-bold truncate pr-2 ${
                              isSentByMe ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {msg.attachment_path.split("/").pop()}
                          </span>

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
                {dayjs(msg.sent_at).format("HH:mm DD/MM/YYYY")}
              </span>
              {isSentByMe && !isDeleted && (
                <>
                  <Tooltip title={msg.is_read === 1 ? "Đã xem" : "Chưa xem"}>
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        msg.is_read === 1
                          ? "text-gray-400"
                          : "text-blue-500 font-semibold"
                      }`}
                    >
                      {msg.is_read === 1 ? (
                        <CheckCircleOutlined className="text-sm" />
                      ) : (
                        <ClockCircleOutlined className="text-sm" />
                      )}
                      {msg.is_read === 1 ? "Đã đọc" : "Chưa đọc"}
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
                      className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50 rounded"
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
    <AdvisorLayout>
      <div className="space-y-6">
        <div
          className="flex gap-5 overflow-hidden"
          style={{ height: "calc(100vh - 220px)" }}
        >
          {/* Conversations List - Sidebar */}
          <Card
            className="w-96 flex flex-col"
            bodyStyle={{
              padding: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            style={{
              borderRadius: 16,
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b bg-gradient-to-br from-blue-500 via-blue-550 to-blue-600">
              <div className="flex justify-between items-center text-white mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2.5">
                  <span className="text-2xl">💬</span>
                  <span>Tin nhắn</span>
                </h2>
                <Tooltip title="Làm mới danh sách">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchConversations}
                    loading={loading && !selectedConversation}
                    type="text"
                    className="text-white hover:bg-white/20 rounded-lg transition-all h-9 w-9"
                  />
                </Tooltip>
              </div>
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-2 transition-all hover:bg-white/20">
                <SearchOutlined className="text-white text-base" />
                <Input
                  placeholder="Tìm kiếm sinh viên..."
                  value={studentSearchKeyword}
                  onChange={(e) => handleSearchStudent(e.target.value)}
                  allowClear
                  className="bg-transparent border-0 text-white placeholder-white/60 font-medium"
                  style={{
                    border: "none",
                    boxShadow: "none",
                  }}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 && studentSearchKeyword ? (
                <div className="p-6 text-center text-gray-500">
                  <Empty
                    description="Không tìm thấy sinh viên phù hợp"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <List
                  loading={loading && !selectedConversation}
                  dataSource={filteredConversations}
                  renderItem={(conv) => (
                    <List.Item
                      key={conv.partner_id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`cursor-pointer transition-all duration-300 border-b border-gray-100 m-0 ${
                        selectedConversation?.partner_id === conv.partner_id
                          ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-inner"
                          : "hover:bg-gray-50 border-l-4 border-l-transparent hover:border-l-blue-200"
                      }`}
                      style={{ padding: "14px 18px" }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge
                            count={conv.unread_count}
                            offset={[-6, 6]}
                            style={{
                              backgroundColor: "#ef4444",
                              fontWeight: "600",
                              fontSize: "11px",
                              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            <Avatar
                              src={conv.partner_avatar}
                              icon={<UserOutlined />}
                              size={52}
                              className="border-2 border-white shadow-lg hover:shadow-xl transition-all ring-2 ring-blue-100"
                            />
                          </Badge>
                        }
                        title={
                          <div
                            className={`font-semibold line-clamp-1 text-base transition-colors ${
                              conv.unread_count > 0
                                ? "text-gray-900"
                                : "text-gray-800"
                            }`}
                          >
                            {conv.partner_name}
                          </div>
                        }
                        description={
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                {conv.partner_code}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="font-medium text-gray-600">
                                {conv.class_name}
                              </span>
                            </div>
                            <div
                              className={`text-sm line-clamp-1 transition-all ${
                                conv.unread_count > 0
                                  ? "text-gray-800 font-semibold"
                                  : "text-gray-600"
                              }`}
                            >
                              {conv.last_message || (
                                <span className="italic text-gray-400">
                                  Chưa có tin nhắn
                                </span>
                              )}
                            </div>
                            {conv.last_message_time && (
                              <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                <ClockCircleOutlined className="text-xs" />
                                {dayjs(conv.last_message_time).fromNow()}
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card
            className="flex-1 flex flex-col"
            bodyStyle={{
              padding: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            style={{
              borderRadius: 16,
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 border-b shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar
                          src={selectedConversation.partner_avatar}
                          icon={<UserOutlined />}
                          size={60}
                          className="border-3 border-blue-400 shadow-xl ring-4 ring-blue-100"
                        />
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {selectedConversation.partner_name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2.5">
                          <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            {selectedConversation.partner_code}
                          </span>
                          <span className="text-gray-400 font-bold">•</span>
                          <span className="font-semibold text-gray-700">
                            {selectedConversation.class_name}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Search
                      placeholder="Tìm kiếm tin nhắn..."
                      onSearch={handleSearchMessages}
                      style={{ width: 340 }}
                      size="large"
                      enterButton={
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Tìm
                        </Button>
                      }
                      allowClear
                      onClear={handleClearSearch}
                      className="shadow-sm"
                    />
                  </div>
                  {isSearching && (
                    <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-sm text-blue-800 flex items-center justify-between border border-blue-200 shadow-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <SearchOutlined className="text-blue-500" />
                        Tìm thấy{" "}
                        <strong className="text-blue-600">
                          {messages.length}
                        </strong>{" "}
                        kết quả cho "
                        <strong className="text-blue-700">
                          {searchKeyword}
                        </strong>
                        "
                      </span>
                      <Button
                        type="link"
                        size="small"
                        onClick={handleClearSearch}
                        className="text-blue-600 font-semibold hover:text-blue-700"
                      >
                        Xóa tìm kiếm
                      </Button>
                    </div>
                  )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4 shadow-lg"></div>
                        <p className="text-gray-600 font-semibold text-base">
                          Đang tải tin nhắn...
                        </p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-7xl mb-5 animate-bounce">💬</div>
                        <p className="text-gray-500 text-lg font-semibold">
                          {isSearching
                            ? "Không tìm thấy tin nhắn phù hợp"
                            : "Chưa có tin nhắn nào"}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          {!isSearching && "Hãy bắt đầu cuộc trò chuyện!"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {messages.map(renderMessageItem)}
                      {/* Typing Indicator */}
                      {isTyping && typingUser && (
                        <div className="flex justify-start mb-4">
                          <div className="flex gap-3 items-center">
                            <Avatar
                              src={selectedConversation.partner_avatar}
                              icon={<UserOutlined />}
                              size={36}
                              className="flex-shrink-0"
                            />
                            <div className="bg-gray-200 px-5 py-3 rounded-2xl">
                              <div className="flex gap-1.5">
                                <span
                                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                ></span>
                                <span
                                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                ></span>
                                <span
                                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                ></span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 italic">
                              {typingUser} đang nhập...
                            </span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input - ĐÃ CẬP NHẬT GIAO DIỆN MỚI */}
                <div
                  className="p-5 bg-white border-t shadow-inner"
                  style={{
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {/* File Preview */}
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
                        icon={
                          <PaperClipOutlined style={{ fontSize: "20px" }} />
                        }
                        size="large"
                        className="rounded-xl border-gray-200 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-colors"
                        disabled={sending || uploading}
                        style={{
                          height: "46px", // Hình vuông 46x46
                          width: "46px",
                          padding: 0,
                        }}
                      />
                    </Upload>

                    <div className="flex-1">
                      <TextArea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Nhập tin nhắn..."
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
                        height: "46px",
                        background:
                          messageContent.trim() || fileList.length > 0
                            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                            : undefined,
                        border: "none",
                        paddingLeft: "10px", // Padding trái 10px
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
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="text-center p-8">
                  <div className="text-8xl mb-5">💬</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Chào mừng đến với Chat
                  </h3>
                  <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
                    Chọn một sinh viên từ danh sách bên trái để bắt đầu cuộc trò
                    chuyện
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorChat;
