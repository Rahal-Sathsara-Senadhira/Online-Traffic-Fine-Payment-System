"use client";

import React, { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { username, password });
    // Future API authentication logic will go here
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-500">Traffic Fine System</h1>
          <p className="mt-2 text-sm text-slate-400">Admin Web Portal Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Sign In to Dashboard
          </button>
        </form>

      </div>
    </div>
  );
}
