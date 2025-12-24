import { useState, useRef, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Space,
  Spin,
  Empty,
  Tag,
  Divider,
  Avatar,
  List,
  Alert,
  Badge,
  Segmented,
  Slider,
  Tooltip,
} from "antd";
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  SearchOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  MessageOutlined,
  ClearOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { registerActivityAPI } from "../../../services/api.service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./RAGStyles.css";

const { TextArea } = Input;

const RAGChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [registering, setRegistering] = useState(null);
  const [registered, setRegistered] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [searchMode, setSearchMode] = useState("auto"); // auto, rag, database
  const [kValue, setKValue] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Xin chào! Tôi là trợ lý AI của HUIT. Tôi có thể giúp bạn:\n\n" +
          "🔍 Tìm kiếm thông tin trong tài liệu\n" +
          "🛒 Tìm sản phẩm trong cơ sở dữ liệu\n" +
          "💬 Trả lời các câu hỏi chung\n\n" +
          "Hãy hỏi tôi bất cứ điều gì!",
        type: "direct",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      const loginMessage = {
        role: "assistant",
        content:
          "Bạn cần đăng nhập để sử dụng tính năng chat. Vui lòng đăng nhập và thử lại! 🔐",
        type: "error",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, loginMessage]);
      setInputValue("");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue;
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_CHATBOT}documents/vector/chat/process-query`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            query: query,
            thread_id: threadId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.thread_id) {
        setThreadId(data.thread_id);
      }

      let assistantMessage = {
        role: "assistant",
        timestamp: new Date(),
        data: data,
      };

      if (data.status === "success" && data.data) {
        assistantMessage.content = data.data.response;
        assistantMessage.type = "general";
        if (data.data.activities) {
          assistantMessage.activities = data.data.activities;
        }
      } else {
        assistantMessage.content = data.error || "Xin lỗi, đã có lỗi xảy ra.";
        assistantMessage.type = "error";
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "❌ Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.",
        type: "error",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "💬 Cuộc hội thoại đã được xóa. Hãy bắt đầu câu hỏi mới!",
        type: "direct",
        timestamp: new Date(),
      },
    ]);
    setThreadId(null);
    setRegistered(new Set());
  };

  const handleRegisterActivity = async (
    activityRoleId,
    activityTitle,
    roleName
  ) => {
    try {
      setRegistering(activityRoleId);
      const response = await registerActivityAPI(activityRoleId);

      if (response?.success) {
        const successMessage = {
          role: "assistant",
          content: `✅ Đăng ký thành công hoạt động "${activityTitle}" với vai trò "${roleName}"!`,
          type: "success",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        setRegistered((prev) => new Set([...prev, activityRoleId]));
      } else {
        const errorMessage = {
          role: "assistant",
          content: `❌ ${
            response?.message || "Đăng ký thất bại. Vui lòng thử lại."
          }`,
          type: "error",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error registering activity:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đăng ký. Vui lòng thử lại.";

      const errorMessage = {
        role: "assistant",
        content: `❌ ${errorMsg}`,
        type: "error",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setRegistering(null);
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === "user";

    return (
      <div
        key={index}
        className={`flex ${
          isUser ? "justify-end" : "justify-start"
        } mb-4 animate-fade-in`}
      >
        <div
          className={`flex ${
            isUser ? "flex-row-reverse" : "flex-row"
          } max-w-[80%] gap-3`}
        >
          {/* Avatar */}
          <Avatar
            size={40}
            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
            style={{
              backgroundColor: isUser ? "#1890ff" : "#52c41a",
              flexShrink: 0,
            }}
          />

          {/* Message Content */}
          <div
            className={`rounded-2xl px-4 py-3 shadow-md ${
              isUser
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : message.type === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Message Type Badge */}
            {!isUser && message.type && message.type !== "direct" && (
              <div className="mb-2">
                {message.type === "database" && (
                  <Tag icon={<ShoppingOutlined />} color="blue">
                    Tìm kiếm Database
                  </Tag>
                )}
                {message.type === "rag" && (
                  <Tag icon={<FileTextOutlined />} color="green">
                    Tìm kiếm Tài liệu
                  </Tag>
                )}
                {message.type === "error" && <Tag color="error">Lỗi</Tag>}
              </div>
            )}

            {/* Text Content */}
            <div
              className={`prose prose-sm max-w-none ${
                isUser ? "text-white" : ""
              }`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Product List (for database search) */}
            {message.type === "database" &&
              message.products &&
              message.products.length > 0 && (
                <div className="mt-3">
                  <Divider className="my-2">Sản phẩm tìm thấy</Divider>
                  <List
                    dataSource={message.products}
                    renderItem={(product) => (
                      <Card
                        size="small"
                        className="mb-2 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          {product.product_image_url && (
                            <img
                              src={product.product_image_url}
                              alt={product.product_name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-base">
                              {product.product_name}
                            </div>
                            <Space wrap className="text-sm text-gray-600">
                              <span>Size: {product.size_name}</span>
                              <Divider type="vertical" />
                              <span>Đế: {product.crust_name}</span>
                            </Space>
                            <div className="mt-1">
                              <Space>
                                <span className="text-lg font-bold text-red-600">
                                  {product.price?.toLocaleString("vi-VN")}đ
                                </span>
                                <Badge
                                  count={`Còn ${product.stock}`}
                                  style={{
                                    backgroundColor:
                                      product.stock > 0 ? "#52c41a" : "#ff4d4f",
                                  }}
                                />
                              </Space>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  />
                </div>
              )}

            {/* Activities List */}
            {!isUser && message.activities && message.activities.length > 0 && (
              <div className="mt-4 w-full space-y-4">
                {message.activities.map((activity) => (
                  <Card
                    key={activity.activity_id}
                    size="small"
                    className="border-blue-200 hover:shadow-lg transition-all duration-300"
                    style={{ borderRadius: 12 }}
                  >
                    {/* Activity Header */}
                    <div className="mb-3">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-bold text-blue-900 text-base">
                          {activity.title}
                        </h4>
                        <Tag
                          color={
                            activity.status === "upcoming"
                              ? "success"
                              : "warning"
                          }
                        >
                          {activity.status === "upcoming"
                            ? "SẮP DIỄN RA"
                            : "ĐANG DIỄN RA"}
                        </Tag>
                      </div>

                      <Space
                        direction="vertical"
                        size="small"
                        className="w-full"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarOutlined className="text-blue-500" />
                          <span>
                            {new Date(activity.start_time).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            -{" "}
                            {new Date(activity.end_time).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <EnvironmentOutlined className="text-red-500" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TeamOutlined className="text-purple-500" />
                          <span>{activity.organizer_unit.unit_name}</span>
                        </div>
                      </Space>
                    </div>

                    {/* Roles List */}
                    {activity.roles && activity.roles.length > 0 && (
                      <div className="space-y-2">
                        <Divider className="my-2">Vai trò</Divider>
                        {activity.roles.map((role) => (
                          <Card
                            key={role.activity_role_id}
                            size="small"
                            className="bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <UserOutlined className="text-blue-500" />
                                  <span className="font-bold text-gray-800">
                                    {role.role_name}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {role.description}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <Tag
                                  color={
                                    role.point_type === "ren_luyen"
                                      ? "blue"
                                      : "orange"
                                  }
                                  className="font-bold"
                                >
                                  <TrophyOutlined /> +{role.points_awarded}đ
                                </Tag>
                                {role.max_slots && (
                                  <span className="text-xs text-gray-400 mt-1">
                                    {role.max_slots} slot
                                  </span>
                                )}
                              </div>
                            </div>

                            <Button
                              type="primary"
                              size="small"
                              block
                              loading={registering === role.activity_role_id}
                              disabled={registered.has(role.activity_role_id)}
                              icon={
                                registered.has(role.activity_role_id) ? (
                                  <CheckCircleOutlined />
                                ) : null
                              }
                              onClick={() =>
                                handleRegisterActivity(
                                  role.activity_role_id,
                                  activity.title,
                                  role.role_name
                                )
                              }
                            >
                              {registered.has(role.activity_role_id)
                                ? "Đã đăng ký"
                                : "Đăng ký"}
                            </Button>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div
              className={`text-xs mt-2 ${
                isUser ? "text-blue-100" : "text-gray-400"
              }`}
            >
              {message.timestamp.toLocaleTimeString("vi-VN")}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6">
      <Card
        className="flex-1 flex flex-col shadow-2xl"
        title={
          <div className="flex items-center justify-between">
            <Space>
              <RobotOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Trợ lý AI HUIT
              </span>
              {threadId && <Badge status="processing" text="Đang kết nối" />}
            </Space>
            <Space>
              <Tooltip title="Cài đặt">
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setShowSettings(!showSettings)}
                />
              </Tooltip>
              <Tooltip title="Xóa hội thoại">
                <Button
                  icon={<ClearOutlined />}
                  danger
                  onClick={handleClearChat}
                />
              </Tooltip>
            </Space>
          </div>
        }
      >
        {/* Settings Panel */}
        {showSettings && (
          <Alert
            message="Cài đặt tìm kiếm"
            type="info"
            closable
            onClose={() => setShowSettings(false)}
            className="mb-4"
            description={
              <Space direction="vertical" className="w-full">
                <div>
                  <div className="mb-2 font-semibold">Chế độ tìm kiếm:</div>
                  <Segmented
                    options={[
                      {
                        label: "Tự động",
                        value: "auto",
                        icon: <SearchOutlined />,
                      },
                      {
                        label: "Tài liệu",
                        value: "rag",
                        icon: <FileTextOutlined />,
                      },
                      {
                        label: "Database",
                        value: "database",
                        icon: <ShoppingOutlined />,
                      },
                    ]}
                    value={searchMode}
                    onChange={setSearchMode}
                    block
                  />
                </div>
                <div>
                  <div className="mb-2 font-semibold">
                    Số kết quả (k): {kValue}
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    value={kValue}
                    onChange={setKValue}
                  />
                </div>
                <div>
                  <div className="mb-2 font-semibold">
                    Ngưỡng độ tương đồng: {similarityThreshold}
                  </div>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={similarityThreshold}
                    onChange={setSimilarityThreshold}
                  />
                </div>
              </Space>
            }
          />
        )}

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg"
          style={{ maxHeight: "calc(100vh - 450px)", minHeight: "400px" }}
        >
          {messages.length === 0 ? (
            <Empty description="Chưa có tin nhắn nào" />
          ) : (
            messages.map((msg, idx) => renderMessage(msg, idx))
          )}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex gap-3">
                <Avatar
                  size={40}
                  icon={<RobotOutlined />}
                  style={{ backgroundColor: "#52c41a" }}
                />
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                  <Space>
                    <Spin size="small" />
                    <span className="text-gray-500">Đang suy nghĩ...</span>
                  </Space>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4">
          <Space.Compact style={{ width: "100%" }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              size="large"
              style={{ height: "auto", marginLeft: "20px" }}
            >
              Gửi
            </Button>
          </Space.Compact>
          <div className="text-xs text-gray-400 mt-2">
            💡 Nhấn Enter để gửi, Shift+Enter để xuống dòng
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RAGChatAssistant;
