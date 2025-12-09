import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import "./index.css";
import App from "./App.jsx";
import { AuthWrapper } from "./components/context/auth.context.jsx";
import { ToastContainer } from "react-toastify";
import ChatbotWidget from "./components/chat/ChatbotWidget.jsx";
import "./utils/echo"; // Import Echo để khởi tạo WebSocket

createRoot(document.getElementById("root")).render(
  <ConfigProvider>
    <AuthWrapper>
      <ToastContainer />
      <App />
      <ChatbotWidget />
    </AuthWrapper>
  </ConfigProvider>
);
