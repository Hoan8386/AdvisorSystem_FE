import api from "./axios.customize";

// ============ POINT FEEDBACK API ============

/**
 * Lấy danh sách phản hồi điểm
 * @param {Object} params - Query parameters (semester_id, status, student_id)
 * @returns {Promise}
 */
export const getPointFeedbacksAPI = (params = {}) => {
  return api.get("/api/point-feedbacks", { params });
};

/**
 * Xem chi tiết phản hồi
 * @param {Number} id - Feedback ID
 * @returns {Promise}
 */
export const getPointFeedbackDetailAPI = (id) => {
  return api.get(`/api/point-feedbacks/${id}`);
};

/**
 * Tạo phản hồi mới
 * @param {FormData} data - Dữ liệu phản hồi (semester_id, feedback_content, attachment)
 * @returns {Promise}
 */
export const createPointFeedbackAPI = (data) => {
  return api.post("/api/point-feedbacks", data);
};

/**
 * Cập nhật phản hồi
 * @param {Number} id - Feedback ID
 * @param {FormData} data - Dữ liệu cập nhật (feedback_content, attachment)
 * @returns {Promise}
 */
export const updatePointFeedbackAPI = (id, data) => {
  return api.put(`/api/point-feedbacks/${id}`, data);
};

/**
 * Xóa phản hồi
 * @param {Number} id - Feedback ID
 * @returns {Promise}
 */
export const deletePointFeedbackAPI = (id) => {
  return api.delete(`/api/point-feedbacks/${id}`);
};

/**
 * Cố vấn phê duyệt/từ chối phản hồi
 * @param {Number} id - Feedback ID
 * @param {Object} data - { status: 'approved' | 'rejected', advisor_response: string }
 * @returns {Promise}
 */
export const respondPointFeedbackAPI = (id, data) => {
  return api.post(`/api/point-feedbacks/${id}/respond`, data);
};

/**
 * Lấy thống kê phản hồi
 * @param {Object} params - Query parameters (semester_id)
 * @returns {Promise}
 */
export const getPointFeedbacksStatisticsAPI = (params = {}) => {
  return api.get("/api/point-feedbacks/statistics/overview", { params });
};

// ============ STUDENT MONITORING NOTES API ============

/**
 * Lấy danh sách ghi chú theo dõi
 * @param {Object} params - Query parameters (student_id, semester_id, category)
 * @returns {Promise}
 */
export const getMonitoringNotesAPI = (params = {}) => {
  return api.get("/api/monitoring-notes", { params });
};

/**
 * Xem chi tiết ghi chú
 * @param {Number} id - Note ID
 * @returns {Promise}
 */
export const getMonitoringNoteDetailAPI = (id) => {
  return api.get(`/api/monitoring-notes/${id}`);
};

/**
 * Tạo ghi chú mới (Advisor)
 * @param {Object} data - Dữ liệu ghi chú { student_id, semester_id, category, title, content }
 * @returns {Promise}
 */
export const createMonitoringNoteAPI = (data) => {
  return api.post("/api/monitoring-notes", data);
};

/**
 * Cập nhật ghi chú (Advisor)
 * @param {Number} id - Note ID
 * @param {Object} data - Dữ liệu cập nhật { category, title, content }
 * @returns {Promise}
 */
export const updateMonitoringNoteAPI = (id, data) => {
  return api.put(`/api/monitoring-notes/${id}`, data);
};

/**
 * Xóa ghi chú (Advisor)
 * @param {Number} id - Note ID
 * @returns {Promise}
 */
export const deleteMonitoringNoteAPI = (id) => {
  return api.delete(`/api/monitoring-notes/${id}`);
};

/**
 * Lấy timeline ghi chú của sinh viên
 * @param {Number} studentId - Student ID
 * @returns {Promise}
 */
export const getMonitoringNoteTimelineAPI = (studentId) => {
  return api.get(`/api/monitoring-notes/student/${studentId}/timeline`);
};

/**
 * Lấy thống kê ghi chú
 * @param {Object} params - Query parameters (semester_id)
 * @returns {Promise}
 */
export const getMonitoringNotesStatisticsAPI = (params = {}) => {
  return api.get("/api/monitoring-notes/statistics/overview", { params });
};
