"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearToken } from "@/lib/auth";
import api from "@/lib/api";
import Link from "next/link";

interface Category { id: string; name: string; default_amount: string }
interface Officer  { id: string; full_name: string; badge_number: string; district: string }

export default function NewFine() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [officers,   setOfficers]   = useState<Officer[]>([]);
    const [loading,    setLoading]    = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error,      setError]      = useState("");

    const [form, setForm] = useState({
        categoryId:    "",
        officerId:     "",
        driverNic:     "",
        driverName:    "",
        vehicleNumber: "",
        location:      "",
        amount:        "",
    });

    useEffect(() => {
        if (!isAuthenticated()) { router.replace("/"); return; }
        Promise.all([
            api.get("/api/categories"),
            api.get("/api/officers"),
        ])
            .then(([catRes, offRes]) => {
                setCategories(catRes.data);
                setOfficers(offRes.data);
            })
            .catch(() => setError("Failed to load form data."))
            .finally(() => setLoading(false));
    }, [router]);

    const handleCategoryChange = (id: string) => {
        const cat = categories.find((c) => c.id === id);
        setForm((f) => ({ ...f, categoryId: id, amount: cat ? cat.default_amount : f.amount }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await api.post("/api/fines", {
                categoryId:    form.categoryId,
                officerId:     form.officerId,
                driverNic:     form.driverNic,
                driverName:    form.driverName,
                vehicleNumber: form.vehicleNumber,
                location:      form.location,
                amount:        parseFloat(form.amount),
            });
            router.push("/fines");
        } catch (_err) {
            setError("Failed to issue fine. Please check all fields.");
        } finally {
            setSubmitting(false);
        }
    };

    const field = (key: keyof typeof form, label: string, type = "text", required = true) => (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}{required && " *"}</label>
            <input
                type={type}
                required={required}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-blue-400">Traffic Fine System</h1>
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">Dashboard</Link>
                    <Link href="/fines" className="text-sm text-slate-400 hover:text-white">Fines</Link>
                    <button
                        onClick={() => { clearToken(); router.push("/"); }}
                        className="text-sm text-slate-400 hover:text-red-400 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/fines" className="text-slate-400 hover:text-white text-sm">← Back to Fines</Link>
                </div>
                <h2 className="text-2xl font-bold mb-6">Issue New Fine</h2>

                {loading && <p className="text-slate-400">Loading form...</p>}
                {error && <p className="text-red-400 mb-4">{error}</p>}

                {!loading && (
                    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                            <select
                                required
                                value={form.categoryId}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select category...</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} (LKR {Number(c.default_amount).toLocaleString()})</option>
                                ))}
                            </select>
                        </div>

                        {/* Officer */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Officer *</label>
                            <select
                                required
                                value={form.officerId}
                                onChange={(e) => setForm((f) => ({ ...f, officerId: e.target.value }))}
                                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select officer...</option>
                                {officers.map((o) => (
                                    <option key={o.id} value={o.id}>{o.full_name} — {o.badge_number} ({o.district})</option>
                                ))}
                            </select>
                        </div>

                        {field("driverNic",     "Driver NIC")}
                        {field("driverName",    "Driver Name", "text", false)}
                        {field("vehicleNumber", "Vehicle Number", "text", false)}
                        {field("location",      "Location", "text", false)}
                        {field("amount",        "Amount (LKR)", "number")}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-blue-600 p-3 font-semibold hover:bg-blue-500 transition disabled:opacity-50 mt-2"
                        >
                            {submitting ? "Issuing..." : "Issue Fine"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
