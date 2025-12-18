"use client";

import { useAuth } from "@/context/AuthContext";
import { FiMenu, FiBell, FiLogOut, FiUser } from "react-icons/fi";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
                >
                    <FiMenu className="h-6 w-6" />
                </button>
                <h2 className="text-gray-500 text-sm hidden sm:block">
                    Admin Dashboard
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
                    <FiBell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || "Admin"}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-50">
                        {user?.name?.charAt(0).toUpperCase() || <FiUser />}
                    </div>

                    <button
                        onClick={logout}
                        title="Logout"
                        className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <FiLogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
