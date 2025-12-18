export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    data: User;
}

export interface ApiError {
    message: string;
    response?: {
        data?: {
            message: string;
        };
    };
}
