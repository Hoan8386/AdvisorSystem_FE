import axios from 'axios';

// Tạo axios instance riêng cho RAG API
const ragAxios = axios.create({
  baseURL: import.meta.env.VITE_CHATBOT, // URL của RAG API
  timeout: 600000, // 60 giây cho các request upload lớn
});

// Interceptor để thêm token
ragAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== DOCUMENT MANAGEMENT APIs ==========

/**
 * Upload tài liệu mới
 * @param {File} file - File upload
 * @param {string} uploadedBy - Tên người upload
 */
export const uploadDocumentAPI = (file, uploadedBy) => {
  console.log("uploadDocumentAPI called with:", {
    file: file,
    fileName: file?.name,
    fileType: file?.type,
    fileSize: file?.size,
    uploadedBy: uploadedBy,
  });

  const formData = new FormData();
  formData.append('file', file, file.name); // Thêm filename
  formData.append('uploaded_by', uploadedBy);
  
  // Log FormData entries
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ', pair[1]);
  }
  
  // Không set Content-Type, để axios tự động set
  return ragAxios.post('/documents/vector/add', formData);
};

/**
 * Lấy danh sách tất cả tài liệu
 * @param {Object} params - { file_type, q, limit, skip }
 */
export const getAllDocumentsAPI = (params = {}) => {
  return ragAxios.get('/documents/list', {
    params: {
      limit: params.limit || 100,
      skip: params.skip || 0,
      file_type: params.file_type,
      q: params.q,
    },
  });
};

/**
 * Lấy thông tin chi tiết tài liệu
 * @param {string} docId - ID của document
 */
export const getDocumentDetailAPI = (docId) => {
  return ragAxios.get(`/documents/vector/${docId}`);
};

/**
 * Cập nhật thông tin tài liệu
 * @param {string} docId - ID của document
 * @param {Object} updateData - { filename, uploaded_by, force_re_embed }
 */
export const updateDocumentAPI = (docId, updateData) => {
  const formData = new FormData();
  
  if (updateData.filename) {
    formData.append('filename', updateData.filename);
  }
  if (updateData.uploaded_by) {
    formData.append('uploaded_by', updateData.uploaded_by);
  }
  if (updateData.force_re_embed !== undefined) {
    formData.append('force_re_embed', updateData.force_re_embed);
  }
  
  return ragAxios.put(`/documents/vector/${docId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Xóa tài liệu
 * @param {string} docId - ID của document
 */
export const deleteDocumentAPI = (docId) => {
  return ragAxios.delete(`/documents/vector/${docId}`);
};

// ========== SEARCH & QUERY APIs ==========

/**
 * Tìm kiếm vector
 * @param {Object} searchParams - { query, k, similarity_threshold }
 */
export const vectorSearchAPI = (searchParams) => {
  return ragAxios.post('/documents/vector/search', {
    query: searchParams.query,
    k: searchParams.k || 5,
    similarity_threshold: searchParams.similarity_threshold || 0.0,
  });
};

/**
 * Tìm kiếm với LLM
 * @param {Object} searchParams - { query, k, similarity_threshold }
 */
export const searchWithLLMAPI = (searchParams) => {
  return ragAxios.post('/documents/vector/search-with-llm', {
    query: searchParams.query,
    k: searchParams.k || 3,
    similarity_threshold: searchParams.similarity_threshold || 0.75,
  });
};

/**
 * Xử lý truy vấn với Agent (LangGraph)
 * @param {Object} queryParams - { query, thread_id }
 */
export const processQueryAPI = (queryParams) => {
  return ragAxios.post('/documents/vector/process-query', {
    query: queryParams.query,
    thread_id: queryParams.thread_id || null,
  });
};

// ========== HEALTH CHECK ==========

/**
 * Kiểm tra trạng thái RAG service
 */
export const checkRAGHealthAPI = () => {
  return ragAxios.get('/health');
};

export default ragAxios;
