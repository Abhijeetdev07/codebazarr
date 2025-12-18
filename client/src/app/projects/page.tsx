"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { projectAPI, categoryAPI } from "@/lib/api";
import { Project, Category } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

export default function ProjectsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter States
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getAll();
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Projects with Filters
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError("");
            try {
                const params: any = {};
                if (searchTerm) params.search = searchTerm;
                if (selectedCategory) params.category = selectedCategory;
                if (sortBy) params.sort = sortBy;

                const response = await projectAPI.getAll(params);
                if (response.data.success) {
                    setProjects(response.data.data);
                }
            } catch (err: any) {
                console.error("Failed to fetch projects:", err);
                setError("Failed to load projects. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();

        // Update URL params without reloading
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (selectedCategory) params.set("category", selectedCategory);
        router.push(`/projects?${params.toString()}`, { scroll: false });

    }, [searchTerm, selectedCategory, sortBy, router]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSortBy("newest");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Mobile Filter Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Explore Projects</h1>
                        <p className="text-gray-600 mt-1">Discover premium code templates and scripts</p>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                        <FiFilter /> Filters
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* SIDEBAR FILTERS */}
                    <aside className={`md:w-64 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>

                        {/* Search */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Sort By</h3>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>

                        {/* Categories */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Categories</h3>
                                {selectedCategory && (
                                    <button onClick={() => setSelectedCategory("")} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === ""}
                                        onChange={() => setSelectedCategory("")}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className={`text-sm ${selectedCategory === "" ? "font-semibold text-indigo-600" : "text-gray-600 group-hover:text-gray-900"}`}>
                                        All Categories
                                    </span>
                                </label>
                                {categories.map((cat) => (
                                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat._id}
                                            onChange={() => setSelectedCategory(cat._id)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className={`text-sm ${selectedCategory === cat._id ? "font-semibold text-indigo-600" : "text-gray-600 group-hover:text-gray-900"}`}>
                                            {cat.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Reset Button */}
                        {(searchTerm || selectedCategory || sortBy !== 'newest') && (
                            <button
                                onClick={clearFilters}
                                className="w-full py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                            >
                                <FiX /> Reset All Filters
                            </button>
                        )}

                    </aside>

                    {/* MAIN CONTENT GRID */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-80 bg-white rounded-2xl border border-gray-200 animate-pulse"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                                <p className="text-red-500">{error}</p>
                                <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 hover:underline">Try Again</button>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                                <div className="flex justify-center mb-4">
                                    <FiSearch className="h-12 w-12 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-full hover:bg-indigo-100 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project, index) => (
                                    <ProjectCard key={project._id} project={project} index={index} />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
