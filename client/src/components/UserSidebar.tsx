"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiX, FiLogOut, FiUser, FiHome, FiGrid } from "react-icons/fi";

interface UserSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        email: string;
        role?: string;
    } | null;
    onLogout: () => void;
}

export default function UserSidebar({ isOpen, onClose, user, onLogout }: UserSidebarProps) {
    const pathname = usePathname();

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const sidebar = document.getElementById('user-sidebar');
            const profileButton = document.getElementById('profile-button');

            if (isOpen && sidebar && !sidebar.contains(e.target as Node) &&
                profileButton && !profileButton.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const navLinks = [
        { name: "Home", href: "/", icon: FiHome },
        { name: "Projects", href: "/projects", icon: FiGrid },
    ];

    const isActive = (path: string) => pathname === path;

    const handleLinkClick = () => {
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Right Sidebar - Full width on mobile (≤400px), 320px on larger screens */}
            <div
                id="user-sidebar"
                className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header with User Info */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        {user ? (
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-indigo-200 flex-shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        ) : (
                            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <nav className="space-y-2">
                            {/* Main Navigation */}
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(link.href)
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                        }`}
                                >
                                    <link.icon className="h-5 w-5" />
                                    <span className="font-medium">{link.name}</span>
                                </Link>
                            ))}

                            {/* User Links */}
                            {user && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={handleLinkClick}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                                    >
                                        <FiUser className="h-5 w-5" />
                                        <span className="font-medium">Dashboard</span>
                                    </Link>

                                    {user.role === 'admin' && (
                                        <Link
                                            href="/admin/dashboard"
                                            onClick={handleLinkClick}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                                        >
                                            <FiGrid className="h-5 w-5" />
                                            <span className="font-medium">Admin Panel</span>
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Logout Button */}
                    {user && (
                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <FiLogOut className="h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
