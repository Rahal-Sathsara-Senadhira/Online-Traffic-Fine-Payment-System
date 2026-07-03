import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
                <h1 className="text-4xl font-bold text-blue-700 mb-2">404</h1>
                <p className="text-gray-500 mb-6">Page not found.</p>
                <Link
                    href="/"
                    className="inline-block bg-blue-700 text-white py-2 px-6 rounded-lg hover:bg-blue-800 transition"
                >
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
