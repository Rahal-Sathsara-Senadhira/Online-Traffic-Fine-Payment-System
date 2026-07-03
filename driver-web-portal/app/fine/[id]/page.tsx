"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Fine {
    id: string;
    reference_number: string;
    category_id: string;
    driver_nic: string;
    driver_name: string;
    vehicle_number: string;
    location: string;
    amount: string;
    status: string;
    issued_at: string;
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-800">{value}</span>
        </div>
    );
}

export default function FineDetail() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [fine, setFine] = useState<Fine | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = params?.id;
        if (!ref) return;

        axios
            .get(`${API_URL}/api/fines/${ref}`)
            .then((res) => setFine(res.data))
            .catch(() => setError("Fine not found. Please check your reference number."))
            .finally(() => setLoading(false));
    }, [params?.id]);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Loading...</p>
            </main>
        );
    }

    if (error || !fine) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
                    <p className="text-red-500 mb-4">{error || "Fine not found."}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                    >
                        Back to Search
                    </button>
                </div>
            </main>
        );
    }

    const isPending = fine.status === "PENDING";

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
                    Fine Details
                </h1>

                <div className="space-y-1 mb-6">
                    <Row label="Reference" value={fine.reference_number} />
                    <Row label="Driver Name" value={fine.driver_name} />
                    <Row label="NIC" value={fine.driver_nic} />
                    <Row label="Vehicle" value={fine.vehicle_number} />
                    <Row label="Location" value={fine.location} />
                    <Row label="Issued At" value={new Date(fine.issued_at).toLocaleDateString()} />
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`text-sm font-semibold ${isPending ? "text-yellow-600" : "text-green-600"}`}>
                            {fine.status}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-500">Amount</span>
                        <span className="text-lg font-bold text-blue-700">
                            LKR {Number(fine.amount).toLocaleString()}
                        </span>
                    </div>
                </div>

                {isPending ? (
                    <button
                        onClick={() =>
                            router.push(
                                `/payment?ref=${fine.reference_number}&category=${fine.category_id}&amount=${fine.amount}`
                            )
                        }
                        className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                    >
                        Pay Now
                    </button>
                ) : (
                    <div className="bg-green-50 rounded-lg p-4 text-center text-green-700 text-sm font-medium">
                        This fine has already been paid.
                    </div>
                )}

                <button
                    onClick={() => router.push("/")}
                    className="w-full mt-3 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                    Back to Search
                </button>
            </div>
        </main>
    );
}
