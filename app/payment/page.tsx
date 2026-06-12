"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function Payment() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const referenceNumber = searchParams.get("ref");
    const amount = searchParams.get("amount");

    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!cardName || !cardNumber || !expiry || !cvv) {
            setError("Please fill in all fields.");
            return;
        }

        if (cardNumber.length !== 16) {
            setError("Card number must be 16 digits.");
            return;
        }

        if (cvv.length !== 3) {
            setError("CVV must be 3 digits.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Replace with Member 2's actual payment endpoint later
            // await axios.post("/api/payments", {
            //   referenceNumber,
            //   amount,
            //   cardName,
            //   cardNumber,
            //   expiry,
            //   cvv,
            // });

            // Simulate payment for now
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push(`/confirmation?ref=${referenceNumber}`);
        } catch (err) {
            setError("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                    <p className="text-3xl font-bold text-blue-700">
                        LKR {Number(amount).toLocaleString()}
                    </p>
                </div>

                <div className="space-y-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Name on card"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                        </label>
                        <input
                            type="text"
                            maxLength={16}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="16-digit card number"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="MM/YY"
                                maxLength={5}
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CVV
                            </label>
                            <input
                                type="password"
                                maxLength={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="3 digits"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                            />
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                >
                    {loading ? "Processing..." : `Pay LKR ${Number(amount).toLocaleString()}`}
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