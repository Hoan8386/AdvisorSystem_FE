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
} from "@ant-design/icons";
import { processQueryAPI } from "../../../services/rag.service";
import ReactMarkdown from "react-markdown";
import "./RAGStyles.css";

const { TextArea } = Input;

const RAGChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
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

    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await processQueryAPI({
        query: inputValue,
        thread_id: threadId,
      });

      const { data, thread_id: newThreadId } = response.data;

      // Save thread ID for conversation context
      if (newThreadId) {
        setThreadId(newThreadId);
      }

      // Parse response based on search type
      let assistantMessage;

      if (data.search_type === "database") {
        // Database search result (products)
        assistantMessage = {
          role: "assistant",
          content: data.natural_response,
          type: "database",
          products: data.product_variants || [],
          timestamp: new Date(),
        };
      } else if (data.search_type === "rag") {
        // RAG search result (documents)
        assistantMessage = {
          role: "assistant",
          content: data.answer,
          type: "rag",
          timestamp: new Date(),
        };
      } else {
        // Direct response (greeting, simple questions)
        assistantMessage = {
          role: "assistant",
          content:
            data.message ||
            data.answer ||
            "Xin lỗi, tôi không hiểu câu hỏi của bạn.",
          type: "direct",
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Query error:", error);

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
              style={{ height: "auto" }}
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
