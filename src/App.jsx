import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useContext } from "react";
import { AuthContext } from "./components/context/auth.context";
import LayoutApp from "./components/share/Layout.app";
import { Spin } from "antd";
import ProtectedRoute from "./share/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import AdvisorDashboard from "./pages/admin/dashboard/AdvisorDashboard";
import AdvisorHome from "./pages/admin/home/AdvisorHome";
import AdvisorNotifications from "./pages/admin/notifications/AdvisorNotifications";
import AdvisorProfile from "./pages/admin/profile/AdvisorProfile";
import CreateEditNotification from "./pages/admin/notifications/CreateEditNotification";
import NotificationResponses from "./pages/admin/notifications/NotificationResponses";
import AdvisorActivities from "./pages/admin/activities/AdvisorActivities";
import CreateEditActivity from "./pages/admin/activities/CreateEditActivity";
import ActivityDetail from "./pages/admin/activities/ActivityDetail";
import ActivityRegistrations from "./pages/admin/activities/ActivityRegistrations";
import StudentPage from "./pages/Student.Notification.Page";
import StudentProfile from "./pages/StudentProfile";
import StudentDashboard from "./pages/client/StudentDashboard";
import StudentActivities from "./pages/client/activities/StudentActivities";
import StudentActivityDetail from "./pages/client/activities/StudentActivityDetail";
import MyRegistrations from "./pages/client/activities/MyRegistrations";
import MyCancellationRequests from "./pages/client/activities/MyCancellationRequests";

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
      path: "/admin",
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
        { path: "profile", element: <AdvisorProfile /> },
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

  return <RouterProvider router={router} />;
}

export default App;
