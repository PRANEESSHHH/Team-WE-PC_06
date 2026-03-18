// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  UPLOAD_INITIATE: `${API_BASE_URL}/upload/initiate`,
  UPLOAD_PRESIGNED_URLS: `${API_BASE_URL}/upload/presigned-urls`,
  UPLOAD_COMPLETE: `${API_BASE_URL}/upload/complete`,
  UPLOAD_ABORT: `${API_BASE_URL}/upload/abort`,
  FILES: (userId) => `${API_BASE_URL}/files/${userId}`,
  FILE_DOWNLOAD: (fileId) => `${API_BASE_URL}/files/download/${fileId}`,
  FILE_DELETE: (fileId) => `${API_BASE_URL}/files/${fileId}`,
};

export default API_BASE_URL;
