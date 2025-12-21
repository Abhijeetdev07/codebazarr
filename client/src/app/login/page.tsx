"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10 sm:py-12 sm:px-6 lg:px-8 ">
            <div className="mx-auto flex w-full max-w-md flex-col justify-center">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Welcome back</h1>
                        <p className="text-xs text-gray-600 sm:text-sm">Sign in to access your projects</p>
                    </div>

                    <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-gray-700 sm:text-sm">
                                Email
                            </label>
                            <div className="relative mt-1.5 sm:mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <FiMail />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className={`block w-full rounded-xl border bg-white py-2 pl-10 pr-3 text-xs text-gray-900 shadow-sm outline-none transition sm:py-2.5 sm:text-sm ${errors.email || authError
                                        ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                                        : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        }`}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (authError) setAuthError(null);
                                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                                    }}
                                    aria-invalid={Boolean(errors.email)}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-[11px] text-red-600 sm:mt-2 sm:text-xs">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-gray-700 sm:text-sm">
                                Password
                            </label>
                            <div className="relative mt-1.5 sm:mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <FiLock />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className={`block w-full rounded-xl border bg-white py-2 pl-10 pr-10 text-xs text-gray-900 shadow-sm outline-none transition sm:py-2.5 sm:text-sm ${errors.password || authError
                                        ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                                        : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        }`}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (authError) setAuthError(null);
                                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                                    }}
                                    aria-invalid={Boolean(errors.password)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-[11px] text-red-600 sm:mt-2 sm:text-xs">{errors.password}</p>
                            )}
                            {authError && (
                                <p className="mt-1.5 text-[11px] text-red-600 sm:mt-2 sm:text-xs">{authError}</p>
                            )}
                        </div>

                        <p className="text-left text-xs text-gray-600 sm:text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                sign up
                            </Link>
                        </p>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5 sm:text-sm"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
