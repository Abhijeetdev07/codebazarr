"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import UserSidebar from "./UserSidebar";
import logo from "../assets/logo.png";

export default function Navbar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        setIsSidebarOpen(false);
    };

    return (
        <>
            <nav className="fixed w-full z-50 transition-all duration-300 bg-white backdrop-blur-md shadow-sm border-b border-gray-100 py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    src={logo}
                                    alt="CodeBazar Logo"
                                    width={150}
                                    height={40}
                                    className="h-10 w-auto object-contain"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Right Section - Auth */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <button
                                    id="profile-button"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* User Sidebar Component */}
            <UserSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
            />
        </>
    );
}
