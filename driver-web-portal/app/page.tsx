"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const [referenceNumber, setReferenceNumber] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        const trimmed = referenceNumber.trim();
        if (!trimmed) {
            setError("Please enter your reference number.");
            return;
        }
        setError("");
        router.push(`/fine/${trimmed}`);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">
                    Sri Lanka Police
                </h1>
                <h2 className="text-lg text-center text-gray-600 mb-6">
                    Traffic Fine Payment Portal
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fine Reference Number
                    </label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. TF-2026-100001"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                >
                    Search Fine
                </button>
            </div>
        </main>
    );
}
