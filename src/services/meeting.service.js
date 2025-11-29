import axios from './axios.customize';

// ========== MEETING APIs ==========

// Get all meetings
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

// Attendance management
const updateAttendanceApi = (meetingId, attendances) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/attendance`;
  return axios.post(URL_BACKEND, { attendances });
};

// Export meeting minutes
const exportMeetingMinutesApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/export-minutes`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// Upload meeting minutes
const uploadMeetingMinutesApi = (meetingId, file) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/upload-minutes`;
  const formData = new FormData();
  formData.append('minutes_file', file);
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Download meeting minutes
const downloadMeetingMinutesApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/download-minutes`;
  return axios.get(URL_BACKEND, {
    responseType: 'blob',
  });
};

// Delete meeting minutes
const deleteMeetingMinutesApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/minutes`;
  return axios.delete(URL_BACKEND);
};

// Update meeting summary
const updateMeetingSummaryApi = (meetingId, data) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/summary`;
  return axios.put(URL_BACKEND, data);
};

// Send feedback (Student)
const sendMeetingFeedbackApi = (meetingId, feedbackContent) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/feedbacks`;
  return axios.post(URL_BACKEND, { feedback_content: feedbackContent });
};

// Get feedbacks
const getMeetingFeedbacksApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/feedbacks`;
  return axios.get(URL_BACKEND);
};

// Get statistics
const getMeetingStatisticsApi = () => {
  const URL_BACKEND = "/api/meetings/statistics/overview";
  return axios.get(URL_BACKEND);
};

// Check Google Calendar attendance
const checkGoogleAttendanceApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/google-attendance`;
  return axios.get(URL_BACKEND);
};

// Sync Google Calendar attendance
const syncGoogleAttendanceApi = (meetingId) => {
  const URL_BACKEND = `/api/meetings/${meetingId}/sync-google-attendance`;
  return axios.post(URL_BACKEND);
};

export {
  getMeetingsApi,
  getMeetingDetailApi,
  createMeetingApi,
  updateMeetingApi,
  deleteMeetingApi,
  updateAttendanceApi,
  exportMeetingMinutesApi,
  uploadMeetingMinutesApi,
  downloadMeetingMinutesApi,
  deleteMeetingMinutesApi,
  updateMeetingSummaryApi,
  sendMeetingFeedbackApi,
  getMeetingFeedbacksApi,
  getMeetingStatisticsApi,
  checkGoogleAttendanceApi,
  syncGoogleAttendanceApi,
};
