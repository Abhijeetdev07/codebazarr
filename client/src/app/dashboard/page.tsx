"use client";

import { useEffect, useState } from "react"; // Added missing import
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { orderAPI } from "@/lib/api";
import Link from "next/link";
import Image from "next/image"; // Added missing import
import { FiBox, FiDownload, FiClock, FiUser, FiLogOut, FiShoppingBag, FiCalendar } from "react-icons/fi";

interface Order {
    _id: string;
    projectId: {
        _id: string;
        title: string;
        description: string;
        images: string[];
        sourceCodeUrl: string;
    };
    amount: number;
    status: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth(); // Assuming loading state from auth
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth Protection
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/dashboard");
        }
    }, [user, authLoading, router]);

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const response = await orderAPI.getMyOrders();
                if (response.data.success) {
                    setOrders(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) return null; // Prevent flash before redirect

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 text-center md:text-left">
                        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-indigo-50">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                            <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                                <FiUser className="h-4 w-4" /> {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {user.role === 'admin' && (
                            <Link href="/admin/dashboard" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                Admin Panel
                            </Link>
                        )}
                        <button
                            onClick={logout}
                            className="px-6 py-2 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <FiLogOut /> Logout
                        </button>
                    </div>
                </div>

                {/* Dashboard Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Stats Cards */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                <FiShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Purchases</p>
                                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                                <FiBox className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Active Projects</p>
                                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                                <FiClock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Member Since</p>
                                {/* createdAt is not currently in User interface in frontend context, fallback or update context later */}
                                <p className="text-lg font-bold text-gray-900">Recently</p>
                            </div>
                        </div>
                    </div>

                    {/* My Orders / Projects List */}
                    <div className="lg:col-span-3">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FiBox /> My Purchased Projects
                        </h2>

                        {orders.length === 0 ? (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                                <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <FiShoppingBag className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                                <p className="text-gray-500 mb-6">Explore our collection and start building today!</p>
                                <Link href="/projects" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                    Browse Projects
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-6 transition-all hover:shadow-md">
                                        {/* Project Image */}
                                        <div className="relative h-48 sm:h-32 w-full sm:w-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <Image
                                                src={order.projectId.images[0] || "/placeholder-project.png"}
                                                alt={order.projectId.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                        {order.projectId.title}
                                                    </h3>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full">
                                                        Purchased
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                                    {order.projectId.description}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FiCalendar className="text-gray-400" />
                                                    <span>{formatDate(order.createdAt)}</span>
                                                </div>
                                                <div className="font-medium text-gray-900">
                                                    {formatPrice(order.amount)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 justify-center sm:w-48 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                                            {order.projectId.sourceCodeUrl ? (
                                                <a
                                                    href={order.projectId.sourceCodeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                                                >
                                                    <FiDownload /> Download Code
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 font-semibold rounded-lg cursor-not-allowed"
                                                    title="Download link not available"
                                                >
                                                    <FiDownload /> Download Code
                                                </button>
                                            )}
                                            <Link
                                                href={`/projects/${order.projectId._id}`}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
