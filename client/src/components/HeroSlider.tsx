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
    image: string;
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
            <div className="w-full max-w-[1500px] mx-auto px-4 mt-6">
                <div className="relative w-full h-[200px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg bg-gray-100 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-gray-200" />
                        <div className="h-2 w-6 rounded-full bg-gray-300" />
                        <div className="h-2 w-2 rounded-full bg-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    if (banners.length === 0) {
        // Fallback banner if no banners exist
        return (
            <div className="relative w-full h-[300px] md:h-[400px] bg-indigo-900 flex items-center justify-center">
                <div className="text-center text-white p-8">
                    {/* Minimal fallback content */}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1500px] mx-auto px-4 mt-6">
            <div className="relative w-full h-[200px] md:h-[400px] group rounded-2xl overflow-hidden shadow-lg">
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
                            <Link href="/projects" className="relative w-full h-full block">
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={banner.image}
                                        alt={banner.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </Link>
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
        </div>
    );
}
