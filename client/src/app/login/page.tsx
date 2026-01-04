"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FiArrowRight } from "react-icons/fi";
import FloatingInput from "@/components/FloatingInput";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [authError, setAuthError] = useState<string | null>(null);
    const { login } = useAuth();

    const validate = () => {
        const nextErrors: { email?: string; password?: string } = {};

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            nextErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            nextErrors.email = "Enter a valid email";
        }

        if (!password) {
            nextErrors.password = "Password is required";
        } else if (password.length < 6) {
            nextErrors.password = "Password must be at least 6 characters";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        if (!validate()) return;

        setIsLoading(true);
        try {
            await login({ email: email.trim(), password });
        } catch (error: any) {
            const message = error?.response?.data?.message || "Login failed";
            if (typeof message === "string" && message.toLowerCase().includes("invalid")) {
                setAuthError("Invalid credentials");
            } else {
                setAuthError(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm space-y-8">
                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl shadow-indigo-100/50">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-indigo-600">Welcome Back</h1>
                        <p className="mt-2 text-sm text-gray-500">Sign in to manage users and products</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <FloatingInput
                                id="email"
                                name="email"
                                type="email"
                                label="Email Address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (authError) setAuthError(null);
                                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                                }}
                                error={errors.email}
                            />

                            <FloatingInput
                                id="password"
                                name="password"
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (authError) setAuthError(null);
                                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                                }}
                                error={errors.password}
                            />
                        </div>

                        {authError && (
                            <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 animate-pulse">
                                {authError}
                            </div>
                        )}


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                <>
                                    <FiArrowRight className="h-5 w-5" /> Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-500">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-bold text-indigo-600 transition-colors hover:text-indigo-500 hover:underline">
                                Sign up now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
