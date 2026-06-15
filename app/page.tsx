"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function FineLookup() {
  const router = useRouter();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!referenceNumber) {
      setError("Please enter your reference number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.get(`http://localhost:5000/api/fines/${referenceNumber}`);
      router.push(`/fine/${referenceNumber}`);
    } catch (err) {
      setError("Fine not found. Please check your reference number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">
          Sri Lanka Police
        </h1>
        <h2 className="text-lg text-center text-gray-600 mb-6">
          Traffic Fine Payment Portal
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fine Reference Number
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. TF-2026-100001"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search Fine"}
        </button>
      </div>
    </main>
  );
}