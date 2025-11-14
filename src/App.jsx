import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useContext } from "react";
import { AuthContext } from "./components/context/auth.context";
import LayoutApp from "./components/share/Layout.app";
import { Spin } from "antd";
import ProtectedRoute from "./share/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import AdvisorDashboard from "./pages/advisor/dashboard/AdvisorDashboard";
import AdvisorHome from "./pages/advisor/home/AdvisorHome";
import AdvisorNotifications from "./pages/advisor/notifications/AdvisorNotifications";
import AdvisorProfile from "./pages/advisor/profile/AdvisorProfile";
import CreateEditNotification from "./pages/advisor/notifications/CreateEditNotification";
import NotificationResponses from "./pages/advisor/notifications/NotificationResponses";
import AdvisorActivities from "./pages/advisor/activities/AdvisorActivities";
import CreateEditActivity from "./pages/advisor/activities/CreateEditActivity";
import ActivityDetail from "./pages/advisor/activities/ActivityDetail";
import ActivityRegistrations from "./pages/advisor/activities/ActivityRegistrations";
import AssignStudents from "./pages/advisor/activities/AssignStudents";
import AdvisorClasses from "./pages/advisor/classes/AdvisorClasses";
import { ClassDetail } from "./pages/advisor/classes/ClassDetail";
import StudentPage from "./pages/Student.Notification.Page";
import StudentProfile from "./pages/StudentProfile";
import StudentDashboard from "./pages/client/StudentDashboard";
import StudentActivities from "./pages/client/activities/StudentActivities";
import StudentActivityDetail from "./pages/client/activities/StudentActivityDetail";
import MyRegistrations from "./pages/client/activities/MyRegistrations";
import MyCancellationRequests from "./pages/client/activities/MyCancellationRequests";
import StudentPoints from "./pages/client/points/StudentPoints";
import MySemesterReport from "./pages/client/academic/MySemesterReport";
import MyWarnings from "./pages/client/academic/MyWarnings";
import RAGMain from "./pages/advisor/rag/RAGMain";
import RAGDocumentManagement from "./pages/advisor/rag/RAGDocumentManagement";
import RAGChatAssistant from "./pages/advisor/rag/RAGChatAssistant";
import ChatbotWidget from "./components/chat/ChatbotWidget";

const LayoutClient = () => {
  const { isAppLoading } = useContext(AuthContext);
  isAppLoading;
  return (
    <>
      {isAppLoading === true ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50% , -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <div className="w-[1170px]  mx-auto">
            <Header />
            <Outlet />

            <Footer />
          </div>
        </>
      )}
    </>
  );
};

const LayoutAdmin = () => {
  const { isAppLoading } = useContext(AuthContext);
  return (
    <>
      {isAppLoading === true ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50% , -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <Outlet />
        </>
      )}
    </>
  );
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>
      ),
      //errorElement: <ErrorPage />,
      children: [{ index: true, element: <HomePage /> }],
    },

    // { path: "/thanks", element: <ThanksPage /> },

    // // Auth Pages
    { path: "/login", element: <LoginPage /> },
    // { path: "/register", element: <RegisterPage /> },
    // { path: "/forgot", element: <ForgotPassword /> },

    // ========== ADVISOR ROUTES ==========
    {
      path: "/advisor",
      element: (
        <LayoutApp>
          <ProtectedRoute allowedRoles={["advisor"]}>
            <LayoutAdmin />
          </ProtectedRoute>
        </LayoutApp>
      ),
      children: [
        { index: true, element: <AdvisorHome /> },
        { path: "notifications", element: <AdvisorNotifications /> },
        { path: "notifications/create", element: <CreateEditNotification /> },
        { path: "notifications/:id/edit", element: <CreateEditNotification /> },
        {
          path: "notifications/:notificationId/responses",
          element: <NotificationResponses />,
        },
        { path: "activities", element: <AdvisorActivities /> },
        { path: "activities/create", element: <CreateEditActivity /> },
        { path: "activities/:id", element: <ActivityDetail /> },
        { path: "activities/:id/edit", element: <CreateEditActivity /> },
        {
          path: "activities/:id/registrations",
          element: <ActivityRegistrations />,
        },
        {
          path: "activities/:id/assign-students",
          element: <AssignStudents />,
        },
        { path: "classes", element: <AdvisorClasses /> },
        { path: "classes/:classId", element: <ClassDetail /> },
        { path: "profile", element: <AdvisorProfile /> },
        { path: "rag", element: <RAGMain /> },
        { path: "rag/documents", element: <RAGDocumentManagement /> },
        { path: "rag/chat", element: <RAGChatAssistant /> },
      ],
    },

    // ========== STUDENT ROUTES ==========
    {
      path: "/student",
      element: (
        <LayoutApp>
          <ProtectedRoute allowedRoles={["student"]}>
            <LayoutAdmin />
          </ProtectedRoute>
        </LayoutApp>
      ),
      children: [
        { index: true, element: <StudentPage /> },
        { path: "profile", element: <StudentProfile /> },
        { path: "points", element: <StudentPoints /> },
        { path: "semester-report", element: <MySemesterReport /> },
        { path: "warnings", element: <MyWarnings /> },
        { path: "activities", element: <StudentActivities /> },
        { path: "activities/:id", element: <StudentActivityDetail /> },
        { path: "activities/my-registrations", element: <MyRegistrations /> },
        {
          path: "activities/my-cancellation-requests",
          element: <MyCancellationRequests />,
        },
      ],
    },
    // { path: "/unauthorized", element: <Unauthorized /> },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
