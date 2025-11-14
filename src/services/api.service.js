
import axios from './axios.customize';

const createUserApi = (userData) => {
  const URL_BACKEND = "/api/users";

  // userData phải chứa: username, password, email, full_name, address, phone
  const data = {
    password: userData.password,
    email: userData.email,
    full_name: userData.full_name,
    address: userData.address,
    phone: userData.phone,
  };

  return axios.post(URL_BACKEND, data);
};


// Login using backend's expected fields: `user_code`, `password`, and `role`
const loginApi = (userCode, password, role) => {
  const URL_BACKEND = "/api/auth/login";
  const data = {
    user_code: userCode,
    password: password,
    role: role,
  };
  return axios.post(URL_BACKEND, data);
};

const getAccountAPI = () => {
    const URL_BACKEND = "/api/auth/me";
    return axios.get(URL_BACKEND);
}


const logoutApi = () => {
    const URL_BACKEND = "/api/auth/logout"
     return axios.post(URL_BACKEND);
}

const updateUserApi = (id, updatedUserData) => {
  const URL_BACKEND = `/api/users/${id}`;
  return axios.put(URL_BACKEND, updatedUserData);
};



const forgotPassword = (email) =>{
    const URL_BACKEND = "/api/password/forgot"
   const data ={
        email:email,
    }
    return axios.post(URL_BACKEND,data);
}

const changePassword = (current_password,new_password,new_password_confirmation)=>{
  const URL_BACKEND = "/api/users/change-password"
   const data ={
        current_password:current_password,
        new_password:new_password,
        new_password_confirmation:new_password_confirmation
    }
    return axios.post(URL_BACKEND,data);
}

// ========== NOTIFICATION APIs ==========

// Get all notifications (for both advisor and student)
const getNotificationsAPI = () => {
  const URL_BACKEND = "/api/notifications";
  return axios.get(URL_BACKEND);
};

// Get a single notification by ID
const getNotificationDetailAPI = (notificationId) => {
  const URL_BACKEND = `/api/notifications/${notificationId}`;
  return axios.get(URL_BACKEND);
};

// Create notification (Advisor only)
const createNotificationAPI = (formData) => {
  const URL_BACKEND = "/api/notifications";
  return axios.post(URL_BACKEND, formData, {
    headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

// Update notification (Advisor only)
const updateNotificationAPI = (notificationId, formData) => {
  const URL_BACKEND = `/api/notifications/${notificationId}`;
  return axios.put(URL_BACKEND, formData, {
    headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

// Delete notification (Advisor only)
const deleteNotificationAPI = (notificationId) => {
  const URL_BACKEND = `/api/notifications/${notificationId}`;
  return axios.delete(URL_BACKEND);
};

// Get notification statistics (Advisor only)
const getNotificationStatisticsAPI = () => {
  const URL_BACKEND = "/api/notifications/notification-statistics";
  return axios.get(URL_BACKEND);
};

// Get responses for a notification (Advisor only)
const getNotificationResponsesAPI = (notificationId) => {
  const URL_BACKEND = `/api/notifications/${notificationId}/responses`;
  return axios.get(URL_BACKEND);
};

// Submit response to notification (Student only)
const submitNotificationResponseAPI = (notificationId, responseData) => {
  const URL_BACKEND = `/api/notifications/${notificationId}/responses`;
  return axios.post(URL_BACKEND, responseData);
};

// Update response to a notification (Advisor only)
const updateNotificationResponseAPI = (responseId, responseData) => {
  const URL_BACKEND = `/api/notification-responses/${responseId}`;
  return axios.put(URL_BACKEND, responseData);
};

// Get unread notifications (Student only)
const getUnreadNotificationsAPI = () => {
  const URL_BACKEND = "/api/student/unread-notifications";
  return axios.get(URL_BACKEND);
};

// Mark all notifications as read (Student only)
const markAllNotificationsReadAPI = () => {
  const URL_BACKEND = "/api/student/mark-all-notifications-read";
  return axios.post(URL_BACKEND);
};

// ============ Activity APIs ============

// Get all activities with filters
const getActivitiesAPI = (params) => {
  const URL_BACKEND = "/api/activities";
  return axios.get(URL_BACKEND, { params });
};

// Get activity detail
const getActivityDetailAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}`;
  return axios.get(URL_BACKEND);
};

// Create new activity (Advisor only)
const createActivityAPI = (activityData) => {
  const URL_BACKEND = "/api/activities";
  return axios.post(URL_BACKEND, activityData);
};

// Update activity (Advisor only)
const updateActivityAPI = (activityId, activityData) => {
  const URL_BACKEND = `/api/activities/${activityId}`;
  return axios.put(URL_BACKEND, activityData);
};

// Delete activity (Advisor only)
const deleteActivityAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}`;
  return axios.delete(URL_BACKEND);
};

// Get activity registrations (Advisor only)
const getActivityRegistrationsAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}/registrations`;
  return axios.get(URL_BACKEND);
};

// Get cancellation requests for activity (Advisor only)
const getActivityCancellationRequestsAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}/cancellation-requests`;
  return axios.get(URL_BACKEND);
};

// Approve/Reject cancellation request (Advisor only)
const updateCancellationRequestAPI = (activityId, requestId, status) => {
  const URL_BACKEND = `/api/activities/${activityId}/cancellation-requests/${requestId}`;
  return axios.patch(URL_BACKEND, { status });
};

// Update attendance (Advisor only)
const updateAttendanceAPI = (activityId, attendanceData) => {
  const URL_BACKEND = `/api/activities/${activityId}/attendance`;
  return axios.post(URL_BACKEND, attendanceData);
};

// Get available students for assignment (Advisor only)
const getAvailableStudentsAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}/available-students`;
  return axios.get(URL_BACKEND);
};

// Assign students to activity (Advisor only)
const assignStudentsAPI = (activityId, assignments) => {
  const URL_BACKEND = `/api/activities/${activityId}/assign-students`;
  console.log("assignStudentsAPI called with:", {
    URL_BACKEND,
    activityId,
    assignments,
    payload: { assignments },
  });
  return axios.post(URL_BACKEND, { assignments });
};

// Unassign student from activity (Advisor only)
const unassignStudentAPI = (activityId, registrationId) => {
  const URL_BACKEND = `/api/activities/${activityId}/assignments/${registrationId}`;
  return axios.delete(URL_BACKEND);
};

// ============ Student Activity Registration APIs ============

// Register for activity (Student only)
const registerActivityAPI = (activityRoleId) => {
  const URL_BACKEND = "/api/activity-registrations/register";
  return axios.post(URL_BACKEND, { activity_role_id: activityRoleId });
};

// Get my registrations (Student only)
const getMyRegistrationsAPI = () => {
  const URL_BACKEND = "/api/activity-registrations/my-registrations";
  return axios.get(URL_BACKEND);
};

// Create cancellation request (Student only)
const createCancellationRequestAPI = (registrationId, reason) => {
  const URL_BACKEND = "/api/activity-registrations/cancel";
  return axios.post(URL_BACKEND, {
    registration_id: registrationId,
    reason: reason,
  });
};

// Get my cancellation requests (Student only)
const getMyCancellationRequestsAPI = () => {
  const URL_BACKEND = "/api/activity-registrations/my-cancellation-requests";
  return axios.get(URL_BACKEND);
};

// Get activity roles
const getActivityRolesAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}/roles`;
  return axios.get(URL_BACKEND);
};

// Get role detail
const getActivityRoleDetailAPI = (activityId, roleId) => {
  const URL_BACKEND = `/api/activities/${activityId}/roles/${roleId}`;
  return axios.get(URL_BACKEND);
};

// ========== STUDENT POINTS APIs ==========

// Get student points and activities (Advisor or Student)
const getStudentPointsAPI = (studentId = null, semesterId = null) => {
  const URL_BACKEND = "/api/student-points";
  const params = {};
  if (studentId) params.student_id = studentId;
  if (semesterId) params.semester_id = semesterId;
  return axios.get(URL_BACKEND, { params });
};

// Get class summary points (Advisor only)
const getClassSummaryPointsAPI = (classId) => {
  const URL_BACKEND = "/api/student-points/class-summary";
  return axios.get(URL_BACKEND, { params: { class_id: classId } });
};

// ========== CLASS APIs ==========

// Get all classes (for advisor)
const getClassesAPI = () => {
  const URL_BACKEND = "/api/classes";
  return axios.get(URL_BACKEND);
};

// Get class detail by ID
const getClassDetailAPI = (classId) => {
  const URL_BACKEND = `/api/classes/${classId}`;
  return axios.get(URL_BACKEND);
};

// Get students in a class
const getClassStudentsAPI = (classId) => {
  const URL_BACKEND = `/api/classes/${classId}/students`;
  return axios.get(URL_BACKEND);
};

// ========== SEMESTER APIs ==========

// Get all semesters
const getSemestersAPI = () => {
  const URL_BACKEND = "/api/semesters";
  return axios.get(URL_BACKEND);
};

// Get semester detail by ID
const getSemesterDetailAPI = (semesterId) => {
  const URL_BACKEND = `/api/semesters/${semesterId}`;
  return axios.get(URL_BACKEND);
};

// Get semester reports
const getSemesterReportsAPI = (semesterId) => {
  const URL_BACKEND = `/api/semesters/${semesterId}/reports`;
  return axios.get(URL_BACKEND);
};

// Get student report in a semester
const getStudentSemesterReportAPI = (semesterId, studentId) => {
  const URL_BACKEND = `/api/semesters/${semesterId}/students/${studentId}/report`;
  return axios.get(URL_BACKEND);
};

// ========== COURSE APIs ==========

// Get all courses
const getCoursesAPI = (search = "") => {
  const URL_BACKEND = "/api/courses";
  return axios.get(URL_BACKEND, { params: { search } });
};

// Get course detail by ID
const getCourseDetailAPI = (courseId) => {
  const URL_BACKEND = `/api/courses/${courseId}`;
  return axios.get(URL_BACKEND);
};

// Get students of a course
const getCourseStudentsAPI = (courseId) => {
  const URL_BACKEND = `/api/courses/${courseId}/students`;
  return axios.get(URL_BACKEND);
};

// ========== GRADE APIs ==========

// Get student grades by semester
const getStudentGradesAPI = (studentId, semesterId = null) => {
  const URL_BACKEND = `/api/grades/student/${studentId}`;
  return axios.get(URL_BACKEND, { params: semesterId ? { semester_id: semesterId } : {} });
};

// Export class grades by semester
const exportClassGradesAPI = (classId, semesterId) => {
  const URL_BACKEND = `/api/grades/export-class-grades/${classId}/${semesterId}`;
  return axios.get(URL_BACKEND);
};

// ========== ACADEMIC MONITORING APIs ==========

// Get semester report for a student
const getSemesterReportAPI = (studentId, semesterId) => {
  const URL_BACKEND = `/api/academic/semester-report/${studentId}/${semesterId}`;
  return axios.get(URL_BACKEND);
};

// Get statistics for class
const getClassStatisticsAPI = (semesterId = null, classId = null) => {
  const URL_BACKEND = `/api/academic/statistics`;
  const params = {};
  if (semesterId) params.semester_id = semesterId;
  if (classId) params.class_id = classId;
  return axios.get(URL_BACKEND, { params });
};

// Get at-risk students
const getAtRiskStudentsAPI = (semesterId = null) => {
  const URL_BACKEND = `/api/academic/at-risk-students`;
  return axios.get(URL_BACKEND, { params: semesterId ? { semester_id: semesterId } : {} });
};

// Create academic warnings
const createAcademicWarningsAPI = (data) => {
  const URL_BACKEND = `/api/academic/create-warnings`;
  return axios.post(URL_BACKEND, data);
};

// Get warnings created by advisor
const getWarningsCreatedAPI = () => {
  const URL_BACKEND = `/api/academic/warnings-created`;
  return axios.get(URL_BACKEND);
};

// Update semester report for a student
const updateSemesterReportAPI = (data) => {
  const URL_BACKEND = `/api/academic/update-semester-report`;
  return axios.post(URL_BACKEND, data);
};

// Batch update semester reports
const batchUpdateSemesterReportsAPI = (data) => {
  const URL_BACKEND = `/api/academic/batch-update-semester-reports`;
  return axios.post(URL_BACKEND, data);
};

export {
    
    createUserApi,
    loginApi,
    getAccountAPI,
    logoutApi,
    updateUserApi,
    forgotPassword,
    changePassword,
    // Notification APIs
    getNotificationsAPI,
    getNotificationDetailAPI,
    createNotificationAPI,
    updateNotificationAPI,
    deleteNotificationAPI,
    getNotificationStatisticsAPI,
    getNotificationResponsesAPI,
    submitNotificationResponseAPI,
    updateNotificationResponseAPI,
    getUnreadNotificationsAPI,
    markAllNotificationsReadAPI,
    // Activity APIs (Advisor)
    getActivitiesAPI,
    getActivityDetailAPI,
    createActivityAPI,
    updateActivityAPI,
    deleteActivityAPI,
    getActivityRegistrationsAPI,
    getActivityCancellationRequestsAPI,
    updateCancellationRequestAPI,
    updateAttendanceAPI,
    getAvailableStudentsAPI,
    assignStudentsAPI,
    unassignStudentAPI,
    // Activity APIs (Student)
    registerActivityAPI,
    getMyRegistrationsAPI,
    createCancellationRequestAPI,
    getMyCancellationRequestsAPI,
    getActivityRolesAPI,
    getActivityRoleDetailAPI,
    // Student Points APIs
    getStudentPointsAPI,
    getClassSummaryPointsAPI,
    // Class APIs
    getClassesAPI,
    getClassDetailAPI,
    getClassStudentsAPI,
    // Semester APIs
    getSemestersAPI,
    getSemesterDetailAPI,
    getSemesterReportsAPI,
    getStudentSemesterReportAPI,
    // Course APIs
    getCoursesAPI,
    getCourseDetailAPI,
    getCourseStudentsAPI,
    // Grade APIs
    getStudentGradesAPI,
    exportClassGradesAPI,
    // Academic Monitoring APIs
    getSemesterReportAPI,
    getClassStatisticsAPI,
    getAtRiskStudentsAPI,
    createAcademicWarningsAPI,
    getWarningsCreatedAPI,
    updateSemesterReportAPI,
    batchUpdateSemesterReportsAPI,
};
