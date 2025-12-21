"use client";

import Image from "next/image";
import Link from "next/link";
import { FiEye, FiStar } from "react-icons/fi";
import { Project } from "@/types";

interface ProjectCardProps {
    project: Project;
    index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const avgRating = project.avgRating ?? project.rating ?? 0;
    const reviewCount = project.reviewCount ?? 0;

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full animate-fade-in-up opacity-0"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
        >
            {/* Image Container */}
            <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                <Image
                    src={project.images[0] || "/placeholder-project.png"}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 4} // Load first 4 images immediately
                    loading={index < 4 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay with Actions */}


                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur text-indigo-600 rounded-full shadow-sm">
                        {project.category?.name || "Uncategorized"}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">
                        {project.description}
                    </p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                        <FiStar className={`h-4 w-4 ${reviewCount > 0 ? 'text-amber-500' : 'text-gray-300'}`} />
                        <span className="text-sm font-semibold text-gray-800">
                            {reviewCount > 0 ? avgRating.toFixed(1) : '0.0'}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500">
                        ({reviewCount} reviews)
                    </span>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.technologies.length > 3 && (
                        <span className="px-2 py-1 text-[10px] font-medium bg-gray-50 text-gray-400 rounded-md">
                            +{project.technologies.length - 3}
                        </span>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium">Price</span>
                        <span className="text-lg font-bold text-gray-900">
                            {formatPrice(project.price)}
                        </span>
                    </div>

                    <Link
                        href={`/projects/${project._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300"
                    >
                        <FiEye className="h-4 w-4" />
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
