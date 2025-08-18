import axios from 'axios';

// The NGINX proxy will route any request starting with /api to the backend service
const api = axios.create({ baseURL: '/api' });

// --- Document Management ---
export const getDocuments = () => api.get('/documents/');
export const getDocumentDetails = (docId) => api.get(`/documents/${docId}`);
export const getPdfUrl = (docId) => `/api/pdf/${docId}`;
export const uploadDocument = (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/', formData, { onUploadProgress });
};

// --- Local AI Recommendations ---
export const getRecommendations = (docId) => api.post('/recommendations/', { doc_id: docId });

// --- Cloud AI Features (Follow-on) ---
export const getLlmInsights = (docId) => api.post('/llm-insights/', { doc_id: docId });
export const generatePodcast = (docId) => api.post('/generate-podcast/');
