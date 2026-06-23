"use client";

import { Suspense } from "react";
import PaymentContent from "./PaymentContent";

export default function Payment() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading payment...</p>
                    </div>
                </main>
            }
        >
            <PaymentContent />
        </Suspense>
    );
}