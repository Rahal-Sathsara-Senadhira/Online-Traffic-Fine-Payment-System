"use client";

export default function Error({
    error,
    unstable_retry,
}: {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h1>
                <p className="text-slate-400 text-sm mb-6">{error.message}</p>
                <button
                    onClick={unstable_retry}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-semibold hover:bg-blue-500 transition"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
