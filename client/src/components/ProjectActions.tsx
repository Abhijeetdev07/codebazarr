"use client";

import { FiShoppingCart, FiExternalLink } from "react-icons/fi";

interface ProjectActionsProps {
    onCheckoutClick: () => void;
    demoUrl?: string;
    isMobile?: boolean;
}

export default function ProjectActions({
    onCheckoutClick,
    demoUrl,
    isMobile = false,
}: ProjectActionsProps) {
    return (
        <div className={`flex items-center gap-3 w-full ${isMobile
            ? 'max-[500px]:bg-white max-[500px]:border-t max-[500px]:border-gray-100 max-[500px]:p-4 max-[500px]:fixed max-[500px]:bottom-0 max-[500px]:left-0 max-[500px]:right-0 max-[500px]:z-50 max-[500px]:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] min-[501px]:mb-8'
            : 'mb-8'}`}>
            <button
                onClick={onCheckoutClick}
                className="flex-1 h-12 max-[420px]:h-10 inline-flex items-center justify-center gap-2 px-6 max-[420px]:px-2 bg-indigo-600 text-white font-bold text-sm max-[420px]:text-xs rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-200 whitespace-nowrap"
            >
                <FiShoppingCart className="h-5 w-5 max-[420px]:h-3.5 max-[420px]:w-3.5" /> Checkout
            </button>

            {demoUrl && (
                <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-12 max-[420px]:h-10 inline-flex items-center justify-center gap-2 px-6 max-[420px]:px-2 bg-white text-gray-700 font-bold text-sm max-[420px]:text-xs rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 active:bg-gray-50 transition-all whitespace-nowrap"
                >
                    <FiExternalLink className="h-5 w-5 max-[420px]:h-3.5 max-[420px]:w-3.5" /> {isMobile ? "Live Preview" : "Preview"}
                </a>
            )}
        </div>
    );
}
