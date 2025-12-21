"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is logged in on mount
    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.getMe();
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Login function
    const login = async (credentials: any) => {
        try {
            const response = await authAPI.login(credentials);
            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem("token", token);
                setUser(user);
                toast.success("Login successful!");
                router.push("/"); // Redirect to home
            }
        } catch (error: any) {
            throw error;
        }
    };

    // Register function
    const register = async (userData: any) => {
        try {
            const response = await authAPI.register(userData);
            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem("token", token);
                setUser(user);
                toast.success("Registration successful!");
                router.push("/");
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Registration failed";
            toast.error(message);
            throw error; // Re-throw to handle in component if needed
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        toast.success("Logged out successfully");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
