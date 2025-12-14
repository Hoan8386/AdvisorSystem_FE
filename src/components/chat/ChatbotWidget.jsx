import { useState, useRef, useEffect } from "react";
import {
  SendOutlined,
  UserOutlined,
  LoadingOutlined,
  CloseOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
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
  const [registering, setRegistering] = useState(null); // Track role_id đang đăng ký
  const [registered, setRegistered] = useState(new Set()); // Track role_id đã đăng ký
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
        botMessage.content = data.data.response;
        botMessage.searchType = "general";
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
          id: Date.now() + Math.random(),
          type: "bot",
          content: `✅ Đăng ký thành công hoạt động "${activityTitle}" với vai trò "${roleName}"!`,
          timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSuccess: true,
        };
        setMessages((prev) => [...prev, successMessage]);
        setRegistered((prev) => new Set([...prev, activityRoleId]));
      } else {
        // Trường hợp API trả về success: false với message cụ thể
        const errorMessage = {
          id: Date.now() + Math.random(),
          type: "bot",
          content: ` ${
            response?.message || "Đăng ký thất bại. Vui lòng thử lại."
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
      // Ưu tiên message từ response data, sau đó từ error message
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đăng ký. Vui lòng thử lại.";

      const errorMessage = {
        id: Date.now() + Math.random(),
        type: "bot",
        content: `❌ ${errorMsg}`,
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

  // ... (Giữ nguyên các variants animation)
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
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Style Markdown giữ nguyên */}
      <style>{`
        .markdown-content { line-height: 1.7; }
        .markdown-content ul { padding-left: 1.5em; margin: 0.5em 0; }
        .markdown-content li { margin: 0.25em 0; }
        .markdown-content strong { color: #111827; font-weight: 600; }
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
            {/* Header giữ nguyên */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-5 overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 backdrop-blur-sm" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                    <img
                      src="/logo/logo_1.jpg"
                      alt="HUIT Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg">Trợ lý HUIT 🤖</h3>
                    <p className="text-sm opacity-90">Sẵn sàng hỗ trợ bạn</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearConversation}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <PlusOutlined
                      className="text-white"
                      style={{ color: "white" }}
                    />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <CloseOutlined
                      className="text-white"
                      style={{ color: "white" }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
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
                      {/* Avatar Logic */}
                      <div
                        className={`flex-shrink-0 ${
                          msg.type === "user"
                            ? "w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
                            : "w-10 h-10 bg-white border border-blue-500 rounded-full overflow-hidden"
                        }`}
                      >
                        {msg.type === "user" ? (
                          <UserOutlined
                            className="text-white"
                            style={{ color: "white" }}
                          />
                        ) : (
                          <img
                            src="/logo/logo_1.jpg"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div
                        className={`flex flex-col ${
                          msg.type === "user" ? "items-end" : "items-start"
                        } max-w-[85%]`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            msg.type === "user"
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : msg.isError
                              ? "bg-red-50 border border-red-200 text-red-700 rounded-tl-none"
                              : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                          }`}
                        >
                          {msg.type === "bot" && !msg.isError ? (
                            <div className="markdown-content text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-xs text-gray-400 mt-1 px-1">
                          {msg.timestamp}
                        </span>

                        {/* ============================================== */}
                        {/* PHẦN HIỂN THỊ DANH SÁCH HOẠT ĐỘNG VÀ VAI TRÒ */}
                        {/* ============================================== */}
                        {msg.activities && msg.activities.length > 0 && (
                          <div className="mt-4 w-full space-y-4">
                            {msg.activities.map((activity) => (
                              <div
                                key={activity.activity_id}
                                className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                              >
                                {/* Header Hoạt động */}
                                <div className="bg-blue-50/50 p-3 border-b border-blue-100">
                                  <div className="flex justify-between items-start gap-2 mb-2">
                                    <h4 className="font-bold text-blue-900 text-sm leading-tight">
                                      {activity.title}
                                    </h4>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                                        activity.status === "upcoming"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-orange-100 text-orange-700"
                                      }`}
                                    >
                                      {activity.status === "upcoming"
                                        ? "SẮP DIỄN RA"
                                        : "ĐANG DIỄN RA"}
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                      <CalendarOutlined className="text-blue-400" />
                                      <span>
                                        {new Date(
                                          activity.start_time
                                        ).toLocaleDateString("vi-VN")}{" "}
                                        -{" "}
                                        {new Date(
                                          activity.end_time
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <EnvironmentOutlined className="text-red-400" />
                                      <span className="line-clamp-1">
                                        {activity.location}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <TeamOutlined className="text-purple-400" />
                                      <span className="line-clamp-1">
                                        {activity.organizer_unit.unit_name}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Danh sách Vai trò (Roles) - Đã sửa để map tất cả vai trò */}
                                <div className="p-3 bg-gray-50/30 space-y-3">
                                  {activity.roles &&
                                  activity.roles.length > 0 ? (
                                    activity.roles.map((role) => (
                                      <div
                                        key={role.activity_role_id}
                                        className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div>
                                            <p className="font-bold text-gray-800 text-xs flex items-center gap-1">
                                              <UserOutlined
                                                className="text-blue-500"
                                                style={{ color: "white" }}
                                              />
                                              {role.role_name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                                              {role.description}
                                            </p>
                                          </div>
                                          <div className="flex flex-col items-end">
                                            <span
                                              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                                role.point_type === "ren_luyen"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : "bg-orange-100 text-orange-700"
                                              }`}
                                            >
                                              +{role.points_awarded}đ
                                            </span>
                                            {role.max_slots && (
                                              <span className="text-[10px] text-gray-400 mt-0.5">
                                                {role.max_slots} slot
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <button
                                          onClick={() =>
                                            handleRegisterActivity(
                                              role.activity_role_id,
                                              activity.title,
                                              role.role_name
                                            )
                                          }
                                          disabled={
                                            registering ===
                                              role.activity_role_id ||
                                            registered.has(
                                              role.activity_role_id
                                            )
                                          }
                                          className={`w-full py-1.5 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                            registered.has(
                                              role.activity_role_id
                                            )
                                              ? "bg-green-100 text-green-700 cursor-default"
                                              : registering ===
                                                role.activity_role_id
                                              ? "bg-gray-100 text-gray-500 cursor-wait"
                                              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow"
                                          }`}
                                        >
                                          {registered.has(
                                            role.activity_role_id
                                          ) ? (
                                            <>
                                              <CheckCircleOutlined /> Đã đăng ký
                                            </>
                                          ) : registering ===
                                            role.activity_role_id ? (
                                            <>
                                              <LoadingOutlined className="animate-spin" />{" "}
                                              Đang xử lý
                                            </>
                                          ) : (
                                            "Đăng ký ngay"
                                          )}
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-400 italic text-center">
                                      Chưa có thông tin vai trò
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* ============================================== */}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading Indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 bg-white border border-blue-500 rounded-full flex items-center justify-center">
                      <img
                        src="/logo/logo_1.jpg"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-md flex items-center gap-2">
                      <LoadingOutlined className="text-blue-600" />{" "}
                      <span className="text-sm text-gray-500">
                        Đang trả lời...
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white px-5 py-4">
              <div className="flex gap-3 items-end">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={loading}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-gray-50 text-sm"
                  style={{ maxHeight: "120px" }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading || !inputValue.trim()}
                  className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? <LoadingOutlined /> : <SendOutlined />}
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
