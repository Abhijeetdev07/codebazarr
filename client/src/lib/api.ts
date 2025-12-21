import api from './axios';

// Auth APIs
export const authAPI = {
    register: (userData: any) => api.post('/auth/register', userData),
    login: (credentials: any) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
};

// Project APIs
export const projectAPI = {
    getAll: (params?: any) => api.get('/projects', { params }),
    getById: (id: string) => api.get(`/projects/${id}`),
    // Admin only
    create: (projectData: FormData) => api.post('/projects', projectData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id: string, projectData: FormData) => api.put(`/projects/${id}`, projectData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id: string) => api.delete(`/projects/${id}`),
};

// Category APIs
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    // Admin only
    create: (categoryData: any) => api.post('/categories', categoryData),
    update: (id: string, categoryData: any) => api.put(`/categories/${id}`, categoryData),
    delete: (id: string) => api.delete(`/categories/${id}`),
};

// Banner APIs
export const bannerAPI = {
    getAll: () => api.get('/banners'),
    // Admin only
    create: (bannerData: FormData) => api.post('/banners', bannerData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id: string, bannerData: FormData) => api.put(`/banners/${id}`, bannerData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id: string) => api.delete(`/banners/${id}`),
    toggle: (id: string) => api.patch(`/banners/${id}/toggle`),
};

// Payment APIs (Razorpay)
export const paymentAPI = {
    createOrder: (projectId: string) => api.post('/payment/create-order', { projectId }),
    verifyPayment: (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        projectId: string;
    }) => api.post('/payment/verify', paymentData),
    markFailed: (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id?: string;
        projectId?: string;
    }) => api.post('/payment/failed', paymentData),
};

// Order APIs
export const orderAPI = {
    getMyOrders: () => api.get('/orders/my-orders'),
    getAllOrders: () => api.get('/orders'), // Admin only
};

export const reviewAPI = {
    getByProject: (projectId: string, params?: any) => api.get(`/reviews/project/${projectId}`, { params }),
    create: (projectId: string, payload: { rating: number; comment?: string }) => api.post(`/reviews/project/${projectId}`, payload),
    update: (reviewId: string, payload: { rating?: number; comment?: string }) => api.put(`/reviews/${reviewId}`, payload),
    delete: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
};
