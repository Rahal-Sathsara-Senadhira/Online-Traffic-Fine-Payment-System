import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-blue-500 mb-4">404</h1>
                <p className="text-slate-400 mb-6">Page not found.</p>
                <Link
                    href="/"
                    className="rounded-lg bg-blue-600 px-6 py-2 font-semibold hover:bg-blue-500 transition"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
