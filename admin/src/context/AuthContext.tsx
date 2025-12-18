"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authAPI } from "@/lib/api";
import { User } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const checkAuth = async () => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            setLoading(false);
            if (pathname !== "/login") {
                router.push("/login");
            }
            return;
        }

        try {
            const response = await authAPI.getMe();
            if (response.data.success) {
                const userData = response.data.data;
                // Strict Admin Check
                if (userData.role !== 'admin') {
                    toast.error("Access Denied: Admin privileges required");
                    logout();
                    return;
                }
                setUser(userData);
            } else {
                logout();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        if (userData.role !== 'admin') {
            toast.error("Access Denied: Not an admin account");
            return;
        }
        localStorage.setItem("adminToken", token);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("adminToken");
        setUser(null);
        router.push("/login"); // Force redirect to login
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
