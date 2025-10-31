import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import "./index.css";
import App from "./App.jsx";
import { AuthWrapper } from "./components/context/auth.context.jsx";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider>
      <AuthWrapper>
        <ToastContainer />
        <App />
      </AuthWrapper>
    </ConfigProvider>
  </StrictMode>
);
