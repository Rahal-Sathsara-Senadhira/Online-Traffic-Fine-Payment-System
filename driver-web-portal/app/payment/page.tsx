"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function PaymentInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const referenceNumber = searchParams.get("ref");
    const categoryId = searchParams.get("category");
    const amount = searchParams.get("amount") ?? "0";

    const [paymentMethod, setPaymentMethod] = useState<"CARD" | "ONLINE_BANKING">("CARD");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/payments/`, {
                referenceNumber,
                categoryId,
                paymentMethod,
            });

            const { paymentId } = res.data;
            router.push(`/confirmation?ref=${referenceNumber}&paymentId=${paymentId}`);
        } catch (_err) {
            setError("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const displayAmount = Number(amount).toLocaleString();

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">
                    Payment
                </h1>
                <p className="text-center text-gray-500 text-sm mb-6">
                    Reference: <span className="font-medium text-gray-700">{referenceNumber}</span>
                </p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-gray-500">Amount Due</p>
                    <p className="text-3xl font-bold text-blue-700">LKR {displayAmount}</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Payment Method
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={paymentMethod === "CARD"}
                                onChange={() => setPaymentMethod("CARD")}
                            />
                            <span>Credit / Debit Card</span>
                        </label>
                        <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={paymentMethod === "ONLINE_BANKING"}
                                onChange={() => setPaymentMethod("ONLINE_BANKING")}
                            />
                            <span>Online Banking</span>
                        </label>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                >
                    {loading ? "Processing..." : `Pay LKR ${displayAmount}`}
                </button>

                <button
                    onClick={() => router.back()}
                    className="w-full mt-3 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                    Go Back
                </button>
            </div>
        </main>
    );
}

export default function Payment() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Loading...</p>
            </main>
        }>
            <PaymentInner />
        </Suspense>
    );
}
