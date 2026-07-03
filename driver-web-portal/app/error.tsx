"use client";

export default function Error({
    error,
    unstable_retry,
}: {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
                <p className="text-gray-500 text-sm mb-6">{error.message}</p>
                <button
                    onClick={unstable_retry}
                    className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                >
                    Try Again
                </button>
            </div>
        </main>
    );
}
