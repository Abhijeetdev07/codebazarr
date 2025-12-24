"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminCouponAPI } from "@/lib/api";
import { FaTrash } from "react-icons/fa";

type UsageType = "UNLIMITED" | "ONCE_GLOBAL";

interface Coupon {
    _id: string;
    code: string;
    percentOff: number;
    usageType: UsageType;
    isActive: boolean;
    usedCount: number;
    consumedAt?: string | null;
    createdAt?: string;
}

export default function CouponsPage() {
    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const [code, setCode] = useState("");
    const [percentOff, setPercentOff] = useState<number>(10);
    const [usageType, setUsageType] = useState<UsageType>("UNLIMITED");
    const [creating, setCreating] = useState(false);

    const fetchCoupons = async () => {
        try {
            const res = await adminCouponAPI.list();
            if (res.data.success) {
                setCoupons(res.data.data as Coupon[]);
            }
        } catch (error: any) {
            console.error("Failed to load coupons", error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString?: string | null) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleString("en-IN");
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await adminCouponAPI.delete(id);
            if (!res.data.success) {
                throw new Error("Failed to delete coupon");
            }
            toast.success("Coupon deleted");
            // Remove from local state
            setCoupons((prev) => prev.filter((c) => c._id !== id));
        } catch (error: any) {
            console.error("Delete error", error);
            toast.error(error?.response?.data?.message || "Failed to delete coupon");
        }
    };

    const handleToggleCoupon = async (coupon: Coupon) => {
        setTogglingId(coupon._id);
        const prev = coupon.isActive;

        setCoupons((current) =>
            current.map((c) => (c._id === coupon._id ? { ...c, isActive: !prev } : c))
        );

        try {
            const res = await adminCouponAPI.toggle(coupon._id);
            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to toggle coupon");
            }
            toast.success(`Coupon ${prev ? "deactivated" : "activated"}`);
        } catch (error: any) {
            setCoupons((current) =>
                current.map((c) => (c._id === coupon._id ? { ...c, isActive: prev } : c))
            );
            toast.error(error?.response?.data?.message || error?.message || "Failed to toggle coupon");
        } finally {
            setTogglingId(null);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();

        const normalizedCode = code.trim().toUpperCase();
        if (!normalizedCode) {
            toast.error("Coupon code is required");
            return;
        }

        setCreating(true);
        try {
            const res = await adminCouponAPI.create({
                code: normalizedCode,
                percentOff,
                usageType,
            });

            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to create coupon");
            }

            toast.success("Coupon created");
            setCode("");
            setPercentOff(10);
            setUsageType("UNLIMITED");
            await fetchCoupons();
        } catch (error: any) {
            console.error("Create coupon error", error);
            toast.error(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create coupon"
            );
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-40"></div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-40 mt-4"></div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="h-12 bg-gray-50"></div>
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
                <div className="text-sm text-gray-600">
                    <span className="font-medium">{coupons.length}</span> total
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Create Coupon</h2>

                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="OFF50"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Percent Off</label>
                        <select
                            value={String(percentOff)}
                            onChange={(e) => setPercentOff(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {[5, 10, 15, 50, 75, 90, 100].map((p) => (
                                <option key={p} value={p}>{p}%</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usage Type</label>
                        <select
                            value={usageType}
                            onChange={(e) => setUsageType(e.target.value as UsageType)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="UNLIMITED">UNLIMITED</option>
                            <option value="ONCE_GLOBAL">ONCE_GLOBAL</option>
                        </select>
                    </div>

                    <div className="md:col-span-1 flex items-end">
                        <button
                            type="submit"
                            disabled={creating}
                            className={`w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors ${creating ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {creating ? "Creating..." : "Create Coupon"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">All Coupons</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">% Off</th>
                                <th className="px-6 py-4">Usage</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Used</th>
                                <th className="px-6 py-4">Consumed At</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {coupons.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-900">{c.code}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{c.percentOff}%</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{c.usageType}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleCoupon(c)}
                                            disabled={togglingId === c._id}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${c.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"} ${togglingId === c._id ? "opacity-70 cursor-not-allowed" : ""}`}
                                        >
                                            {togglingId === c._id ? "..." : c.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{c.usedCount ?? 0}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(c.consumedAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCoupon(c._id)}
                                            className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Delete Coupon"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No coupons created yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
