import { useState, useRef, useEffect } from "react";
import {
  SendOutlined,
  UserOutlined,
  LoadingOutlined,
  CloseOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { registerActivityAPI } from "../../services/api.service";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [registering, setRegistering] = useState(null); // Track which activity is registering
  const [registered, setRegistered] = useState(new Set()); // Track registered activities
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const accessToken = localStorage.getItem("access_token");

    // Kiểm tra nếu chưa đăng nhập
    if (!accessToken) {
      const loginMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "Bạn cần đăng nhập để sử dụng tính năng chat. Vui lòng đăng nhập và thử lại! 🔐",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: false,
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
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3636/documents/vector/chat/process-query",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            query: inputValue,
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

      let botMessage = {
        id: Date.now() + 1,
        type: "bot",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data: data,
      };

      if (data.status === "success" && data.data) {
        // Xử lý response từ source "general"
        botMessage.content = data.data.response;
        botMessage.searchType = "general";
        // Store activities if available
        if (data.data.activities) {
          botMessage.activities = data.data.activities;
        }
      } else {
        botMessage.content = data.error || "Xin lỗi, đã có lỗi xảy ra.";
        botMessage.isError = true;
      }

      setMessages((prev) => [...prev, botMessage]);

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setThreadId(null);
    setInputValue("");
  };

  const handleRegisterActivity = async (activityRoleId, activityTitle) => {
    try {
      setRegistering(activityRoleId);
      const response = await registerActivityAPI(activityRoleId);

      if (response?.success) {
        // Add success message
        const successMessage = {
          id: Date.now() + Math.random(),
          type: "bot",
          content: `✅ Đăng ký hoạt động "${activityTitle}" thành công! Bạn sẽ nhận được thông báo cập nhật sớm.`,
          timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSuccess: true,
        };
        setMessages((prev) => [...prev, successMessage]);

        // Track registered activity
        setRegistered((prev) => new Set([...prev, activityRoleId]));
      } else {
        // Add error message
        const errorMessage = {
          id: Date.now() + Math.random(),
          type: "bot",
          content: `❌ Đăng ký thất bại: ${
            response?.message || "Vui lòng thử lại"
          }`,
          timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error registering activity:", error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        type: "bot",
        content: `❌ ${
          error?.response?.data?.message ||
          "Không thể đăng ký hoạt động. Vui lòng thử lại."
        }`,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setRegistering(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
    exit: { opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } },
  };

  const fabVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <style>{`
        .markdown-content {
          line-height: 1.7;
        }
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          color: #1f2937;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .markdown-content h1 { font-size: 1.5em; }
        .markdown-content h2 { font-size: 1.3em; }
        .markdown-content h3 { font-size: 1.1em; }
        .markdown-content p {
          margin: 0.75em 0;
          color: #374151;
        }
        .markdown-content ul,
        .markdown-content ol {
          margin: 0.75em 0;
          padding-left: 1.5em;
          color: #374151;
        }
        .markdown-content li {
          margin: 0.25em 0;
        }
        .markdown-content a {
          color: #1890ff;
          text-decoration: underline;
        }
        .markdown-content a:hover {
          color: #096dd9;
        }
        .markdown-content strong {
          color: #111827;
          font-weight: 600;
        }
        .markdown-content code {
          background-color: #f3f4f6;
          color: #1890ff;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }
        .markdown-content pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }
        .markdown-content pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        .markdown-content blockquote {
          border-left: 4px solid #1890ff;
          background-color: #f0f5ff;
          padding: 0.75em 1em;
          margin: 1em 0;
          color: #374151;
        }
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        .markdown-content th,
        .markdown-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5em;
          text-align: left;
        }
        .markdown-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            key="fab"
            variants={fabVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setIsOpen(true)}
            className="relative w-16 h-16 bg-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center overflow-hidden border-2 border-blue-600"
          >
            <img
              src="/logo/logo_1.jpg"
              alt="HUIT Logo"
              className="w-full h-full object-cover"
            />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
              >
                {unreadCount}
              </motion.div>
            )}
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            key="chat"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-5 overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 backdrop-blur-sm" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full transform -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-y-1/2 -translate-x-1/2" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      <img
                        src="/logo/logo_1.jpg"
                        alt="HUIT Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"
                    />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      Trợ lý HUIT 🤖
                    </h3>
                    <p className="text-sm opacity-90">
                      Luôn sẵn sàng hỗ trợ bạn
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearConversation}
                    className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title="Tạo đoạn hội thoại mới"
                  >
                    <PlusOutlined className="text-white text-lg" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:rotate-90"
                  >
                    <CloseOutlined className="text-white text-lg" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden border-2 border-blue-500">
                    <img
                      src="/logo/logo_1.jpg"
                      alt="HUIT Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    Xin chào! 👋
                  </h4>
                  <p className="text-gray-500 max-w-xs">
                    Tôi là trợ lý AI của HUIT. Hãy đặt câu hỏi về trường và tôi
                    sẽ giúp bạn!
                  </p>
                </motion.div>
              )}

              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                      className={`flex gap-3 ${
                        msg.type === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 ${
                          msg.type === "user"
                            ? "w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
                            : "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500 overflow-hidden"
                        }`}
                      >
                        {msg.type === "user" ? (
                          <UserOutlined className="text-white text-lg" />
                        ) : (
                          <img
                            src="/logo/logo_1.jpg"
                            alt="HUIT Logo"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div
                        className={`flex flex-col ${
                          msg.type === "user" ? "items-end" : "items-start"
                        } max-w-[75%]`}
                      >
                        <div
                          className={`rounded-2xl px-5 py-3 shadow-md ${
                            msg.type === "user"
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none"
                              : msg.isError
                              ? "bg-red-50 border-2 border-red-200 text-red-700 rounded-tl-none"
                              : "bg-white border-2 border-gray-100 text-gray-800 rounded-tl-none"
                          }`}
                        >
                          {msg.type === "bot" && !msg.isError ? (
                            <div className="markdown-content text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 px-1">
                          <span className="text-xs text-gray-400">
                            {msg.timestamp}
                          </span>
                          {msg.searchType && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                              💬{" "}
                              {msg.searchType === "general"
                                ? "Trợ lý"
                                : "Thông tin"}
                            </span>
                          )}
                        </div>

                        {/* Display Activities */}
                        {msg.activities && msg.activities.length > 0 && (
                          <div className="mt-4 w-full space-y-3">
                            {msg.activities.map((activity) => (
                              <div
                                key={activity.activity_id}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-blue-900 text-sm">
                                    📌 {activity.title}
                                  </h4>
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                    {activity.status === "upcoming"
                                      ? "Sắp diễn ra"
                                      : "Đang diễn ra"}
                                  </span>
                                </div>

                                <div className="space-y-2 mb-3 text-xs text-gray-700">
                                  <p>
                                    <span className="font-semibold text-gray-900">
                                      📅 Thời gian:
                                    </span>{" "}
                                    {new Date(
                                      activity.start_time
                                    ).toLocaleDateString("vi-VN")}{" "}
                                    -{" "}
                                    {new Date(
                                      activity.end_time
                                    ).toLocaleDateString("vi-VN")}
                                  </p>
                                  <p>
                                    <span className="font-semibold text-gray-900">
                                      📍 Địa điểm:
                                    </span>{" "}
                                    {activity.location}
                                  </p>
                                  <p>
                                    <span className="font-semibold text-gray-900">
                                      🎓 Khoa:
                                    </span>{" "}
                                    {activity.organizer_unit.unit_name}
                                  </p>
                                  {activity.roles.length > 0 && (
                                    <p>
                                      <span className="font-semibold text-gray-900">
                                        ⭐ Điểm CTXH:
                                      </span>{" "}
                                      {activity.roles[0].points_awarded} điểm
                                      {activity.roles[0].max_slots && (
                                        <span className="ml-2 text-orange-600 font-semibold">
                                          ({activity.roles[0].max_slots} chỗ)
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => {
                                    const roleId =
                                      activity.roles[0]?.activity_role_id;
                                    if (roleId) {
                                      handleRegisterActivity(
                                        roleId,
                                        activity.title
                                      );
                                    }
                                  }}
                                  disabled={
                                    registering ===
                                      activity.roles[0]?.activity_role_id ||
                                    registered.has(
                                      activity.roles[0]?.activity_role_id
                                    )
                                  }
                                  className={`w-full font-semibold py-2 px-4 rounded-lg transition-all text-xs flex items-center justify-center gap-2 ${
                                    registered.has(
                                      activity.roles[0]?.activity_role_id
                                    )
                                      ? "bg-green-500 hover:bg-green-600 text-white cursor-not-allowed"
                                      : registering ===
                                        activity.roles[0]?.activity_role_id
                                      ? "bg-blue-500 text-white cursor-wait"
                                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg"
                                  }`}
                                >
                                  {registered.has(
                                    activity.roles[0]?.activity_role_id
                                  ) ? (
                                    <>
                                      <CheckCircleOutlined className="text-lg" />
                                      Đã đăng ký
                                    </>
                                  ) : registering ===
                                    activity.roles[0]?.activity_role_id ? (
                                    <>
                                      <LoadingOutlined className="text-lg animate-spin" />
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    <>✍️ Đăng ký tham gia</>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500 overflow-hidden">
                      <img
                        src="/logo/logo_1.jpg"
                        alt="HUIT Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-white border-2 border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-md">
                      <div className="flex items-center gap-3">
                        <LoadingOutlined className="text-blue-600 text-xl" />
                        <span className="text-sm text-gray-600 font-medium">
                          Đang suy nghĩ...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t-2 border-gray-100 bg-white px-5 py-4">
              <div className="flex gap-3 items-end">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={loading}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                  style={{ maxHeight: "120px" }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading || !inputValue.trim()}
                  className="text-white w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingOutlined className="text-white text-xl" />
                  ) : (
                    <SendOutlined className="text-white text-xl" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;
