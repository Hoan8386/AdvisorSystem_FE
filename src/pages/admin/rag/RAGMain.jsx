import { useState } from "react";
import { Tabs, Card } from "antd";
import { FileTextOutlined, MessageOutlined } from "@ant-design/icons";
import RAGDocumentManagement from "./RAGDocumentManagement";
import RAGChatAssistant from "./RAGChatAssistant";
import { AdvisorLayout } from "../../../components/layout/AdvisorLayout";

const RAGMain = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const tabItems = [
    {
      key: "chat",
      label: (
        <span>
          <MessageOutlined />
          Trợ lý AI
        </span>
      ),
      children: <RAGChatAssistant />,
    },
    {
      key: "documents",
      label: (
        <span>
          <FileTextOutlined />
          Quản lý tài liệu
        </span>
      ),
      children: <RAGDocumentManagement />,
    },
  ];

  return (
    <AdvisorLayout>
      <div className="h-full">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          className="h-full"
          tabBarStyle={{
            paddingLeft: "24px",
            paddingRight: "24px",
            marginBottom: 0,
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        />
      </div>
    </AdvisorLayout>
  );
};

export default RAGMain;
