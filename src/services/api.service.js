
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

const refreshTokenApi = () => {
    const URL_BACKEND = "/api/auth/refresh";
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

const changeStudentPassword = (current_password,new_password,new_password_confirmation)=>{
  const URL_BACKEND = "/api/students/change-password"
   const data ={
        current_password:current_password,
        new_password:new_password,
        new_password_confirmation:new_password_confirmation
    }
    return axios.post(URL_BACKEND,data);
}

const changeAdvisorPassword = (current_password,new_password,new_password_confirmation)=>{
  const URL_BACKEND = "/api/advisors/change-password"
   const data ={
        current_password:current_password,
        new_password:new_password,
        new_password_confirmation:new_password_confirmation
    }
    return axios.post(URL_BACKEND,data);
}

// Admin change password - sử dụng cùng endpoint với advisor vì admin cũng có thể dùng
const changeAdminPassword = (current_password,new_password,new_password_confirmation)=>{
  const URL_BACKEND = "/api/advisors/change-password"
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

// Get read statistics for a notification (Advisor only)
const getNotificationReadStatisticsAPI = (notificationId) => {
  const URL_BACKEND = `/api/notifications/${notificationId}/read-statistics`;
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

// Create activity role
const createActivityRoleAPI = (activityId, roleData) => {
  const URL_BACKEND = `/api/activities/${activityId}/roles`;
  return axios.post(URL_BACKEND, roleData);
};

// Update activity role
const updateActivityRoleAPI = (activityId, roleId, roleData) => {
  const URL_BACKEND = `/api/activities/${activityId}/roles/${roleId}`;
  return axios.put(URL_BACKEND, roleData);
};

// Delete activity role
const deleteActivityRoleAPI = (activityId, roleId) => {
  const URL_BACKEND = `/api/activities/${activityId}/roles/${roleId}`;
  return axios.delete(URL_BACKEND);
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

// Update student position (Advisor)
const updateStudentPositionAPI = (studentId, position) => {
  const URL_BACKEND = `/api/students/${studentId}`;
  return axios.put(URL_BACKEND, { position });
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

// Student Academic APIs
// Get my semester report
const getMySemesterReportAPI = (semesterId) => {
  const URL_BACKEND = `/api/academic/my-semester-report/${semesterId}`;
  return axios.get(URL_BACKEND);
};

// Get my warnings
const getMyWarningsAPI = () => {
  const URL_BACKEND = `/api/academic/my-warnings`;
  return axios.get(URL_BACKEND);
};

// ========== ADMIN APIs - Class Management ==========

// Get all classes (Admin can see classes in their faculty)
const getClassesApi = () => {
  const URL_BACKEND = "/api/classes";
  return axios.get(URL_BACKEND);
};

// Get class detail
const getClassDetailApi = (classId) => {
  const URL_BACKEND = `/api/classes/${classId}`;
  return axios.get(URL_BACKEND);
};

// Create new class (Admin only)
const createClassApi = (classData) => {
  const URL_BACKEND = "/api/classes";
  return axios.post(URL_BACKEND, classData);
};

// Update class (Admin only)
const updateClassApi = (classId, classData) => {
  const URL_BACKEND = `/api/classes/${classId}`;
  return axios.put(URL_BACKEND, classData);
};

// Delete class (Admin only)
const deleteClassApi = (classId) => {
  const URL_BACKEND = `/api/classes/${classId}`;
  return axios.delete(URL_BACKEND);
};

// Get students in a class
const getClassStudentsApi = (classId) => {
  const URL_BACKEND = `/api/classes/${classId}/students`;
  return axios.get(URL_BACKEND);
};

// ========== ADMIN APIs - Semester Management ==========

// Get all semesters
const getSemestersApi = () => {
  const URL_BACKEND = "/api/semesters";
  return axios.get(URL_BACKEND);
};

// Get semester detail
const getSemesterDetailApi = (semesterId) => {
  const URL_BACKEND = `/api/semesters/${semesterId}`;
  return axios.get(URL_BACKEND);
};

// Create new semester (Admin only)
const createSemesterApi = (semesterData) => {
  const URL_BACKEND = "/api/semesters";
  return axios.post(URL_BACKEND, semesterData);
};

// Update semester (Admin only)
const updateSemesterApi = (semesterId, semesterData) => {
  const URL_BACKEND = `/api/semesters/${semesterId}`;
  return axios.put(URL_BACKEND, semesterData);
};

// Delete semester (Admin only)
const deleteSemesterApi = (semesterId) => {
  const URL_BACKEND = `/api/semesters/${semesterId}`;
  return axios.delete(URL_BACKEND);
};

// Get semester reports
const getSemesterReportsApi = (semesterId) => {
  const URL_BACKEND = `/api/semesters/${semesterId}/reports`;
  return axios.get(URL_BACKEND);
};

// Get specific student's semester report
const getStudentSemesterReportApi = (semesterId, studentId) => {
  const URL_BACKEND = `/api/semesters/${semesterId}/students/${studentId}/report`;
  return axios.get(URL_BACKEND);
};

// Get current semester
const getCurrentSemesterApi = () => {
  const URL_BACKEND = "/api/semesters/current";
  return axios.get(URL_BACKEND);
};

// ========== ADMIN APIs - Academic Warnings Management ==========

// Download template for importing warnings
const downloadWarningsTemplateApi = () => {
  const URL_BACKEND = "/api/academic/download-warnings-template";
  return axios.get(URL_BACKEND, {
    responseType: "arraybuffer",
  });
};

// Import warnings from Excel file
const importWarningsApi = (formData) => {
  const URL_BACKEND = "/api/academic/import-warnings";
  return axios.post(URL_BACKEND, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ========== ADMIN APIs - Course Management ==========

// Get courses of my unit (Admin)
const getMyUnitCoursesApi = (search = "") => {
  const URL_BACKEND = "/api/courses/my-unit-courses";
  return axios.get(URL_BACKEND, { params: { search } });
};

// Get all courses (Public)
const getAllCoursesApi = (search = "", unit_id = null) => {
  const URL_BACKEND = "/api/courses";
  return axios.get(URL_BACKEND, { params: { search, unit_id } });
};

// Get course detail (Public)
const getCourseDetailApi = (courseId) => {
  const URL_BACKEND = `/api/courses/${courseId}`;
  return axios.get(URL_BACKEND);
};

// Create course (Admin)
const createCourseApi = (courseData) => {
  const URL_BACKEND = "/api/courses";
  return axios.post(URL_BACKEND, courseData);
};

// Update course (Admin)
const updateCourseApi = (courseId, courseData) => {
  const URL_BACKEND = `/api/courses/${courseId}`;
  return axios.put(URL_BACKEND, courseData);
};

// Delete course (Admin)
const deleteCourseApi = (courseId) => {
  const URL_BACKEND = `/api/courses/${courseId}`;
  return axios.delete(URL_BACKEND);
};

// Get students in a course (Advisor)
const getCourseStudentsApi = (courseId, semesterId) => {
  const URL_BACKEND = `/api/courses/${courseId}/students`;
  return axios.get(URL_BACKEND, { params: { semester_id: semesterId } });
};

// ========== ADMIN APIs - Grade Management ==========

// Create grade (Admin)
const createGradeApi = (gradeData) => {
  const URL_BACKEND = "/api/grades";
  return axios.post(URL_BACKEND, gradeData);
};

// Update grade (Admin)
const updateGradeApi = (gradeId, gradeData) => {
  const URL_BACKEND = `/api/grades/${gradeId}`;
  return axios.put(URL_BACKEND, gradeData);
};

// Delete grade (Admin)
const deleteGradeApi = (gradeId) => {
  const URL_BACKEND = `/api/grades/${gradeId}`;
  return axios.delete(URL_BACKEND);
};

// Batch import grades (Admin)
const batchImportGradesApi = (batchData) => {
  const URL_BACKEND = "/api/grades/batch-import";
  return axios.post(URL_BACKEND, batchData);
};

// Get my grades (Student)
const getMyGradesApi = (semesterId = null) => {
  const URL_BACKEND = "/api/grades/my-grades";
  return axios.get(URL_BACKEND, { params: { semester_id: semesterId } });
};

// Get student grades (Advisor)
const getStudentGradesDetailApi = (studentId, semesterId = null) => {
  const URL_BACKEND = `/api/grades/student/${studentId}`;
  return axios.get(URL_BACKEND, { params: { semester_id: semesterId } });
};

// Export class grades (Advisor)
const exportClassGradesApi = (classId, semesterId) => {
  const URL_BACKEND = `/api/grades/export-class-grades/${classId}/${semesterId}`;
  return axios.get(URL_BACKEND);
};

// ========== ADMIN APIs - Excel Import/Export ==========

// Download grade import template (Admin)
const downloadGradeTemplateApi = () => {
  const URL_BACKEND = "/api/grades/download-template";
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// Import grades from Excel (Admin)
const importGradesExcelApi = (file) => {
  const URL_BACKEND = "/api/grades/import-excel";
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Export grades to Excel (Admin)
const exportGradesExcelApi = (classId, semesterId) => {
  const URL_BACKEND = `/api/grades/export-excel/${classId}/${semesterId}`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// ========== ADMIN APIs - Schedule Management ==========

// Download schedule template (Admin)
const downloadScheduleTemplateApi = () => {
  const URL_BACKEND = "/api/schedules/template/download";
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// Import schedule from Excel (Admin)
const importScheduleExcelApi = (file) => {
  const URL_BACKEND = "/api/admin/schedules/import";
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Check schedule conflict (Admin, Advisor, Student)
const checkScheduleConflictApi = (data) => {
  const URL_BACKEND = "/api/schedules/check-conflict";
  return axios.post(URL_BACKEND, data);
};

// Get student schedule (Admin, Advisor)
const getStudentScheduleApi = (studentId, semesterId = null) => {
  const URL_BACKEND = `/api/admin/schedules/student/${studentId}`;
  const params = semesterId ? { semester_id: semesterId } : {};
  return axios.get(URL_BACKEND, { params });
};

// Get class schedule (Admin, Advisor)
const getClassScheduleApi = (classId, semesterId) => {
  const URL_BACKEND = `/api/admin/schedules/class/${classId}`;
  return axios.get(URL_BACKEND, {
    params: { semester_id: semesterId },
  });
};

// Search schedules (Admin only)
const searchSchedulesApi = (filters) => {
  const URL_BACKEND = "/api/admin/schedules/search";
  return axios.post(URL_BACKEND, filters);
};

// Delete student schedule (Admin only)
const deleteStudentScheduleApi = (studentId, semesterId) => {
  const URL_BACKEND = `/api/admin/schedules/student/${studentId}`;
  return axios.delete(URL_BACKEND, {
    data: { semester_id: semesterId },
  });
};

// ========== Import/Export Management APIs ==========

// Download template file
const downloadTemplateApi = (type) => {
  const URL_BACKEND = `/api/import-export/templates/download?type=${type}`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// Import classes from Excel
const importClassesApi = (file) => {
  const URL_BACKEND = "/api/import-export/classes/import";
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Import advisors from Excel
const importAdvisorsApi = (file) => {
  const URL_BACKEND = "/api/import-export/advisors/import";
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Import students from Excel
const importStudentsApi = (file) => {
  const URL_BACKEND = "/api/import-export/students/import";
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Export classes list
const exportClassesApi = () => {
  const URL_BACKEND = "/api/import-export/classes/export";
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// Export students by class
const exportStudentsByClassApi = (classId) => {
  const URL_BACKEND = `/api/import-export/students/${classId}/export`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// ========== Dialog APIs ==========

// Get conversations list
const getConversationsApi = () => {
  const URL_BACKEND = "/api/dialogs/conversations";
  return axios.get(URL_BACKEND);
};

// Get messages in conversation
const getMessagesApi = (partnerId) => {
  const URL_BACKEND = `/api/dialogs/messages?partner_id=${partnerId}`;
  return axios.get(URL_BACKEND);
};

// Send message
const sendMessageApi = (data) => {
  const URL_BACKEND = "/api/dialogs/messages";
  return axios.post(URL_BACKEND, data);
};

// Mark message as read
const markMessageReadApi = (messageId) => {
  const URL_BACKEND = `/api/dialogs/messages/${messageId}/read`;
  return axios.put(URL_BACKEND);
};

// Delete message
const deleteMessageApi = (messageId) => {
  const URL_BACKEND = `/api/dialogs/messages/${messageId}`;
  return axios.delete(URL_BACKEND);
};

// Get unread count
const getUnreadCountApi = () => {
  const URL_BACKEND = "/api/dialogs/unread-count";
  return axios.get(URL_BACKEND);
};

// Search messages
const searchMessagesApi = (partnerId, keyword) => {
  const URL_BACKEND = `/api/dialogs/messages/search?partner_id=${partnerId}&keyword=${encodeURIComponent(keyword)}`;
  return axios.get(URL_BACKEND);
};

// Advisor APIs
const getAdvisorsApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.role_filter) queryParams.append('role_filter', params.role_filter);
  if (params.search) queryParams.append('search', params.search);
  
  const URL_BACKEND = `/api/advisors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return axios.get(URL_BACKEND);
};

const updateAdvisorApi = (advisorId, data) => {
  const URL_BACKEND = `/api/advisors/${advisorId}`;
  return axios.put(URL_BACKEND, data);
};

const deleteAdvisorApi = (advisorId) => {
  const URL_BACKEND = `/api/advisors/${advisorId}`;
  return axios.delete(URL_BACKEND);
};

const createAdvisorApi = (data) => {
  const URL_BACKEND = "/api/advisors";
  return axios.post(URL_BACKEND, data);
};

const getAdvisorDetailApi = (advisorId) => {
  const URL_BACKEND = `/api/advisors/${advisorId}`;
  return axios.get(URL_BACKEND);
};

const getAdvisorStatisticsApi = (advisorId) => {
  const URL_BACKEND = `/api/advisors/${advisorId}/statistics`;
  return axios.get(URL_BACKEND);
};

const uploadAdvisorAvatarApi = (advisorId, file) => {
  const URL_BACKEND = `/api/advisors/${advisorId}/avatar`;
  const formData = new FormData();
  formData.append("avatar", file);
  return axios.post(URL_BACKEND, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const uploadStudentAvatarApi = (studentId, file) => {
  const URL_BACKEND = `/api/students/${studentId}/avatar`;
  const formData = new FormData();
  formData.append("avatar", file);
  return axios.post(URL_BACKEND, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ========== Dashboard APIs ==========

// Get dashboard overview (Admin)
const getDashboardOverviewApi = () => {
  const URL_BACKEND = "/api/statistics/dashboard-overview";
  return axios.get(URL_BACKEND);
};

// ========== MEETINGS APIs ==========

// Get all meetings (Admin)
const getMeetingsApi = (params = {}) => {
  const URL_BACKEND = "/api/meetings";
  return axios.get(URL_BACKEND, { params });
};

// Get meeting detail
const getMeetingDetailApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}`;
  return axios.get(URL_BACKEND);
};

// Create meeting (Advisor, Admin)
const createMeetingApi = (meetingData) => {
  const URL_BACKEND = "/api/meetings";
  return axios.post(URL_BACKEND, meetingData);
};

// Update meeting (Advisor, Admin)
const updateMeetingApi = (meetingId, meetingData) => {
  const URL_BACKEND = `/api/meetings/${meetingId}`;
  return axios.put(URL_BACKEND, meetingData);
};

// Delete meeting (Advisor, Admin)
const deleteMeetingApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}`;
  return axios.delete(URL_BACKEND);
};

// Update attendance
const updateMeetingAttendanceApi = (meetingId, attendanceData) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/attendance`;
  return axios.post(URL_BACKEND, attendanceData);
};

// Export minutes
const exportMeetingMinutesApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/export-minutes`;
  return axios.get(URL_BACKEND, { responseType: 'blob' });
};

// Upload minutes
const uploadMeetingMinutesApi = (meetingId, file) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/upload-minutes`;
  const formData = new FormData();
  formData.append('minutes_file', file);
  return axios.post(URL_BACKEND, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Download minutes
const downloadMeetingMinutesApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/download-minutes`;
  return axios.get(URL_BACKEND, { responseType: 'blob' });
};

// Get meeting feedbacks
const getMeetingFeedbacksApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/feedbacks`;
  return axios.get(URL_BACKEND);
};

// Get meeting statistics
const getMeetingStatisticsApi = (params = {}) => {
  const URL_BACKEND = "/api/meetings/statistics/overview";
  return axios.get(URL_BACKEND, { params });
};

// ========== ATTENDANCE APIs (Activity) ==========

// Export danh sách đăng ký hoạt động
const exportRegistrationsAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}/export-registrations`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// Export file mẫu điểm danh
const exportAttendanceTemplateAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}/export-attendance-template`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// Import file điểm danh
const importAttendanceAPI = (activityId, file) => {
  const URL_BACKEND = `/api/activities/${activityId}/import-attendance`;
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Lấy thống kê điểm danh
const getAttendanceStatisticsAPI = (activityId) => {
  const URL_BACKEND = `/api/activities/${activityId}/attendance-statistics`;
  return axios.get(URL_BACKEND);
};

// ========== POINT FEEDBACK APIs (Phản hồi điểm rèn luyện) ==========

// Lấy danh sách phản hồi (Student xem của mình, Advisor xem của lớp)
const getPointFeedbacksAPI = (params) => {
  // params: { semester_id, status, student_id }
  const URL_BACKEND = "/api/point-feedbacks";
  return axios.get(URL_BACKEND, { params });
};

// Xem chi tiết phản hồi
const getPointFeedbackDetailAPI = (id) => {
  const URL_BACKEND = `/api/point-feedbacks/${id}`;
  return axios.get(URL_BACKEND);
};

// Tạo phản hồi mới (Student only)
const createPointFeedbackAPI = (data) => {
  const URL_BACKEND = "/api/point-feedbacks";
  const formData = new FormData();
  formData.append('semester_id', data.semester_id);
  formData.append('feedback_content', data.feedback_content);
  if (data.attachment) {
    formData.append('attachment', data.attachment);
  }

  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Cập nhật phản hồi (Student only - pending status)
const updatePointFeedbackAPI = (id, data) => {
  const URL_BACKEND = `/api/point-feedbacks/${id}`;
  const formData = new FormData();
  if (data.feedback_content) formData.append('feedback_content', data.feedback_content);
  if (data.attachment) formData.append('attachment', data.attachment);

  // Method PUT với FormData trong Laravel thường cần _method: PUT
  formData.append('_method', 'PUT'); 
  
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Xóa phản hồi (Student only - pending status)
const deletePointFeedbackAPI = (id) => {
  const URL_BACKEND = `/api/point-feedbacks/${id}`;
  return axios.delete(URL_BACKEND);
};

// Cố vấn duyệt/từ chối phản hồi (Advisor only)
const respondPointFeedbackAPI = (id, data) => {
  // data: { status: 'approved' | 'rejected', advisor_response: string }
  const URL_BACKEND = `/api/point-feedbacks/${id}/respond`;
  return axios.post(URL_BACKEND, data);
};

// Thống kê phản hồi (Advisor only)
const getPointFeedbackStatisticsAPI = (semesterId) => {
  const URL_BACKEND = "/api/point-feedbacks/statistics/overview";
  return axios.get(URL_BACKEND, { params: { semester_id: semesterId } });
};

// ========== STUDENT MONITORING NOTES APIs (Ghi chú theo dõi) ==========

// Lấy danh sách ghi chú
const getMonitoringNotesAPI = (params) => {
  // params: { student_id, semester_id, category }
  const URL_BACKEND = "/api/monitoring-notes";
  return axios.get(URL_BACKEND, { params });
};

// Xem chi tiết ghi chú
const getMonitoringNoteDetailAPI = (id) => {
  const URL_BACKEND = `/api/monitoring-notes/${id}`;
  return axios.get(URL_BACKEND);
};

// Tạo ghi chú mới (Advisor only)
const createMonitoringNoteAPI = (data) => {
  const URL_BACKEND = "/api/monitoring-notes";
  return axios.post(URL_BACKEND, data);
};

// Cập nhật ghi chú (Advisor only - own notes)
const updateMonitoringNoteAPI = (id, data) => {
  const URL_BACKEND = `/api/monitoring-notes/${id}`;
  return axios.put(URL_BACKEND, data);
};

// Xóa ghi chú (Advisor only - own notes)
const deleteMonitoringNoteAPI = (id) => {
  const URL_BACKEND = `/api/monitoring-notes/${id}`;
  return axios.delete(URL_BACKEND);
};

// Xem timeline ghi chú của sinh viên (Student & Advisor)
const getStudentNoteTimelineAPI = (studentId) => {
  const URL_BACKEND = `/api/monitoring-notes/student/${studentId}/timeline`;
  return axios.get(URL_BACKEND);
};

// Thống kê ghi chú (Advisor only)
const getMonitoringNoteStatisticsAPI = (semesterId) => {
  const URL_BACKEND = "/api/monitoring-notes/statistics/overview";
  return axios.get(URL_BACKEND, { params: { semester_id: semesterId } });
};

// ========== PASSWORD RESET APIs ==========

// Reset advisor password (Admin only)
const resetAdvisorPasswordApi = (advisorId) => {
  const URL_BACKEND = `/api/advisors/${advisorId}/reset-password`;
  return axios.post(URL_BACKEND);
};

// Reset student password (Admin only)
const resetStudentPasswordApi = (studentId) => {
  const URL_BACKEND = `/api/students/${studentId}/reset-password`;
  return axios.post(URL_BACKEND);
};

// Get student detail
const getStudentDetailApi = (studentId) => {
  const URL_BACKEND = `/api/students/${studentId}`;
  return axios.get(URL_BACKEND);
};

// Update student information (Admin)
const updateStudentApi = (studentId, studentData) => {
  const URL_BACKEND = `/api/students/${studentId}`;
  return axios.put(URL_BACKEND, studentData);
};

// ========== EXPORT TRAINING & SOCIAL POINTS APIs ==========

// Export training points by class
const exportTrainingPointsByClassApi = (classId, semesterId) => {
  const URL_BACKEND = `/api/admin/export/training-points/class?class_id=${classId}&semester_id=${semesterId}`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

// Export training points by faculty
const exportTrainingPointsByFacultyApi = (semesterId) => {
  const URL_BACKEND = `/api/admin/export/training-points/faculty?semester_id=${semesterId}`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

// Export social points by class
const exportSocialPointsByClassApi = (classId) => {
  const URL_BACKEND = `/api/admin/export/social-points/class?class_id=${classId}`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

// Export social points by faculty
const exportSocialPointsByFacultyApi = () => {
  const URL_BACKEND = `/api/admin/export/social-points/faculty`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

export {
    
    createUserApi,
    loginApi,
    getAccountAPI,
    logoutApi,
    refreshTokenApi,
    updateUserApi,
    forgotPassword,
    changePassword,
    changeStudentPassword,
    changeAdvisorPassword,
    changeAdminPassword,
    // Notification APIs
    getNotificationsAPI,
    getNotificationDetailAPI,
    createNotificationAPI,
    updateNotificationAPI,
    deleteNotificationAPI,
    getNotificationStatisticsAPI,
    getNotificationResponsesAPI,
    getNotificationReadStatisticsAPI,
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
    createActivityRoleAPI,
    updateActivityRoleAPI,
    deleteActivityRoleAPI,
    // Student Points APIs
    getStudentPointsAPI,
    getClassSummaryPointsAPI,
    // Class APIs
    getClassesAPI,
    getClassDetailAPI,
    getClassStudentsAPI,
    updateStudentPositionAPI,
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
    // Student Academic APIs
    getMySemesterReportAPI,
    getMyWarningsAPI,
    // Admin APIs - Class Management
    getClassesApi,
    getClassDetailApi,
    createClassApi,
    updateClassApi,
    deleteClassApi,
    getClassStudentsApi,
    // Admin APIs - Semester Management
    getSemestersApi,
    getSemesterDetailApi,
    createSemesterApi,
    updateSemesterApi,
    deleteSemesterApi,
    getSemesterReportsApi,
    getStudentSemesterReportApi,
    getCurrentSemesterApi,
    // Admin APIs - Academic Warnings Management
    downloadWarningsTemplateApi,
    importWarningsApi,
    // Admin APIs - Course Management
    getMyUnitCoursesApi,
    getAllCoursesApi,
    getCourseDetailApi,
    createCourseApi,
    updateCourseApi,
    deleteCourseApi,
    getCourseStudentsApi,
    // Admin APIs - Grade Management
    createGradeApi,
    updateGradeApi,
    deleteGradeApi,
    batchImportGradesApi,
    getMyGradesApi,
    getStudentGradesDetailApi,
    exportClassGradesApi,
    // Admin APIs - Excel Import/Export
    downloadGradeTemplateApi,
    importGradesExcelApi,
    exportGradesExcelApi,
    // Admin APIs - Schedule Management
    downloadScheduleTemplateApi,
    importScheduleExcelApi,
    checkScheduleConflictApi,
    getStudentScheduleApi,
    getClassScheduleApi,
    searchSchedulesApi,
    deleteStudentScheduleApi,
    // Admin APIs - Import/Export Management
    downloadTemplateApi,
    importClassesApi,
    importAdvisorsApi,
  importStudentsApi,
  exportClassesApi,
  exportStudentsByClassApi,
  // Dialog APIs
  getConversationsApi,
  getMessagesApi,
  sendMessageApi,
  markMessageReadApi,
  deleteMessageApi,
  getUnreadCountApi,
  searchMessagesApi,
  // Advisor APIs
  getAdvisorsApi,
  updateAdvisorApi,
  deleteAdvisorApi,
  createAdvisorApi,
  getAdvisorDetailApi,
  getAdvisorStatisticsApi,
  uploadAdvisorAvatarApi,
  uploadStudentAvatarApi,
  // Dashboard APIs
  getDashboardOverviewApi,
  // Meetings APIs
  getMeetingsApi,
  getMeetingDetailApi,
  createMeetingApi,
  updateMeetingApi,
  deleteMeetingApi,
  updateMeetingAttendanceApi,
  exportMeetingMinutesApi,
  uploadMeetingMinutesApi,
  downloadMeetingMinutesApi,
  getMeetingFeedbacksApi,
  getMeetingStatisticsApi,
  // Attendance APIs
  exportRegistrationsAPI,
  exportAttendanceTemplateAPI,
  importAttendanceAPI,
  getAttendanceStatisticsAPI,
  getPointFeedbacksAPI,
    getPointFeedbackDetailAPI,
    createPointFeedbackAPI,
    updatePointFeedbackAPI,
    deletePointFeedbackAPI,
    respondPointFeedbackAPI,
    getPointFeedbackStatisticsAPI,
    getMonitoringNotesAPI,
    getMonitoringNoteDetailAPI,
    createMonitoringNoteAPI,
    updateMonitoringNoteAPI,
    deleteMonitoringNoteAPI,
    getStudentNoteTimelineAPI,
    getMonitoringNoteStatisticsAPI,
    // Password Reset APIs
    resetAdvisorPasswordApi,
    resetStudentPasswordApi,
    // Student Detail & Update APIs
    getStudentDetailApi,
    updateStudentApi,
    // Export Training & Social Points APIs
    exportTrainingPointsByClassApi,
    exportTrainingPointsByFacultyApi,
    exportSocialPointsByClassApi,
    exportSocialPointsByFacultyApi,
};