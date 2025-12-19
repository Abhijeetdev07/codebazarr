"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { bannerAPI } from "@/lib/api";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface Banner {
    _id: string;
    title: string;
    subtitle: string;
    image: string;
    order: number;
}

export default function HeroSlider() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await bannerAPI.getAll();
                if (response.data.success) {
                    setBanners(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[300px] md:h-[400px] bg-gray-100 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading banners...</div>
            </div>
        );
    }

    if (banners.length === 0) {
        // Fallback banner if no banners exist
        return (
            <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-center">
                <div className="text-center text-white p-8">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to CodeBazar</h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8">Premium Coding Projects Marketplace</p>
                    <Link href="/projects" className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-full hover:bg-gray-100 transition-colors">
                        Explore Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[300px] md:h-[400px] group">
            <Swiper
                spaceBetween={0}
                centeredSlides={true}
                effect={"fade"}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                modules={[Autoplay, Pagination, EffectFade]}
                className="mySwiper w-full h-full"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner._id}>
                        <div className="relative w-full h-full">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={banner.image}
                                    alt={banner.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="relative h-full flex items-center justify-center text-center px-4">
                                <div className="max-w-4xl space-y-6">
                                    <h2
                                        className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight animate-fade-in-up"
                                        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                                    >
                                        {banner.title}
                                    </h2>
                                    {banner.subtitle && (
                                        <p className="text-lg md:text-2xl text-gray-200 font-medium max-w-2xl mx-auto">
                                            {banner.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Styles for Swiper Pagination */}
            <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #ffffff;
          width: 24px;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
}
