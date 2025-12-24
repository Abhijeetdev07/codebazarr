"use client";

import { useEffect, useState } from "react";
import { authAPI, projectAPI, orderAPI } from "@/lib/api";
import { FiUsers, FiBox, FiShoppingBag, FiDollarSign } from "react-icons/fi";
import RevenueAnalytics from "@/components/RevenueAnalytics";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProjects: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, projectsRes, ordersRes] = await Promise.all([
                    authAPI.getAllUsers(),
                    projectAPI.getAll(),
                    orderAPI.getAll()
                ]);

                if (ordersRes.data.success) {
                    const orders = ordersRes.data.data;
                    setAllOrders(orders);

                    // Only count completed orders in revenue
                    const completedOrders = orders.filter((order: any) => order.status === 'completed');
                    const revenue = completedOrders.reduce((acc: number, order: any) => acc + (order.amount || 0), 0);

                    const userRoleCount = usersRes.data.data.filter((user: any) => user.role === 'user').length;

                    setStats(prev => ({
                        ...prev,
                        totalOrders: completedOrders.length,
                        totalRevenue: revenue,
                        totalUsers: userRoleCount,
                        totalProjects: projectsRes.data.count || 0,
                    }));

                    setRecentOrders(orders.slice(0, 10));
                }

            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-7 bg-gray-200 rounded w-56"></div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gray-100 rounded-lg hidden md:block">
                                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                                    <div className="h-7 bg-gray-300 rounded w-20"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Skeleton */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="h-6 bg-gray-200 rounded w-40"></div>
                        </div>
                        <div className="h-72 bg-gray-100 rounded-xl"></div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                        <div className="space-y-4 max-h-80 overflow-hidden">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="text-right ml-3">
                                        <div className="h-4 bg-gray-200 rounded w-16 mb-2 ml-auto"></div>
                                        <div className="h-5 bg-gray-100 rounded-full w-16 ml-auto"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-lg hidden md:block">
                        <FiUsers className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-lg hidden md:block">
                        <FiBox className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Projects</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-lg hidden md:block">
                        <FiShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-lg hidden md:block">
                        <FiDollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <RevenueAnalytics orders={allOrders} formatCurrency={formatCurrency} />

                {/* Popular / Recent Orders */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Orders</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar">
                        {recentOrders.map((order: any) => (
                            <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                                        🛍️
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{order.projectId?.title || 'Unknown Project'}</p>
                                        <p className="text-xs text-gray-500">{order.userId?.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{formatCurrency(order.amount)}</p>
                                    <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${order.status === 'completed'
                                        ? 'text-green-600 bg-green-50'
                                        : order.status === 'failed'
                                            ? 'text-red-600 bg-red-50'
                                            : 'text-yellow-600 bg-yellow-50'
                                        }`}>
                                        {order.status === 'completed' ? 'Paid' : order.status === 'failed' ? 'Failed' : 'Pending'}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4">No recent orders</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
