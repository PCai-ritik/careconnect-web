"use client";

import { motion } from "framer-motion";
import {
    Wallet,
    CalendarClock,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Landmark,
    IndianRupee,
} from "lucide-react";

/* ── Mock Data ───────────────────────────────────────────────────────── */

const transactions = [
    {
        id: "txn-001",
        description: "Consultation — Sarah Johnson",
        date: "Mar 25, 2026",
        amount: "₹ 500",
        status: "completed" as const,
        direction: "in" as const,
    },
    {
        id: "txn-002",
        description: "Consultation — Ravi Kumar",
        date: "Mar 24, 2026",
        amount: "₹ 500",
        status: "completed" as const,
        direction: "in" as const,
    },
    {
        id: "txn-003",
        description: "Consultation — Ananya Gupta",
        date: "Mar 24, 2026",
        amount: "₹ 500",
        status: "pending" as const,
        direction: "in" as const,
    },
    {
        id: "txn-004",
        description: "Payout — HDFC Bank",
        date: "Mar 20, 2026",
        amount: "₹ 8,400",
        status: "completed" as const,
        direction: "out" as const,
    },
    {
        id: "txn-005",
        description: "Consultation — Meera Iyer",
        date: "Mar 19, 2026",
        amount: "₹ 500",
        status: "completed" as const,
        direction: "in" as const,
    },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function EarningsPage() {
    return (
        <div className="max-w-7xl mx-auto font-spline pb-12">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, staggerChildren: 0.08 }}
                className="space-y-6"
            >
                {/* ── Page Header ── */}
                <motion.div transition={{ duration: 0.35 }}>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                        Earnings & Payouts
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track your revenue, manage payouts, and view transaction history.
                    </p>
                </motion.div>

                {/* ── Top Metric Cards ── */}
                <motion.div
                    transition={{ duration: 0.35 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Indigo Hero — Available Balance */}
                    <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-white/80">
                                Available Balance
                            </p>
                            <Wallet size={20} className="text-white/60" />
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">₹ 12,500</h3>
                        <button className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer">
                            <ArrowUpRight size={16} />
                            Withdraw Now
                        </button>
                    </div>

                    {/* Next Payout */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-500">Next Payout</p>
                            <CalendarClock size={18} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                            ₹ 8,400
                        </h3>
                        <p className="text-xs text-gray-500 mt-2">
                            Scheduled for Mar 30, 2026
                        </p>
                    </div>

                    {/* Lifetime Earnings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-500">
                                Lifetime Earnings
                            </p>
                            <IndianRupee size={18} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                            ₹ 1,45,000
                        </h3>
                        <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            <TrendingUp size={12} />
                            +15% this month
                        </span>
                    </div>
                </motion.div>

                {/* ── Split Layout ── */}
                <motion.div
                    transition={{ duration: 0.35 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* ── Left: Transaction Table (Col-Span-2) ── */}
                    <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div>Description</div>
                            <div className="text-center">Date</div>
                            <div className="text-center">Status</div>
                            <div className="text-right">Amount</div>
                        </div>

                        {/* Data Rows */}
                        {transactions.map((txn) => (
                            <div
                                key={txn.id}
                                className="grid grid-cols-4 gap-4 items-center px-6 py-4 border-b border-dashed border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                            >
                                {/* Col 1 — Description (Left) */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${txn.direction === "in"
                                                ? "bg-green-50 text-green-600"
                                                : "bg-amber-50 text-amber-600"
                                            }`}
                                    >
                                        {txn.direction === "in" ? (
                                            <ArrowDownLeft size={16} />
                                        ) : (
                                            <ArrowUpRight size={16} />
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {txn.description}
                                    </p>
                                </div>

                                {/* Col 2 — Date (Center) */}
                                <p className="text-sm text-gray-500 text-center">{txn.date}</p>

                                {/* Col 3 — Status (Center) */}
                                <div className="flex justify-center">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.status === "completed"
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                            }`}
                                    >
                                        {txn.status === "completed" ? "Completed" : "Pending"}
                                    </span>
                                </div>

                                {/* Col 4 — Amount (Right) */}
                                <p
                                    className={`text-sm font-semibold text-right ${txn.direction === "out"
                                            ? "text-amber-600"
                                            : "text-gray-900"
                                        }`}
                                >
                                    {txn.direction === "out" ? `- ${txn.amount}` : txn.amount}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ── Right: Side Cards (Col-Span-1) ── */}
                    <div className="col-span-1 space-y-6">
                        {/* Card A — Payout Account */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/50">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Payout Account
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Landmark size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            HDFC Bank
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Savings •••• 4098
                                        </p>
                                    </div>
                                </div>
                                <button className="mt-3 w-full text-center text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer">
                                    Change Account
                                </button>
                            </div>
                        </div>

                        {/* Card B — Consultation Fee */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/50">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Consultation Fee
                                </h3>
                            </div>
                            <div className="p-5">
                                <label className="text-xs font-medium text-gray-500 block mb-2">
                                    Per consultation charge
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        ₹
                                    </span>
                                    <input
                                        type="text"
                                        value="500"
                                        readOnly
                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Edit in Settings → Profile to update.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
