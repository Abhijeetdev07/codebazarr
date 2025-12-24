"use client";

import { useEffect, useMemo, useState } from "react";
import { reviewAPI } from "@/lib/api";
import { FiFilter, FiTrash2, FiMoreVertical, FiX, FiCheckSquare } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";

interface ReviewRow {
    _id: string;
    projectId?: {
        _id: string;
        title: string;
    };
    userId?: {
        _id: string;
        name: string;
        email: string;
    };
    rating: number;
    comment?: string;
    createdAt: string;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<ReviewRow[]>([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState<any>(null);

    const [bulkMode, setBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // Filters
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [sort, setSort] = useState<string>("recent");

    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [pagination, setPagination] = useState<any>(null);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit };
            if (ratingFilter !== "all") params.rating = ratingFilter;
            if (sort) params.sort = sort;

            const res = await reviewAPI.getAll(params);
            if (res.data.success) {
                setReviews(res.data.data || []);
                setPagination(res.data.pagination || null);
                setStats(res.data.stats || null);
            }
        } catch (error: any) {
            console.error("Failed to fetch reviews (raw error):", error);

            const responseData = error?.response?.data;
            const serverMessage =
                responseData?.message ||
                responseData?.error ||
                (responseData ? JSON.stringify(responseData) : null) ||
                error?.message ||
                "Failed to load reviews";

            console.error("Failed to fetch reviews (details):", {
                message: error?.message,
                status: error?.response?.status,
                data: responseData,
                url: error?.config?.url,
                params: error?.config?.params,
            });

            if (responseData) {
                try {
                    console.error(
                        "Failed to fetch reviews (response json):",
                        JSON.stringify(responseData, null, 2)
                    );
                } catch {
                    console.error("Failed to fetch reviews (response raw):", responseData);
                }
            }

            toast.error(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, limit, ratingFilter, sort]);

    const filteredReviews = useMemo(() => {
        return reviews;
    }, [reviews]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            await reviewAPI.delete(id);
            toast.success("Review deleted");
            fetchReviews();
        } catch (error) {
            console.error("Delete review error:", error);
            toast.error("Failed to delete review");
        }
    };

    const toggleSelected = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllVisible = () => {
        setSelectedIds(new Set(filteredReviews.map((r) => r._id)));
    };

    const clearSelected = () => {
        setSelectedIds(new Set());
    };

    const exitBulkMode = () => {
        setBulkMode(false);
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) {
            toast.error("Select at least one review");
            return;
        }

        if (!window.confirm(`Delete ${ids.length} selected review(s)?`)) return;

        setBulkDeleting(true);
        try {
            await Promise.allSettled(ids.map((id) => reviewAPI.delete(id)));
            toast.success("Selected reviews deleted");
            exitBulkMode();
            fetchReviews();
        } catch (error) {
            console.error("Bulk delete reviews error:", error);
            toast.error("Failed to delete selected reviews");
        } finally {
            setBulkDeleting(false);
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "N/A";
        }
    };

    const renderStars = (value: number) => {
        const rounded = Math.max(0, Math.min(5, Math.round(value || 0)));
        return (
            <div className="flex flex-wrap items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) =>
                    n <= rounded ? (
                        <FaStar key={n} className="h-4 w-4 text-amber-500" />
                    ) : (
                        <FaRegStar key={n} className="h-4 w-4 text-gray-300" />
                    )
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div>
                    <div className="h-8 bg-gray-200 rounded w-56"></div>
                    <div className="h-4 bg-gray-100 rounded w-80 mt-3"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm ${i === 3 ? 'col-span-2 md:col-span-1' : ''}`.trim()}>
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-10 bg-gray-300 rounded w-20"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="mt-4 h-3 bg-gray-100 rounded w-40"></div>
                            {i === 3 && (
                                <div className="mt-4 space-y-2">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <div key={n} className="flex items-center gap-3">
                                            <div className="h-4 bg-gray-200 rounded w-10"></div>
                                            <div className="flex-1 h-2 rounded-full bg-gray-200"></div>
                                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-9 bg-gray-200 rounded w-40"></div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="h-4 bg-gray-200 rounded w-14"></div>
                            <div className="h-9 bg-gray-200 rounded w-44"></div>
                            <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                                    <div className="mt-2 h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const totalLabel = stats?.totalReviews ?? pagination?.totalReviews ?? reviews.length;
    const avgRating = Number(stats?.averageRating || 0);
    const distribution = stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const totalForDist = Number(stats?.totalReviews || 0) || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Ratings &amp; Reviews</h1>
                <p className="text-sm text-gray-500 mt-1">Track and manage reviews for all your projects</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-700">Average Rating</div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                            {totalLabel > 0 ? avgRating.toFixed(1) : "0.0"}
                        </div>
                        {renderStars(avgRating)}
                    </div>
                    <div className="mt-3 text-xs md:text-sm text-gray-500">Based on {totalLabel} review(s)</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-700">Total Reviews</div>
                    <div className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-600">{totalLabel}</div>
                    <div className="mt-3 text-xs md:text-sm text-gray-500">Across all projects</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-2 md:col-span-1">
                    <div className="text-xs font-semibold text-gray-700 mb-3">Rating Distribution</div>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = Number(distribution?.[star] || 0);
                            const pct = totalForDist ? Math.round((count / totalForDist) * 100) : 0;
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <div className="w-10 flex items-center gap-1 text-sm font-semibold text-gray-700">
                                        <span>{star}</span>
                                        <FaStar className="h-3 w-3 text-gray-600" />
                                    </div>
                                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                                        <div
                                            className="h-2 bg-amber-500 rounded-full"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="w-8 text-right text-sm text-gray-600">{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <FiFilter className="text-gray-500" />
                        <div className="text-sm font-semibold text-gray-700">Filter by:</div>
                        <select
                            value={ratingFilter}
                            onChange={(e) => {
                                setRatingFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        >
                            <option value="all">All Ratings</option>
                            {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={String(n)}>{n} Stars</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        {bulkMode ? (
                            <>
                                <div className="text-sm font-semibold text-gray-700">
                                    Selected: <span className="text-gray-900">{selectedIds.size}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={selectAllVisible}
                                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                                    title="Select all"
                                >
                                    <FiCheckSquare className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={clearSelected}
                                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    disabled={bulkDeleting}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${bulkDeleting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={exitBulkMode}
                                    className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
                                    title="Cancel"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-sm font-semibold text-gray-700">Sort by:</div>
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        setPage(1);
                                    }}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="rating_high">Rating: High to Low</option>
                                    <option value="rating_low">Rating: Low to High</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setBulkMode(true)}
                                    className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
                                    title="Select reviews to delete"
                                >
                                    <FiMoreVertical className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredReviews.map((r) => (
                    <div key={r._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                {bulkMode && (
                                    <div className="mb-2">
                                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(r._id)}
                                                onChange={() => toggleSelected(r._id)}
                                            />
                                            Select
                                        </label>
                                    </div>
                                )}
                                <div className="text-base font-semibold text-gray-900">
                                    {r.projectId?.title || "Deleted Project"}
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                    {(r.userId?.name || "User")}
                                    {r.userId?.email ? ` • ${r.userId.email}` : ""}
                                    {r.createdAt ? ` • ${formatDate(r.createdAt)}` : ""}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {renderStars(Number(r.rating || 0))}
                                <div className="text-sm font-semibold text-gray-800">{Number(r.rating || 0).toFixed(1)}</div>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-700 whitespace-pre-line">
                            {r.comment?.trim() ? r.comment : "—"}
                        </div>
                    </div>
                ))}

                {filteredReviews.length === 0 && (
                    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
                        No reviews found.
                    </div>
                )}
            </div>

            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Page <span className="font-medium">{pagination.currentPage}</span> of <span className="font-medium">{pagination.totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={!pagination.hasPrevPage}
                            className={`px-3 py-2 rounded-lg border border-gray-200 text-sm ${pagination.hasPrevPage ? 'hover:bg-gray-50 text-gray-700' : 'text-gray-400 cursor-not-allowed'}`}
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!pagination.hasNextPage}
                            className={`px-3 py-2 rounded-lg border border-gray-200 text-sm ${pagination.hasNextPage ? 'hover:bg-gray-50 text-gray-700' : 'text-gray-400 cursor-not-allowed'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
