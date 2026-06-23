"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface FineData {
    id: string;
    reference_number: string;
    driver_nic: string;
    driver_name: string;
    vehicle_number: string;
    location: string;
    amount: number;
    status: string;
    issued_at: string;
    category: { id: string; name: string } | null;
    officer: { id: string; badge_number: string; district: string } | null;
}

export default function FineDetails() {
    const params = useParams();
    const router = useRouter();
    const referenceNumber = params.id as string;

    const [fine, setFine] = useState<FineData | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFine = async () => {
            try {
                const res = await api.get(`/fines/${referenceNumber}`);
                setFine(res.data);
            } catch (err) {
                setError("Fine not found. Please check your reference number.");
            } finally {
                setLoading(false);
            }
        };

        if (referenceNumber) {
            fetchFine();
        }
    }, [referenceNumber]);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading fine details...</p>
                </div>
            </main>
        );
    }

    if (error || !fine) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
                    <p className="text-red-500 text-lg mb-4">{error || "Fine not found."}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </main>
        );
    }

    const isPaid = fine.status === "PAID" || fine.status === "paid";

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">
                    Fine Details
                </h1>
                <p className="text-center text-gray-500 text-sm mb-6">
                    Reference: <span className="font-medium text-gray-700">{fine.reference_number}</span>
                </p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-gray-500">Amount Due</p>
                    <p className="text-3xl font-bold text-blue-700">
                        LKR {Number(fine.amount).toLocaleString()}
                    </p>
                </div>

                <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Driver NIC</span>
                        <span className="text-gray-800 font-medium">{fine.driver_nic}</span>
                    </div>
                    {fine.driver_name && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Driver Name</span>
                            <span className="text-gray-800 font-medium">{fine.driver_name}</span>
                        </div>
                    )}
                    {fine.vehicle_number && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Vehicle Number</span>
                            <span className="text-gray-800 font-medium">{fine.vehicle_number}</span>
                        </div>
                    )}
                    {fine.category && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Offence</span>
                            <span className="text-gray-800 font-medium">{fine.category.name}</span>
                        </div>
                    )}
                    {fine.officer && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">District</span>
                            <span className="text-gray-800 font-medium">{fine.officer.district}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className={`font-medium ${isPaid ? "text-green-600" : "text-orange-600"}`}>
                            {fine.status}
                        </span>
                    </div>
                </div>

                {isPaid ? (
                    <div className="bg-green-50 rounded-lg p-4 text-center mb-4">
                        <p className="text-green-700 font-semibold">This fine has already been paid.</p>
                    </div>
                ) : (
                    <button
                        onClick={() =>
                            router.push(
                                `/payment?ref=${fine.reference_number}&category=${fine.category?.id}&amount=${fine.amount}`
                            )
                        }
                        className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                    >
                        Proceed to Payment
                    </button>
                )}

                <button
                    onClick={() => router.push("/")}
                    className="w-full mt-3 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                    Back to Home
                </button>
            </div>
        </main>
    );
}