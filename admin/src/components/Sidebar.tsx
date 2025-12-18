"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiHome,
    FiBox,
    FiGrid,
    FiImage,
    FiShoppingBag,
    FiUsers,
    FiSettings,
    FiX
} from "react-icons/fi";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome },
    { name: "Projects", href: "/dashboard/projects", icon: FiBox },
    { name: "Categories", href: "/dashboard/categories", icon: FiGrid },
    { name: "Banners", href: "/dashboard/banners", icon: FiImage },
    { name: "Orders", href: "/dashboard/orders", icon: FiShoppingBag },
    { name: "Users", href: "/dashboard/users", icon: FiUsers },
    { name: "Settings", href: "/dashboard/settings", icon: FiSettings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 lg:static lg:block
            `}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                        CodeBazar
                    </span>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className="mb-4 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Main Menu
                    </div>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${isActive
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }
                                `}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
