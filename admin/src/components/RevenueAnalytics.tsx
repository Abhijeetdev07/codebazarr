"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type RevenueRange = "weekly" | "monthly" | "yearly";

type Props = {
    orders: any[];
    formatCurrency: (amount: number | undefined) => string;
    className?: string;
};

export default function RevenueAnalytics({ orders, formatCurrency, className }: Props) {
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [revenueRange, setRevenueRange] = useState<RevenueRange>("weekly");

    useEffect(() => {
        if (!orders.length) {
            setRevenueData([]);
            return;
        }

        // Only count completed orders in revenue
        const completedOrders = orders.filter((order: any) => order.status === 'completed');

        if (!completedOrders.length) {
            setRevenueData([]);
            return;
        }

        const trimZeroEdges = (data: any[], padding: number) => {
            const firstNonZero = data.findIndex((d) => Number(d?.revenue || 0) > 0);
            if (firstNonZero === -1) return data;

            let lastNonZero = -1;
            for (let i = data.length - 1; i >= 0; i--) {
                if (Number(data[i]?.revenue || 0) > 0) {
                    lastNonZero = i;
                    break;
                }
            }

            const start = Math.max(0, firstNonZero - padding);
            const end = Math.min(data.length - 1, lastNonZero + padding);
            return data.slice(start, end + 1);
        };

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (revenueRange === "yearly") {
            const monthKeys: string[] = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                monthKeys.push(key);
            }

            const revenueByMonth = new Map<string, number>();
            for (const key of monthKeys) revenueByMonth.set(key, 0);

            for (const order of completedOrders) {
                const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
                if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

                const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
                if (!revenueByMonth.has(key)) continue;

                const amount = Number(order?.amount || 0);
                revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + amount);
            }

            setRevenueData(
                trimZeroEdges(
                    monthKeys.map((key) => ({
                        name: new Date(`${key}-01`).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
                        revenue: revenueByMonth.get(key) || 0,
                    })),
                    2
                )
            );
            return;
        }

        const days = revenueRange === "monthly" ? 30 : 7;
        const dayKeys: string[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(startOfToday);
            d.setDate(d.getDate() - i);
            // Use local date string instead of ISO (UTC)
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dayKeys.push(`${year}-${month}-${day}`);
        }

        const revenueByDay = new Map<string, number>();
        for (const key of dayKeys) revenueByDay.set(key, 0);

        for (const order of completedOrders) {
            const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
            if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

            // Use local date string instead of ISO (UTC)
            const year = createdAt.getFullYear();
            const month = String(createdAt.getMonth() + 1).padStart(2, '0');
            const day = String(createdAt.getDate()).padStart(2, '0');
            const key = `${year}-${month}-${day}`;

            if (revenueByDay.has(key)) {
                const amount = Number(order?.amount || 0);
                revenueByDay.set(key, (revenueByDay.get(key) || 0) + amount);
            }
        }

        setRevenueData(
            trimZeroEdges(
                dayKeys.map((key) => ({
                    name: new Date(key).toLocaleDateString("en-IN", { month: "short", day: "2-digit" }),
                    revenue: revenueByDay.get(key) || 0,
                })),
                1  // Show only 1 zero date before and after revenue
            )
        );
    }, [orders, revenueRange]);

    return (
        <div className={`lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm ${className || ""}`.trim()}>
            <div className="flex items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                <select
                    value={revenueRange}
                    onChange={(e) => setRevenueRange(e.target.value as RevenueRange)}
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
                            contentStyle={{
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "1px solid #E5E7EB",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(value: number | string | undefined) => [formatCurrency(Number(value || 0)), "Revenue"]}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#4F46E5", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
