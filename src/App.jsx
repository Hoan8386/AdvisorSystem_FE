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
import ActivityStatistics from "./pages/advisor/activities/ActivityStatistics";
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
import AdvisorChat from "./pages/advisor/chat/AdvisorChat";
import { StudentChat } from "./pages/client/chat/StudentChat";
import { StudentMeetings } from "./pages/client/meetings/StudentMeetings";
import { StudentMeetingDetail } from "./pages/client/meetings/StudentMeetingDetail";
import ChatbotWidget from "./components/chat/ChatbotWidget";
// Admin imports
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminClasses } from "./pages/admin/classes/AdminClasses";
import { AdminClassStudents } from "./pages/admin/classes/AdminClassStudents";
import { AdminSemesters } from "./pages/admin/semesters/AdminSemesters";
import { AdminSemesterReports } from "./pages/admin/semesters/AdminSemesterReports";
import { AdminAdvisors } from "./pages/admin/advisors/AdminAdvisors";
import { AdminAdvisorClasses } from "./pages/admin/advisors/AdminAdvisorClasses";
import { AdminCourses } from "./pages/admin/courses/AdminCourses";
import { AdminGrades } from "./pages/admin/grades/AdminGrades";
import { AdminSchedules } from "./pages/admin/schedules/AdminSchedules";
import AdvisorMeetings from "./pages/advisor/meetings/AdvisorMeetings";
import CreateEditMeeting from "./pages/advisor/meetings/CreateEditMeeting";
import MeetingDetail from "./pages/advisor/meetings/MeetingDetail";
import MeetingAttendance from "./pages/advisor/meetings/MeetingAttendance";
import MeetingStatistics from "./pages/advisor/meetings/MeetingStatistics";
import AdminMeetings from "./pages/admin/AdminMeetings";
import AdvisorPointFeedbacks from "./pages/advisor/points/AdvisorPointFeedbacks";
import RespondPointFeedback from "./pages/advisor/points/RespondPointFeedback";
import StudentPointFeedbacks from "./pages/client/points/StudentPointFeedbacks";
import CreateEditPointFeedback from "./pages/client/points/CreateEditPointFeedback";
import StudentMonitoringNotes from "./pages/client/notes/StudentMonitoringNotes";
import AdvisorMonitoringNotes from "./pages/advisor/notes/AdvisorMonitoringNotes";
import CreateEditMonitoringNote from "./pages/advisor/notes/CreateEditMonitoringNote";

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
          path: "activities/:id/statistics",
          element: <ActivityStatistics />,
        },
        {
          path: "activities/:id/assign-students",
          element: <AssignStudents />,
        },
        { path: "classes", element: <AdvisorClasses /> },
        { path: "classes/:classId", element: <ClassDetail /> },
        { path: "meetings", element: <AdvisorMeetings /> },
        { path: "meetings/create", element: <CreateEditMeeting /> },
        { path: "meetings/statistics", element: <MeetingStatistics /> },
        { path: "meetings/:id", element: <MeetingDetail /> },
        { path: "meetings/:id/edit", element: <CreateEditMeeting /> },
        { path: "meetings/:id/attendance", element: <MeetingAttendance /> },
        { path: "chat", element: <AdvisorChat /> },
        { path: "point-feedbacks", element: <AdvisorPointFeedbacks /> },
        {
          path: "point-feedbacks/:id/respond",
          element: <RespondPointFeedback />,
        },
        { path: "monitoring-notes", element: <AdvisorMonitoringNotes /> },
        {
          path: "monitoring-notes/create",
          element: <CreateEditMonitoringNote />,
        },
        {
          path: "monitoring-notes/:id/edit",
          element: <CreateEditMonitoringNote />,
        },
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
        { path: "chat", element: <StudentChat /> },
        { path: "meetings", element: <StudentMeetings /> },
        { path: "meetings/:id", element: <StudentMeetingDetail /> },
        { path: "points", element: <StudentPoints /> },
        { path: "point-feedbacks", element: <StudentPointFeedbacks /> },
        {
          path: "point-feedbacks/create",
          element: <CreateEditPointFeedback />,
        },
        {
          path: "point-feedbacks/:id/edit",
          element: <CreateEditPointFeedback />,
        },
        { path: "monitoring-notes", element: <StudentMonitoringNotes /> },
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

    // ========== ADMIN ROUTES ==========
    {
      path: "/admin",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "advisors", element: <AdminAdvisors /> },
        {
          path: "advisors/:advisorId/classes",
          element: <AdminAdvisorClasses />,
        },
        { path: "classes", element: <AdminClasses /> },
        { path: "classes/:classId/students", element: <AdminClassStudents /> },
        { path: "semesters", element: <AdminSemesters /> },
        {
          path: "semesters/:semesterId/reports",
          element: <AdminSemesterReports />,
        },
        { path: "courses", element: <AdminCourses /> },
        { path: "grades", element: <AdminGrades /> },
        { path: "schedules", element: <AdminSchedules /> },
        { path: "meetings", element: <AdminMeetings /> },
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
