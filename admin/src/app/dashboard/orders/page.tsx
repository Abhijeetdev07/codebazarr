"use client";

import { useState, useEffect } from "react";
import { orderAPI } from "@/lib/api";
import { FiEye, FiFilter, FiX, FiCalendar, FiUser, FiPackage, FiDollarSign, FiDownload, FiPrinter, FiLoader } from "react-icons/fi";
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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from "@/assets/logo.png";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFilterType, setExportFilterType] = useState<string>("yearly");
    const [exportYear, setExportYear] = useState<string>(new Date().getFullYear().toString());
    const [exportMonth, setExportMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [exportStartDate, setExportStartDate] = useState<string>("");
    const [exportEndDate, setExportEndDate] = useState<string>("");
    const [exportStatus, setExportStatus] = useState<string>("all");
    const [isExporting, setIsExporting] = useState(false);
    const [exportAction, setExportAction] = useState<'download' | 'print'>('download');

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

    const handleExport = async (action: 'download' | 'print' = 'download') => {
        try {
            setExportAction(action);
            setIsExporting(true);

            // Prepare params
            const params: any = {
                filterType: exportFilterType,
                status: exportStatus
            };

            if (exportFilterType === 'yearly') {
                params.year = exportYear;
            } else if (exportFilterType === 'monthly') {
                params.year = exportYear;
                params.month = exportMonth;
            } else if (exportFilterType === 'dateRange') {
                if (!exportStartDate || !exportEndDate) {
                    toast.error("Please select both start and end dates");
                    setIsExporting(false);
                    return;
                }
                params.startDate = exportStartDate;
                params.endDate = exportEndDate;
            }

            // Fetch filtered data
            const res = await orderAPI.export(params);

            if (res.data.success) {
                const { data, summary, filters } = res.data;

                if (data.length === 0) {
                    toast.error("No orders found for the selected filters");
                    setIsExporting(false);
                    return;
                }

                // Generate PDF
                const doc = new jsPDF();

                // Load Logo
                let logoLoaded = false;
                const logoImg = new Image();
                if (Logo && Logo.src) {
                    logoImg.src = Logo.src;
                    try {
                        await new Promise((resolve, reject) => {
                            if (logoImg.complete) resolve(true);
                            logoImg.onload = () => resolve(true);
                            logoImg.onerror = () => reject(new Error("Failed to load logo"));
                        });
                        logoLoaded = true;
                    } catch (err) {
                        console.error("Logo loading failed", err);
                    }
                }

                // Add Logo or Fallback Text
                let startY = 20;
                if (logoLoaded) {
                    const logoWidth = 40;
                    const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
                    doc.addImage(logoImg, 'PNG', 14, 15, logoWidth, logoHeight);
                    startY = logoHeight + 25;
                } else {
                    doc.setFontSize(22);
                    doc.setTextColor(79, 70, 229); // Indigo-600
                    doc.text("CodeBazar", 14, 20);
                    startY = 28;
                }

                doc.setFontSize(12);
                doc.setTextColor(100);
                doc.text("Order Report", 14, startY);

                // Filter Details
                doc.setFontSize(10);
                doc.setTextColor(130);
                const dateStr = new Date().toLocaleDateString();
                doc.text(`Generated on: ${dateStr}`, 14, startY + 7);

                let filterText = `Filter: ${filters.filterType.charAt(0).toUpperCase() + filters.filterType.slice(1)}`;
                if (filters.filterType === 'yearly') filterText += ` (${filters.year})`;
                if (filters.filterType === 'monthly') filterText += ` (${filters.month}/${filters.year})`;
                if (filters.filterType === 'dateRange') filterText += ` (${filters.startDate} to ${filters.endDate})`;

                doc.text(filterText, 14, startY + 12);
                doc.text(`Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`, 14, startY + 17);

                // Summary Params
                const summaryStartY = startY + 7;
                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.text(`Total Orders: ${summary.totalOrders}`, 150, summaryStartY);
                doc.text(`Total Amount: Rs. ${summary.totalAmount.toLocaleString()}`, 150, summaryStartY + 5);

                // Table
                const tableColumn = ["Order ID", "Customer", "Project", "Amount", "Payment", "Date", "Status"];
                const tableRows = data.map((order: any) => [
                    order.orderIdShort,
                    order.customerName,
                    order.projectName,
                    `Rs. ${order.amount}`,
                    order.paymentMethod?.toUpperCase() || 'OTHER',
                    new Date(order.date).toLocaleDateString(),
                    order.status.toUpperCase()
                ]);

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: startY + 25,
                    theme: 'grid',
                    showFoot: 'lastPage',
                    headStyles: { fillColor: [79, 70, 229] },
                    styles: { fontSize: 8 },
                    foot: [['Total', '', '', `Rs. ${summary.totalAmount.toLocaleString()}`, '', '', `${summary.totalOrders} Orders`]],
                    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
                    didDrawPage: (data) => {
                        // Watermark
                        if (logoLoaded) {
                            const doc = data.doc as any;
                            const pageWidth = doc.internal.pageSize.getWidth();
                            const pageHeight = doc.internal.pageSize.getHeight();
                            const imgWidth = 160; // Slightly bigger logo
                            const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
                            const angleDeg = 45;
                            const x = (pageWidth - imgWidth) / 2 + 25; // Shifted more right
                            const y = (pageHeight - imgHeight) / 2 + 35; // Shifted more down

                            doc.saveGraphicsState();
                            doc.setGState(new doc.GState({ opacity: 0.15 }));
                            doc.addImage(logoImg, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST', angleDeg);
                            doc.restoreGraphicsState();
                        }
                    }
                });

                if (action === 'print') {
                    doc.autoPrint();
                    doc.output('dataurlnewwindow');
                    toast.success("Print window opened");
                } else {
                    // Save PDF
                    doc.save(`orders-report-${dateFilter || 'export'}.pdf`);
                    toast.success("PDF downloaded successfully");
                }
                setIsExportModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to export orders");
        } finally {
            setIsExporting(false);
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
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{filteredOrders.length}</span>
                        <span>of {orders.length} orders</span>
                    </div>
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiDownload className="h-4 w-4" />
                        Export PDF
                    </button>
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

            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
                            <h3 className="text-lg font-bold text-white">Export Orders to PDF</h3>
                            <button onClick={() => setIsExportModalOpen(false)} className="text-white hover:text-gray-200">
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Filter Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Filter Type</label>
                                <select
                                    value={exportFilterType}
                                    onChange={(e) => setExportFilterType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="yearly">Yearly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="dateRange">Date Range</option>
                                </select>
                            </div>

                            {/* Yearly Filter */}
                            {exportFilterType === 'yearly' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                                    <select
                                        value={exportYear}
                                        onChange={(e) => setExportYear(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Monthly Filter */}
                            {exportFilterType === 'monthly' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Month</label>
                                        <select
                                            value={exportMonth}
                                            onChange={(e) => setExportMonth(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="1">January</option>
                                            <option value="2">February</option>
                                            <option value="3">March</option>
                                            <option value="4">April</option>
                                            <option value="5">May</option>
                                            <option value="6">June</option>
                                            <option value="7">July</option>
                                            <option value="8">August</option>
                                            <option value="9">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                                        <select
                                            value={exportYear}
                                            onChange={(e) => setExportYear(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Date Range Filter */}
                            {exportFilterType === 'dateRange' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={exportStartDate}
                                            onChange={(e) => setExportStartDate(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={exportEndDate}
                                            onChange={(e) => setExportEndDate(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Order Status</label>
                                <select
                                    value={exportStatus}
                                    onChange={(e) => setExportStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> The PDF will include Order ID, Customer Name, Project Name, Amount, Payment Method, Date, and Status for all filtered orders.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-row justify-end gap-2">
                            <button
                                onClick={() => setIsExportModalOpen(false)}
                                className="hidden sm:block px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleExport('print')}
                                disabled={isExporting || (exportFilterType === 'dateRange' && (!exportStartDate || !exportEndDate))}
                                className={`flex-1 sm:flex-none justify-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 ${isExporting || (exportFilterType === 'dateRange' && (!exportStartDate || !exportEndDate)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isExporting && exportAction === 'print' ? (
                                    <FiLoader className="h-4 w-4 animate-spin" />
                                ) : (
                                    <FiPrinter className="h-4 w-4" />
                                )}
                                {isExporting && exportAction === 'print' ? 'Printing...' : 'Print'}
                            </button>
                            <button
                                onClick={() => handleExport('download')}
                                disabled={isExporting || (exportFilterType === 'dateRange' && (!exportStartDate || !exportEndDate))}
                                className={`flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 ${isExporting || (exportFilterType === 'dateRange' && (!exportStartDate || !exportEndDate)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isExporting && exportAction === 'download' ? (
                                    <FiLoader className="h-4 w-4 animate-spin" />
                                ) : (
                                    <FiDownload className="h-4 w-4" />
                                )}
                                {isExporting && exportAction === 'download' ? 'Download' : 'Download'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
