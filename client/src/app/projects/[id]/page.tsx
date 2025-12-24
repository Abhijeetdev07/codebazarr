"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { couponAPI, projectAPI, reviewAPI } from "@/lib/api";
import { Project, Review } from "@/types";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiExternalLink, FiCheck, FiArrowLeft, FiLayers, FiCalendar, FiStar } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { handlePayment, isProcessing } = useRazorpay();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewComment, setReviewComment] = useState<string>("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const [couponInput, setCouponInput] = useState<string>("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [pricing, setPricing] = useState<null | {
        originalAmount: number;
        discountAmount: number;
        finalAmount: number;
        percentOff?: number;
    }>(null);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;

            try {
                const response = await projectAPI.getById(id as string);
                if (response.data.success) {
                    setProject(response.data.data);
                }
            } catch (err: any) {
                console.error("Failed to fetch project:", err);
                setError(err.response?.data?.message || "Failed to load project details");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    useEffect(() => {
        setCouponInput("");
        setAppliedCouponCode(null);
        setPricing(null);
        setCouponError(null);
    }, [project?._id]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            setReviewsLoading(true);
            try {
                const response = await reviewAPI.getByProject(id as string, { limit: 10 });
                if (response.data.success) {
                    setReviews(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [id]);

    const handleBuyNow = () => {
        if (project && project._id) {
            handlePayment(project._id, appliedCouponCode || undefined);
        }
    };

    const handleApplyCoupon = async () => {
        if (!project?._id) return;

        const code = couponInput.trim();
        if (!code) {
            setAppliedCouponCode(null);
            setPricing(null);
            setCouponError(null);
            return;
        }

        setIsApplyingCoupon(true);
        setCouponError(null);
        try {
            const res = await couponAPI.apply(project._id, code);
            if (!res.data?.success) {
                throw new Error(res.data?.message || 'Failed to apply coupon');
            }

            const data = res.data.data;
            setPricing({
                originalAmount: Number(data.originalAmount || 0),
                discountAmount: Number(data.discountAmount || 0),
                finalAmount: Number(data.finalAmount || 0),
                percentOff: Number(data.percentOff || 0),
            });
            setAppliedCouponCode(code.toUpperCase());
            setCouponError(null);
        } catch (err: any) {
            setAppliedCouponCode(null);
            setPricing(null);
            const apiMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Invalid coupon';
  
            if (String(apiMessage).toLowerCase().includes('already been used')) {
                setCouponError('This coupon is expired');
            } else {
                setCouponError(String(apiMessage));
            }
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleClearCoupon = () => {
        setCouponInput("");
        setAppliedCouponCode(null);
        setPricing(null);
        setCouponError(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const avgRating = project?.avgRating ?? project?.rating ?? 0;
    const reviewCount = project?.reviewCount ?? 0;

    const getReviewerName = (review: Review) => {
        if (typeof review.userId === 'string') return 'User';
        return review.userId?.name || 'User';
    };

    const handleWriteReview = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setShowReviewForm(true);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (!user) {
            router.push('/login');
            return;
        }

        setSubmittingReview(true);
        try {
            const response = await reviewAPI.create(id as string, {
                rating: reviewRating,
                comment: reviewComment
            });

            if (response.data.success) {
                toast.success('Review submitted');
                setShowReviewForm(false);
                setReviewRating(5);
                setReviewComment('');

                const [reviewsRes, projectRes] = await Promise.all([
                    reviewAPI.getByProject(id as string, { limit: 10 }),
                    projectAPI.getById(id as string)
                ]);

                if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
                if (projectRes.data.success) setProject(projectRes.data.data);
            }
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.[0]?.msg ||
                'Failed to submit review';
            toast.error(message);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center relative font-sans">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.4] pointer-events-none invert"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 relative z-10"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 relative font-sans">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.4] pointer-events-none invert"></div>
                <div className="text-center relative z-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || "The project you're looking for doesn't exist."}</p>
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiArrowLeft /> Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 lg:py-12 relative font-sans">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.4] pointer-events-none invert"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Breadcrumb / Back Link */}
                <Link href="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
                    <FiArrowLeft /> Back to Projects
                </Link>

                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* LEFT COLUMN - Images and content */}
                    <div className="lg:col-span-2 flex flex-col gap-6 order-1">
                        {/* Images - Always first */}
                        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 overflow-hidden">
                            {/* Main Slider */}
                            <Swiper
                                style={{
                                    "--swiper-navigation-color": "#fff",
                                    "--swiper-pagination-color": "#fff",
                                } as any}
                                spaceBetween={10}
                                navigation={false}
                                thumbs={{ swiper: thumbsSwiper }}
                                modules={[FreeMode, Thumbs]}
                                className="mySwiper2 w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-xl mb-2"
                            >
                                {project.images.map((img, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={img}
                                                alt={`${project.title} - Image ${index + 1}`}
                                                fill
                                                className="object-cover rounded-xl"
                                                priority={index === 0}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Thumbs Slider */}
                            {project.images.length > 1 && (
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={10}
                                    slidesPerView={4}
                                    freeMode={true}
                                    watchSlidesProgress={true}
                                    modules={[FreeMode, Navigation, Thumbs]}
                                    className="mySwiper thumbs-slider h-20 sm:h-24 w-full"
                                >
                                    {project.images.map((img, index) => (
                                        <SwiperSlide key={index} className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity !w-auto">
                                            <div className="relative h-full w-24 sm:w-32 rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500">
                                                <Image
                                                    src={img}
                                                    alt={`Thumb ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}
                        </div>

                        {/* Sidebar content - Shows here on mobile/tablet only */}
                        <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

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

                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
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

                            <div className="mb-6">
                                <p className="text-sm font-semibold text-gray-900 mb-2">Coupon Code</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        value={couponInput}
                                        onChange={(e) => {
                                            const next = e.target.value;
                                            setCouponInput(next);
                                            if (couponError) setCouponError(null);
                                            if (appliedCouponCode && next.trim().toUpperCase() !== appliedCouponCode) {
                                                setAppliedCouponCode(null);
                                                setPricing(null);
                                            }
                                        }}
                                        placeholder="Enter coupon"
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

                            <div className="flex flex-wrap items-center gap-3 mb-8 justify-start">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isProcessing}
                                    className={`inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 active:transform active:scale-95 transition-all shadow-lg hover:shadow-indigo-200 whitespace-nowrap ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
                                        <FiExternalLink className="h-5 w-5" /> Live Preview
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

                        {/* Features List */}
                        {project.features && project.features.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="mt-1 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                                                <FiCheck className="h-3 w-3" />
                                            </div>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description & Details */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this project</h2>
                            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {project.description}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                                    <p className="text-sm text-gray-500 mt-1">{reviewCount} review(s) • {reviewCount > 0 ? avgRating.toFixed(1) : '0.0'} average</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleWriteReview}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                                >
                                    Write a review
                                </button>
                            </div>

                            {showReviewForm && (
                                <form onSubmit={submitReview} className="mb-8 p-4 rounded-xl border border-gray-200 bg-gray-50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Rating</label>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((n) => {
                                                    const active = n <= reviewRating;
                                                    return (
                                                        <button
                                                            key={n}
                                                            type="button"
                                                            onClick={() => setReviewRating(n)}
                                                            className="p-1 rounded-md hover:bg-white"
                                                            aria-label={`Set rating to ${n}`}
                                                        >
                                                            {active ? (
                                                                <FaStar className="h-6 w-6 text-amber-500" />
                                                            ) : (
                                                                <FaRegStar className="h-6 w-6 text-gray-300" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                                <span className="ml-2 text-sm font-semibold text-gray-800">
                                                    {reviewRating}/5
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Comment</label>
                                            <textarea
                                                value={reviewComment}
                                                onChange={(e) => {
                                                    const next = e.target.value;
                                                    setReviewComment(next.length <= 200 ? next : next.slice(0, 200));
                                                }}
                                                placeholder="Share your experience (optional)"
                                                className="w-full p-2 border border-gray-300 rounded-lg bg-white min-h-[96px] text-gray-900 placeholder:text-gray-500"
                                                maxLength={200}
                                            />
                                            <div className="mt-1 text-xs text-gray-500 text-right">
                                                {reviewComment.length}/200
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className={`px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors ${submittingReview ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowReviewForm(false)}
                                            className="px-4 py-2 bg-white text-gray-700 text-sm font-bold rounded-xl border border-gray-300 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {reviewsLoading ? (
                                <div className="text-gray-600">Loading reviews...</div>
                            ) : reviews.length === 0 ? (
                                <div className="text-gray-600">No reviews yet. Be the first to review.</div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((r) => (
                                        <div key={r._id} className="p-4 rounded-xl border border-gray-200">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="font-semibold text-gray-900">{getReviewerName(r)}</div>
                                                <div className="flex items-center gap-1 text-gray-800">
                                                    <FiStar className="h-4 w-4 text-amber-500" />
                                                    <span className="text-sm font-semibold">{Number(r.rating).toFixed(0)}</span>
                                                </div>
                                            </div>
                                            {r.comment ? (
                                                <p className="text-gray-700 mt-2">{r.comment}</p>
                                            ) : null}
                                            <div className="text-xs text-gray-500 mt-2">{new Date(r.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Sticky Sidebar (Desktop only) */}
                    <div className="hidden lg:block lg:col-span-1 order-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">

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

                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
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

                            <div className="mb-6">
                                <p className="text-sm font-semibold text-gray-900 mb-2">Coupon Code</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        value={couponInput}
                                        onChange={(e) => {
                                            const next = e.target.value;
                                            setCouponInput(next);
                                            if (couponError) setCouponError(null);
                                            if (appliedCouponCode && next.trim().toUpperCase() !== appliedCouponCode) {
                                                setAppliedCouponCode(null);
                                                setPricing(null);
                                            }
                                        }}
                                        placeholder="Enter coupon"
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

                            <div className="space-y-4 mb-8">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isProcessing}
                                    className={`w-full flex items-center justify-center gap-2 py-4 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:transform active:scale-95 transition-all shadow-lg hover:shadow-indigo-200 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
                                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 active:bg-gray-50 transition-all"
                                    >
                                        <FiExternalLink className="h-5 w-5" /> Live Preview
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
                    </div>

                </div>
            </div>
        </div>
    );
}
