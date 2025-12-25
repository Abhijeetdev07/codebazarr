"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { reviewAPI, projectAPI } from "@/lib/api";
import { Review, User } from "@/types";
import { FiStar } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProjectReviewsProps {
    projectId: string;
    currentUser: User | null;
    avgRating: number;
    reviewCount: number;
    onReviewSubmitted: (updatedProject: any, updatedReviews: Review[]) => void;
}

export default function ProjectReviews({
    projectId,
    currentUser,
    avgRating,
    reviewCount,
    onReviewSubmitted
}: ProjectReviewsProps) {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewComment, setReviewComment] = useState<string>("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!projectId) return;
            setReviewsLoading(true);
            try {
                const response = await reviewAPI.getByProject(projectId, { limit: 10 });
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
    }, [projectId]);

    const getReviewerName = (review: Review) => {
        if (typeof review.userId === 'string') return 'User';
        return review.userId?.name || 'User';
    };

    const handleWriteReview = () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setShowReviewForm(true);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        if (!currentUser) {
            router.push('/login');
            return;
        }

        setSubmittingReview(true);
        try {
            const response = await reviewAPI.create(projectId, {
                rating: reviewRating,
                comment: reviewComment
            });

            if (response.data.success) {
                toast.success('Review submitted');
                setShowReviewForm(false);
                setReviewRating(5);
                setReviewComment('');

                // Parallel re-fetch
                const [reviewsRes, projectRes] = await Promise.all([
                    reviewAPI.getByProject(projectId, { limit: 10 }),
                    projectAPI.getById(projectId)
                ]);

                if (reviewsRes.data.success && projectRes.data.success) {
                    setReviews(reviewsRes.data.data);
                    // Notify parent to update main project stats
                    onReviewSubmitted(projectRes.data.data, reviewsRes.data.data);
                }
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

    return (
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
    );
}
