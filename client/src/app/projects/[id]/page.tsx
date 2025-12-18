"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { projectAPI } from "@/lib/api";
import { Project } from "@/types";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiExternalLink, FiCheck, FiArrowLeft, FiLayers, FiCalendar } from "react-icons/fi";
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

    const handleBuyNow = () => {
        if (project && project._id) {
            handlePayment(project._id);
        }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="text-center">
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
        <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb / Back Link */}
                <Link href="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
                    <FiArrowLeft /> Back to Projects
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* LEFT COLUMN - Images */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 overflow-hidden">
                            {/* Main Slider */}
                            <Swiper
                                style={{
                                    "--swiper-navigation-color": "#fff",
                                    "--swiper-pagination-color": "#fff",
                                } as any}
                                spaceBetween={10}
                                navigation={true}
                                thumbs={{ swiper: thumbsSwiper }}
                                modules={[FreeMode, Navigation, Thumbs]}
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

                        {/* Description & Details */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this project</h2>
                            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {project.description}
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
                    </div>

                    {/* RIGHT COLUMN - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">

                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                {project.category?.name || "Uncategorized"}
                            </span>

                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                {project.title}
                            </h1>

                            <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Price</p>
                                    <p className="text-3xl font-bold text-gray-900">{formatPrice(project.price)}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-sm text-gray-500 mb-1">Released</p>
                                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                                        <FiCalendar className="h-4 w-4 text-gray-400" />
                                        <span>{formatDate(project.createdAt)}</span>
                                    </div>
                                </div>
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
