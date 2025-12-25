"use client";

import { FiShoppingCart, FiExternalLink, FiLayers, FiCalendar, FiStar } from "react-icons/fi";
import { Project } from "@/types";

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

            <div className={`flex items-center justify-between pb-4 border-b border-gray-100 ${isMobile ? '' : 'mb-2 pb-2'}`}>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatPrice(pricing ? pricing.finalAmount : project.price)}
                    </p>
                    {pricing ? (
                        <div className="mt-2 space-y-1 text-sm">
                            <div className="flex items-center justify-between text-gray-600">
                                <span>Original</span>
                                <span className="font-semibold">{formatPrice(pricing.originalAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-green-700">
                                <span>Discount</span>
                                <span className="font-semibold">-{formatPrice(pricing.discountAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-900">
                                <span className="font-semibold">Final</span>
                                <span className="font-bold">{formatPrice(pricing.finalAmount)}</span>
                            </div>
                        </div>
                    ) : null}
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-sm text-gray-500 mb-1">Released</p>
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                        <FiCalendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(project.createdAt)}</span>
                    </div>
                </div>
            </div>

            <div className={`${isMobile ? 'mb-6' : 'mb-4 mt-4'}`}>
                <p className="text-sm font-semibold text-gray-900 mb-2">Coupon Code</p>
                <div className="flex items-center gap-2">
                    <input
                        value={couponInput}
                        onChange={(e) => {
                            const next = e.target.value;
                            setCouponInput(next);
                            if (couponError) setCouponError(null);
                        }}
                        placeholder="Enter Coupon"
                        className="w-40 h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className={`h-11 px-4 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 ${isApplyingCoupon ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                </div>
                {appliedCouponCode ? (
                    <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-green-700 font-semibold">Applied: {appliedCouponCode}</span>
                        <button type="button" onClick={handleClearCoupon} className="text-gray-600 hover:text-gray-900 font-semibold">
                            Clear
                        </button>
                    </div>
                ) : null}
                {couponError ? (
                    <div className="mt-2 text-sm font-semibold text-red-600">
                        {couponError}
                    </div>
                ) : null}
            </div>

            <div className={`flex items-center gap-3 ${isMobile ? 'mb-8 justify-start flex-wrap' : 'mb-4 justify-center'}`}>
                <button
                    onClick={handleBuyNow}
                    disabled={isProcessing}
                    className={`inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-200 whitespace-nowrap ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isProcessing ? (
                        <>
                            <div className={`animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent`}></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <FiShoppingCart className="h-5 w-5" /> Buy Now
                        </>
                    )}
                </button>

                {project.demoUrl && (
                    <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-white text-gray-700 font-bold text-sm rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 active:bg-gray-50 transition-all whitespace-nowrap"
                    >
                        <FiExternalLink className="h-5 w-5" /> {isMobile ? "Live Preview" : "Preview"}
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
        </div>
    );
}
