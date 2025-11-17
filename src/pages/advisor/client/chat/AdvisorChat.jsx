import { useState, useEffect, useRef } from "react";
import {
  Card,
  List,
  Input,
  Button,
  Avatar,
  Space,
  Badge,
  Empty,
  message,
  Popconfirm,
  Divider,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  SearchOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { AdvisorLayout } from "../../../../components/layout/AdvisorLayout";
import {
  getConversationsApi,
  getMessagesApi,
  sendMessageApi,
  deleteMessageApi,
  searchMessagesApi,
} from "../../../../services/api.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { TextArea } = Input;
const { Search } = Input;

export const AdvisorChat = () => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [studentSearchKeyword, setStudentSearchKeyword] = useState("");
  const messagesEndRef = useRef(null);

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
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      message.error("Không thể tải danh sách hội thoại");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      setLoading(true);
      const response = await getMessagesApi(partnerId);
      if (response?.success && response?.data) {
        setMessages(response.data);
        setIsSearching(false);
        setSearchKeyword("");
        // Update unread count in conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.partner_id === partnerId ? { ...conv, unread_count: 0 } : conv
          )
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      message.error("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.partner_id);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      message.warning("Vui lòng nhập nội dung tin nhắn");
      return;
    }

    if (!selectedConversation) {
      message.warning("Vui lòng chọn sinh viên để gửi tin nhắn");
      return;
    }

    try {
      setSending(true);
      const response = await sendMessageApi({
        partner_id: selectedConversation.partner_id,
        content: messageContent.trim(),
      });

      if (response?.success && response?.data) {
        setMessages((prev) => [...prev, response.data]);
        setMessageContent("");
        // Update last message in conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.partner_id === selectedConversation.partner_id
              ? {
                  ...conv,
                  last_message: response.data.content,
                  last_message_time: response.data.sent_at,
                }
              : conv
          )
        );
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

  const renderMessageItem = (msg) => {
    const isSentByMe = msg.sender_type === "advisor";
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
              src={selectedConversation.partner_avatar}
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
    <AdvisorLayout>
      <div className="space-y-6">
        {/* <h1 className="text-2xl font-bold text-gray-900">💬 Tin nhắn</h1> */}
        <div
          className="flex gap-4 overflow-hidden"
          style={{ height: "calc(100vh - 260px)" }}
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
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex justify-between items-center text-white mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UserOutlined />
                  Sinh viên ({filteredConversations.length}/
                  {conversations.length})
                </h2>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchConversations}
                  loading={loading && !selectedConversation}
                  type="text"
                  className="text-white hover:bg-white/20"
                />
              </div>
              <Input
                placeholder="Tìm kiếm sinh viên (tên, mã SV, lớp)..."
                prefix={<SearchOutlined className="text-white/70" />}
                value={studentSearchKeyword}
                onChange={(e) => handleSearchStudent(e.target.value)}
                allowClear
                className="bg-white/20 border-white/30 text-white placeholder-white/70"
                style={{
                  color: "white",
                }}
              />
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 && studentSearchKeyword ? (
                <div className="p-4 text-center text-gray-500">
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
                      className={`cursor-pointer transition-all duration-200 border-b border-gray-100 m-0 ${
                        selectedConversation?.partner_id === conv.partner_id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : "hover:bg-gray-50 border-l-4 border-l-transparent"
                      }`}
                      style={{ padding: "12px 16px" }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge count={conv.unread_count} offset={[-5, 5]}>
                            <Avatar
                              src={conv.partner_avatar}
                              icon={<UserOutlined />}
                              size={50}
                              className="border-2 border-white shadow"
                            />
                          </Badge>
                        }
                        title={
                          <div className="font-semibold text-gray-800 line-clamp-1">
                            {conv.partner_name}
                          </div>
                        }
                        description={
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              {conv.partner_code} • {conv.class_name}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-1">
                              {conv.last_message || "Chưa có tin nhắn"}
                            </div>
                            {conv.last_message_time && (
                              <div className="text-xs text-gray-400 mt-1">
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
              borderRadius: 12,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={selectedConversation.partner_avatar}
                        icon={<UserOutlined />}
                        size={50}
                        className="border-2 border-blue-500"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {selectedConversation.partner_name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <span>{selectedConversation.partner_code}</span>
                          <span>•</span>
                          <span>{selectedConversation.class_name}</span>
                        </p>
                      </div>
                    </div>
                    <Search
                      placeholder="Tìm kiếm tin nhắn..."
                      onSearch={handleSearchMessages}
                      style={{ width: 280 }}
                      enterButton={<SearchOutlined />}
                      allowClear
                      onClear={handleClearSearch}
                    />
                  </div>
                  {isSearching && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center justify-between">
                      <span>
                        🔍 Tìm thấy <strong>{messages.length}</strong> kết quả
                        cho "<strong>{searchKeyword}</strong>"
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
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                  {loading ? (
                    <div className="flex items-center justify-center h-90">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                        <p className="text-gray-500">Đang tải tin nhắn...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-90">
                      <Empty
                        description={
                          <span className="text-gray-500">
                            {isSearching
                              ? "Không tìm thấy tin nhắn phù hợp"
                              : "Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!"}
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
                      placeholder="Nhập tin nhắn của bạn..."
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
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Chào mừng đến với Chat
                  </h3>
                  <p className="text-gray-500">
                    Chọn một sinh viên từ danh sách để bắt đầu trò chuyện
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
