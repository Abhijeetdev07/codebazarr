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
import ProjectReviews from "@/components/ProjectReviews";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";
import ProjectSidebar from "@/components/ProjectSidebar";

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


    // Reviews state moved to component

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
        setCouponInput("");
        setAppliedCouponCode(null);
        setPricing(null);
        setCouponError(null);
    }, [project?._id]);

    // Reviews fetching moved to component

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

                        {/* Sidebar content - Shows here on mobile/tablet only ok*/}
                        <div className="lg:hidden">
                            <ProjectSidebar
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
                                avgRating={avgRating}
                                reviewCount={reviewCount}
                                isMobile={true}
                            />
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

                        <ProjectReviews
                            projectId={id as string}
                            currentUser={user}
                            avgRating={avgRating}
                            reviewCount={reviewCount}
                            onReviewSubmitted={(updatedProject) => {
                                setProject(updatedProject);
                            }}
                        />
                    </div>

                    {/* RIGHT COLUMN - Sticky Sidebar (Desktop only) */}
                    <div className="hidden lg:block lg:col-span-1 order-2">
                        <div className="sticky top-24">
                            <ProjectSidebar
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
                                avgRating={avgRating}
                                reviewCount={reviewCount}
                                isMobile={false}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
