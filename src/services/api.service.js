
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


// Login using backend's expected fields: `user_code` and `password`
const loginApi = (userCode, password) => {
  const URL_BACKEND = "/api/auth/login";
  const data = {
    user_code: userCode,
    password: password,
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
  const URL_BACKEND = "/api/notification-statistics";
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
};
