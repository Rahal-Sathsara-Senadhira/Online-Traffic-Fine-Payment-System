"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearToken } from "@/lib/auth";
import api from "@/lib/api";
import Link from "next/link";

interface DistrictStat { district: string; total: number; count: number }
interface CategoryStat { category: string; total: number; count: number }
interface Summary { districts: DistrictStat[]; categories: CategoryStat[] }

export default function Dashboard() {
    const router = useRouter();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) { router.replace("/"); return; }
        api.get("/api/reports/summary")
            .then((res) => setSummary(res.data.data))
            .catch(() => setError("Failed to load summary."))
            .finally(() => setLoading(false));
    }, [router]);

    const totalRevenue = summary?.districts.reduce((s, d) => s + Number(d.total), 0) ?? 0;
    const totalFines   = summary?.districts.reduce((s, d) => s + Number(d.count), 0) ?? 0;

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Nav */}
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-blue-400">Traffic Fine System</h1>
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-sm text-white font-medium">Dashboard</Link>
                    <Link href="/fines" className="text-sm text-slate-400 hover:text-white">Fines</Link>
                    <button
                        onClick={() => { clearToken(); router.push("/"); }}
                        className="text-sm text-slate-400 hover:text-red-400 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

                {loading && <p className="text-slate-400">Loading...</p>}
                {error && <p className="text-red-400">{error}</p>}

                {summary && (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <p className="text-sm text-slate-400 mb-1">Total Fines Issued</p>
                                <p className="text-3xl font-bold text-white">{totalFines}</p>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <p className="text-sm text-slate-400 mb-1">Total Revenue</p>
                                <p className="text-3xl font-bold text-blue-400">LKR {totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* By district */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                <h3 className="text-lg font-semibold mb-4">By District</h3>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-slate-400 text-left border-b border-slate-700">
                                            <th className="pb-2">District</th>
                                            <th className="pb-2 text-right">Fines</th>
                                            <th className="pb-2 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.districts.map((d) => (
                                            <tr key={d.district} className="border-b border-slate-700/50">
                                                <td className="py-2">{d.district}</td>
                                                <td className="py-2 text-right">{d.count}</td>
                                                <td className="py-2 text-right text-blue-400">LKR {Number(d.total).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* By category */}
                            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                <h3 className="text-lg font-semibold mb-4">By Category</h3>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-slate-400 text-left border-b border-slate-700">
                                            <th className="pb-2">Category</th>
                                            <th className="pb-2 text-right">Fines</th>
                                            <th className="pb-2 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.categories.map((c) => (
                                            <tr key={c.category} className="border-b border-slate-700/50">
                                                <td className="py-2">{c.category}</td>
                                                <td className="py-2 text-right">{c.count}</td>
                                                <td className="py-2 text-right text-blue-400">LKR {Number(c.total).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
