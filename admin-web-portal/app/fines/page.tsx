"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearToken } from "@/lib/auth";
import api from "@/lib/api";
import Link from "next/link";

interface Fine {
    id: string;
    reference_number: string;
    driver_name: string;
    driver_nic: string;
    vehicle_number: string;
    location: string;
    amount: string;
    status: string;
    issued_at: string;
}

export default function FinesList() {
    const router = useRouter();
    const [fines, setFines] = useState<Fine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) { router.replace("/"); return; }
        const params = statusFilter ? `?status=${statusFilter}` : "";
        api.get(`/api/fines${params}`)
            .then((res) => setFines(res.data))
            .catch(() => setError("Failed to load fines."))
            .finally(() => setLoading(false));
    }, [router, statusFilter]);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-blue-400">Traffic Fine System</h1>
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">Dashboard</Link>
                    <Link href="/fines" className="text-sm text-white font-medium">Fines</Link>
                    <button
                        onClick={() => { clearToken(); router.push("/"); }}
                        className="text-sm text-slate-400 hover:text-red-400 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Fines</h2>
                    <Link
                        href="/fines/new"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500 transition"
                    >
                        + Issue Fine
                    </Link>
                </div>

                {/* Filter */}
                <div className="mb-4 flex gap-2">
                    {["", "PENDING", "PAID"].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setLoading(true); setStatusFilter(s); }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition ${statusFilter === s ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                        >
                            {s || "All"}
                        </button>
                    ))}
                </div>

                {loading && <p className="text-slate-400">Loading...</p>}
                {error && <p className="text-red-400">{error}</p>}

                {!loading && !error && (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 text-left border-b border-slate-700">
                                    <th className="px-4 py-3">Reference</th>
                                    <th className="px-4 py-3">Driver</th>
                                    <th className="px-4 py-3">NIC</th>
                                    <th className="px-4 py-3">Vehicle</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Issued</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fines.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-slate-500">No fines found.</td>
                                    </tr>
                                )}
                                {fines.map((f) => (
                                    <tr key={f.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                                        <td className="px-4 py-3 font-mono text-blue-400">{f.reference_number}</td>
                                        <td className="px-4 py-3">{f.driver_name}</td>
                                        <td className="px-4 py-3 text-slate-400">{f.driver_nic}</td>
                                        <td className="px-4 py-3">{f.vehicle_number}</td>
                                        <td className="px-4 py-3">LKR {Number(f.amount).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${f.status === "PAID" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                                                {f.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">{new Date(f.issued_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
