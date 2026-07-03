"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ConfirmationInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const referenceNumber = searchParams.get("ref");
    const paymentId = searchParams.get("paymentId");

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-green-600 mb-2">
                    Payment Successful!
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                    Your traffic fine has been paid successfully. The traffic officer
                    has been notified via SMS.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-1">
                    <div>
                        <p className="text-sm text-gray-500">Reference Number</p>
                        <p className="text-lg font-bold text-gray-800">{referenceNumber}</p>
                    </div>
                    {paymentId && (
                        <div>
                            <p className="text-sm text-gray-500">Payment ID</p>
                            <p className="text-sm font-medium text-gray-700">{paymentId}</p>
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400 mb-6">
                    Please show this confirmation to the traffic officer to retrieve your license.
                </p>

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

export default function Confirmation() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Loading...</p>
            </main>
        }>
            <ConfirmationInner />
        </Suspense>
    );
}
