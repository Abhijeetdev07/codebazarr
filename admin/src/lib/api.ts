import api from './axios';
import { AuthResponse } from '@/types';

export const authAPI = {
    login: (credentials: any) => api.post<AuthResponse>('/auth/login', credentials),
    getMe: () => api.get<{ success: boolean, data: any }>('/auth/me'),
    getAllUsers: () => api.get<{ success: boolean, count: number, data: any[] }>('/auth/users'),
};

export const projectAPI = {
    getAll: (params?: any) => api.get<{ success: boolean, count: number, data: any[] }>('/projects', { params }),
    getById: (id: string) => api.get<{ success: boolean, data: any }>(`/projects/${id}`),
    create: (data: FormData) => api.post<{ success: boolean, data: any }>('/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id: string, data: FormData | any) => api.put<{ success: boolean, data: any }>(`/projects/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    }),
    delete: (id: string) => api.delete<{ success: boolean }>(`/projects/${id}`),
};

export const orderAPI = {
    getAll: () => api.get<{ success: boolean, count: number, data: any[] }>('/orders'),
};

export const categoryAPI = {
    getAll: () => api.get<{ success: boolean, count: number, data: any[] }>('/categories'),
    create: (data: any) => api.post<{ success: boolean, data: any }>('/categories', data),
    update: (id: string, data: any) => api.put<{ success: boolean, data: any }>(`/categories/${id}`, data),
    delete: (id: string) => api.delete<{ success: boolean }>(`/categories/${id}`),
};

export const bannerAPI = {
    getAll: () => api.get<{ success: boolean, count: number, data: any[] }>('/banners/all'),
    create: (data: FormData) => api.post<{ success: boolean, data: any }>('/banners', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id: string, data: FormData | any) => api.put<{ success: boolean, data: any }>(`/banners/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    }),
    delete: (id: string) => api.delete<{ success: boolean }>(`/banners/${id}`),
};
