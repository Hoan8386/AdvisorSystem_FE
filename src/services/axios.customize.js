import axios from "axios";
// Set config defaults when creating the instance
//console.log(import.meta.env.VITE_BACKEND_URL)
//debugger;

import NProgress from 'nprogress';

NProgress.configure({
    showSpinner: false,
    trickleSpeed: 100,
});

const instance = axios.create({
    // baseURL: import.meta.env.VITE_BACKEND_URL
    baseURL: import.meta.env.VITE_BACKEND_URL
});

// Flag to prevent multiple refresh token calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Alter defaults after instance has been created
//   instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// Add a request interceptor
instance.interceptors.request.use(function (config) {
    NProgress.start();
    if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
        config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
    }
    
    // Disable caching for all requests
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    // Do something before request is sent
    return config;
}, function (error) {
    NProgress.done();

    // Do something with request error
    return Promise.reject(error);
});



// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    //  debugger
    //console.log(" check inside interceptor  ", response);
    NProgress.done();
    // Nếu response là Blob (file download), trả về response object, không extract data
    if (response.data instanceof Blob) {
        return response;
    }
    // Return response as is to maintain success/data structure
    return response.data || response;
}, async function (error) {
    NProgress.done();

    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise(function(resolve, reject) {
                failedQueue.push({resolve, reject});
            }).then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return instance(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const token = window.localStorage.getItem('access_token');
        
        if (!token) {
            isRefreshing = false;
            processQueue(error, null);
            // Redirect to login
            window.localStorage.removeItem('access_token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        try {
            // Call refresh token endpoint
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
                {},
                {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }
            );

            if (response.data && response.data.token) {
                const newToken = response.data.token;
                window.localStorage.setItem('access_token', newToken);
                
                // Update authorization header
                instance.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                
                processQueue(null, newToken);
                isRefreshing = false;
                
                // Retry original request with new token
                return instance(originalRequest);
            } else {
                throw new Error('No token in refresh response');
            }
        } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            
            // Clear token and redirect to login
            window.localStorage.removeItem('access_token');
            window.location.href = '/login';
            
            return Promise.reject(refreshError);
        }
    }

    //debugger
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // Return the error response data so the caller can check for success: false
    if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
});
export default instance;