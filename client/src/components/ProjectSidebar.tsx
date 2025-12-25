"use client";

import { useState } from "react";
import { FiShoppingCart, FiExternalLink, FiLayers, FiCalendar, FiStar } from "react-icons/fi";
import { Project } from "@/types";
import CheckoutModal from "./CheckoutModal";

interface ProjectSidebarProps {
    project: Project;
    pricing: null | {
        originalAmount: number;
        discountAmount: number;
        finalAmount: number;
        percentOff?: number;
    };
    couponInput: string;
    isApplyingCoupon: boolean;
    appliedCouponCode: string | null;
    couponError: string | null;
    isProcessing: boolean;
    handleApplyCoupon: () => Promise<void>;
    handleClearCoupon: () => void;
    handleBuyNow: () => void;
    setCouponInput: (val: string) => void;
    setCouponError: (val: string | null) => void;
    formatPrice: (price: number) => string;
    formatDate: (date: string) => string;
    avgRating: number;
    reviewCount: number;
    isMobile?: boolean;
}

export default function ProjectSidebar({
    project,
    pricing,
    couponInput,
    isApplyingCoupon,
    appliedCouponCode,
    couponError,
    isProcessing,
    handleApplyCoupon,
    handleClearCoupon,
    handleBuyNow,
    setCouponInput,
    setCouponError,
    formatPrice,
    formatDate,
    avgRating,
    reviewCount,
    isMobile = false
}: ProjectSidebarProps) {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${isMobile ? 'p-6' : 'p-6 md:p-8'}`}>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                {project.category?.name || "Uncategorized"}
            </span>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {project.title}
            </h1>

            <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                    <FiStar className={`h-4 w-4 ${reviewCount > 0 ? 'text-amber-500' : 'text-gray-300'}`} />
                    <span className="text-sm font-semibold text-gray-800">
                        {reviewCount > 0 ? avgRating.toFixed(1) : '0.0'}
                    </span>
                </div>
                <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
            </div>

            <div className={`flex items-center justify-between pb-4 border-b border-gray-100 ${isMobile ? '' : 'mb-6'}`}>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatPrice(pricing ? pricing.finalAmount : project.price)}
                    </p>
                    {/* Simplified pricing display in sidebar, full breakdown in modal */}
                    {pricing && (
                        <p className="text-sm text-green-600 font-medium">
                            {pricing.percentOff}% OFF applied
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-sm text-gray-500 mb-1">Released</p>
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                        <FiCalendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(project.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Coupon UI removed from here, moving to Modal */}

            <div className={`flex items-center gap-3 w-full ${isMobile ? 'mb-8' : 'mb-8'}`}>
                <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="flex-1 h-12 max-[420px]:h-10 inline-flex items-center justify-center gap-2 px-6 max-[420px]:px-2 bg-indigo-600 text-white font-bold text-sm max-[420px]:text-xs rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-200 whitespace-nowrap"
                >
                    <FiShoppingCart className="h-5 w-5 max-[420px]:h-3.5 max-[420px]:w-3.5" /> Checkout
                </button>

                {project.demoUrl && (
                    <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-12 max-[420px]:h-10 inline-flex items-center justify-center gap-2 px-6 max-[420px]:px-2 bg-white text-gray-700 font-bold text-sm max-[420px]:text-xs rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 active:bg-gray-50 transition-all whitespace-nowrap"
                    >
                        <FiExternalLink className="h-5 w-5 max-[420px]:h-3.5 max-[420px]:w-3.5" /> {isMobile ? "Live Preview" : "Preview"}
                    </a>
                )}
            </div>

            {/* Technologies */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiLayers className="h-4 w-4" /> Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                        <span
                            key={index}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                project={project}
                pricing={pricing}
                couponInput={couponInput}
                isApplyingCoupon={isApplyingCoupon}
                appliedCouponCode={appliedCouponCode}
                couponError={couponError}
                isProcessing={isProcessing}
                handleApplyCoupon={handleApplyCoupon}
                handleClearCoupon={handleClearCoupon}
                handleBuyNow={handleBuyNow}
                setCouponInput={setCouponInput}
                setCouponError={setCouponError}
                formatPrice={formatPrice}
                formatDate={formatDate}
            />
        </div>
    );
}
