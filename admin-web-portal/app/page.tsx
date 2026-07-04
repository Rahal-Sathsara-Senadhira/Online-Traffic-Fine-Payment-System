"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { setToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            setToken(res.data.token);
            router.push("/dashboard");
        } catch (_err) {
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-white">
            <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-blue-500">Traffic Fine System</h1>
                    <p className="mt-2 text-sm text-slate-400">Admin Web Portal Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="admin@traffic-fines.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In to Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
