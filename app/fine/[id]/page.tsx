"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

interface Fine {
    referenceNumber: string;
    category: string;
    amount: number;
    issuedDate: string;
    officerName: string;
    district: string;
    status: string;
}

export default function FineDetails() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const referenceNumber = params.id as string;
    const categoryId = searchParams.get("category");

    const [fine, setFine] = useState<Fine | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Replace with Member 2's actual endpoint later
        // axios.get(`/api/fines/${referenceNumber}?category=${categoryId}`)
        //   .then(res => setFine(res.data))
        //   .catch(() => setError("Fine not found."))
        //   .finally(() => setLoading(false));

        // Dummy data for now
        setTimeout(() => {
            setFine({
                referenceNumber,
                category: "Speeding",
                amount: 2500,
                issuedDate: "2026-06-10",
                officerName: "Officer Perera",
                district: "Colombo",
                status: "Unpaid",
            });
            setLoading(false);
        }, 800);
    }, [referenceNumber, categoryId]);

    if (loading)
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Loading fine details...</p>
            </main>
        );

    if (error)
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500">{error}</p>
            </main>
        );

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
                    Fine Details
                </h1>

                <div className="space-y-3 mb-6">
                    <Row label="Reference Number" value={fine!.referenceNumber} />
                    <Row label="Category" value={fine!.category} />
                    <Row label="District" value={fine!.district} />
                    <Row label="Issued Date" value={fine!.issuedDate} />
                    <Row label="Officer" value={fine!.officerName} />
                    <Row
                        label="Amount"
                        value={`LKR ${fine!.amount.toLocaleString()}`}
                    />
                    <Row
                        label="Status"
                        value={fine!.status}
                        valueClass="text-red-500 font-semibold"
                    />
                </div>

                <button
                    onClick={() =>
                        router.push(
                            `/payment?ref=${fine!.referenceNumber}&amount=${fine!.amount}`
                        )
                    }
                    className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                >
                    Proceed to Payment
                </button>

                <button
                    onClick={() => router.push("/")}
                    className="w-full mt-3 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                    Go Back
                </button>
            </div>
        </main>
    );
}

function Row({
    label,
    value,
    valueClass = "text-gray-800",
}: {
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className={`text-sm ${valueClass}`}>{value}</span>
        </div>
    );
}