import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Project } from "@/types";
import { FiX, FiCheck, FiCalendar, FiTag, FiCreditCard,} from "react-icons/fi";
import { RiShieldFlashFill } from "react-icons/ri";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
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
}

export default function CheckoutModal({
    isOpen,
    onClose,
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
}: CheckoutModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Clean up when unmounting
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiCreditCard className="text-indigo-600" />
                        Checkout
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Project Info */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                                    {project.category?.name || "Uncategorized"}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {project.title}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiCalendar className="h-4 w-4" />
                            <span>Released: {formatDate(project.createdAt)}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 border-dashed my-4"></div>

                    {/* Pricing Breakdown */}
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Project Price</span>
                            <span className="font-medium">{formatPrice(pricing ? pricing.originalAmount : project.price)}</span>
                        </div>

                        {pricing && pricing.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600 text-sm">
                                <span className="flex items-center gap-1">
                                    <FiTag className="h-3 w-3" />
                                    Discount ({appliedCouponCode})
                                </span>
                                <span className="font-medium">-{formatPrice(pricing.discountAmount)}</span>
                            </div>
                        )}

                        <div className="border-t border-gray-200 my-2"></div>

                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total To Pay</span>
                            <span className="text-2xl font-bold text-indigo-600">
                                {formatPrice(pricing ? pricing.finalAmount : project.price)}
                            </span>
                        </div>
                    </div>

                    {/* Coupon Section */}
                    <div>
                        {/* If no coupon applied, show input */}
                        {!appliedCouponCode ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    Have a coupon code?
                                </label>
                                <div className="flex flex-row gap-2">
                                    <input
                                        value={couponInput}
                                        onChange={(e) => {
                                            setCouponInput(e.target.value);
                                            if (couponError) setCouponError(null);
                                        }}
                                        placeholder="Enter code"
                                        className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 font-medium bg-gray-50"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isApplyingCoupon || !couponInput.trim()}
                                        className="px-4 h-10 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isApplyingCoupon ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{couponError}</p>
                                )}
                            </div>
                        ) : (
                            /* Applied Coupon State */
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <FiCheck className="h-3 w-3" />
                                    </div>
                                    <span className="text-sm font-medium text-green-800">
                                        Code <b>{appliedCouponCode}</b> applied!
                                    </span>
                                </div>
                                <button
                                    onClick={handleClearCoupon}
                                    className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleBuyNow}
                        disabled={isProcessing}
                        className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                Pay Securely
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
                        <RiShieldFlashFill className="h-3.5 w-3.5" />
                        Secure payment powered by Razorpay
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
}
