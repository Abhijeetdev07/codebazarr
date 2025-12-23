"use client";

import { useEffect, useState } from "react";
import { authAPI, projectAPI, orderAPI } from "@/lib/api";
import { FiUsers, FiBox, FiShoppingBag, FiDollarSign } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProjects: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [revenueRange, setRevenueRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
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
                    const revenue = orders.reduce((acc: number, order: any) => acc + (order.amount || 0), 0);

                    const userRoleCount = usersRes.data.data.filter((user: any) => user.role === 'user').length;

                    setStats(prev => ({
                        ...prev,
                        totalOrders: orders.length,
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

    useEffect(() => {
        if (!allOrders.length) {
            setRevenueData([]);
            return;
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (revenueRange === 'yearly') {
            const monthKeys: string[] = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthKeys.push(key);
            }

            const revenueByMonth = new Map<string, number>();
            for (const key of monthKeys) revenueByMonth.set(key, 0);

            for (const order of allOrders) {
                const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
                if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

                const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
                if (!revenueByMonth.has(key)) continue;

                const amount = Number(order?.amount || 0);
                revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + amount);
            }

            setRevenueData(
                monthKeys.map((key) => ({
                    name: new Date(`${key}-01`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
                    revenue: revenueByMonth.get(key) || 0,
                }))
            );
            return;
        }

        const days = revenueRange === 'monthly' ? 30 : 7;
        const dayKeys: string[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(startOfToday);
            d.setDate(d.getDate() - i);
            dayKeys.push(d.toISOString().slice(0, 10));
        }

        const revenueByDay = new Map<string, number>();
        for (const key of dayKeys) revenueByDay.set(key, 0);

        for (const order of allOrders) {
            const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
            if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

            const key = createdAt.toISOString().slice(0, 10);
            if (!revenueByDay.has(key)) continue;

            const amount = Number(order?.amount || 0);
            revenueByDay.set(key, (revenueByDay.get(key) || 0) + amount);
        }

        setRevenueData(
            dayKeys.map((key) => ({
                name: new Date(key).toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
                revenue: revenueByDay.get(key) || 0,
            }))
        );
    }, [allOrders, revenueRange]);


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
            <div className="space-y-6 animate-pulse">
                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                                </div>
                                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart Skeleton */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="h-64 bg-gray-100 rounded"></div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
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
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                        <select
                            value={revenueRange}
                            onChange={(e) => setRevenueRange(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                            className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(Number(value))} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value: number | string | undefined) => [formatCurrency(Number(value || 0)), 'Revenue']}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

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
                                    <p className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">Paid</p>
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
