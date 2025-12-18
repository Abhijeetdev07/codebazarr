"use client";

import { useState, useEffect } from "react";
import { orderAPI } from "@/lib/api";
import { FiEye, FiFilter, FiX, FiCalendar, FiUser, FiPackage, FiDollarSign } from "react-icons/fi";
import toast from "react-hot-toast";

interface Order {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    projectId: {
        _id: string;
        title: string;
        price: number;
    };
    amount: number;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    status: string;
    purchaseDate: string;
    createdAt: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [orders, statusFilter, dateFilter]);

    const fetchOrders = async () => {
        try {
            const res = await orderAPI.getAll();
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...orders];

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Date filter
        if (dateFilter) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                return orderDate === dateFilter;
            });
        }

        setFilteredOrders(filtered);
    };

    const clearFilters = () => {
        setStatusFilter("all");
        setDateFilter("");
    };

    const openDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const closeDetails = () => {
        setIsDetailsOpen(false);
        setSelectedOrder(null);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-50 text-green-700';
            case 'pending':
                return 'bg-yellow-50 text-yellow-700';
            case 'failed':
                return 'bg-red-50 text-red-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    const formatDate = (dateString: string | undefined, options?: Intl.DateTimeFormatOptions) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-IN', options || {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    const formatDateTime = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleString('en-IN');
        } catch {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-100 rounded w-32"></div>
                </div>

                {/* Filters Skeleton */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="h-5 bg-gray-200 rounded w-16 mb-3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                        <th key={i} className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                <div className="h-3 bg-gray-100 rounded w-40"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{filteredOrders.length}</span>
                    <span>of {orders.length} orders</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <FiFilter className="text-gray-500" />
                    <h3 className="font-medium text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                                        #{order._id.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{order.userId?.name || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{order.userId?.email || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                                        {order.projectId?.title || 'Deleted Project'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        ₹{order.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openDetails(order)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <FiEye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No orders found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {isDetailsOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
                            <h3 className="text-lg font-bold text-white">Order Details</h3>
                            <button onClick={closeDetails} className="text-white hover:text-gray-200">
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Order Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <FiPackage className="text-indigo-600" />
                                    <h4 className="font-semibold text-gray-900">Order Information</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Order ID</p>
                                        <p className="font-mono font-medium text-gray-900">#{selectedOrder._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Order Date</p>
                                        <p className="font-medium text-gray-900">
                                            {formatDateTime(selectedOrder.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Amount</p>
                                        <p className="font-bold text-indigo-600 text-lg">₹{selectedOrder.amount}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <FiUser className="text-blue-600" />
                                    <h4 className="font-semibold text-gray-900">Customer Details</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{selectedOrder.userId?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{selectedOrder.userId?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">User ID</p>
                                        <p className="font-mono text-xs text-gray-600">{selectedOrder.userId?._id || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Project Info */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <FiPackage className="text-green-600" />
                                    <h4 className="font-semibold text-gray-900">Project Details</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Title</p>
                                        <p className="font-medium text-gray-900">{selectedOrder.projectId?.title || 'Deleted Project'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Price</p>
                                        <p className="font-medium text-gray-900">₹{selectedOrder.projectId?.price || selectedOrder.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Project ID</p>
                                        <p className="font-mono text-xs text-gray-600">{selectedOrder.projectId?._id || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <FiDollarSign className="text-purple-600" />
                                    <h4 className="font-semibold text-gray-900">Payment Information</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Razorpay Payment ID</p>
                                        <p className="font-mono text-xs text-gray-900 break-all">{selectedOrder.razorpayPaymentId || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Razorpay Order ID</p>
                                        <p className="font-mono text-xs text-gray-900 break-all">{selectedOrder.razorpayOrderId || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeDetails}
                                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
