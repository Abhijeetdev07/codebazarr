"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryAPI } from "@/lib/api";
import * as Icons from "react-icons/fi";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon?: string;
    projectCount?: number;
}

export default function CategorySection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getAll();
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse mx-auto"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Browse by Category
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Find the perfect project for your needs from our diverse collection of high-quality code.
                    </p>
                </div>

                {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> */}
                <div className="flex overflow-x-auto pb-8 gap-6 px-4 snap-x hide-scrollbar mx-auto w-fit max-w-full">
                    {categories.map((category) => {
                        // Dynamically get icon from react-icons based on backend icon field
                        const iconName = category.icon || 'FiBox';
                        const IconComponent = (Icons as any)[iconName] || Icons.FiBox;

                        return (
                            <Link
                                href={`/projects?category=${category._id}`}
                                key={category._id}
                                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 transform hover:-translate-y-1 min-w-[200px] flex-shrink-0 snap-center"
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="h-14 w-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <IconComponent className="h-7 w-7" />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                                            {category.name}
                                        </h3>
                                        {category.projectCount !== undefined && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {category.projectCount} Projects
                                            </p>
                                        )}
                                    </div>

                                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-indigo-50 pointer-events-none transition-colors duration-300" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* <div className="mt-12 text-center">
                    <Link href="/categories" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                        View All Categories <span className="ml-2">→</span>
                    </Link>
                </div> */}
            </div>
        </section>
    );
}
