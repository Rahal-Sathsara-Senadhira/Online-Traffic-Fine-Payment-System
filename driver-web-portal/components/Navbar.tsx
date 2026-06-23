'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getToken, removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
    setIsLoggedIn(false);
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          🚦 TrafficFine LK
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium">
          {isLoggedIn ? (
            <>
              <Link href="/fines" className="hover:text-blue-200 transition">My Fines</Link>
              <Link href="/payment-history" className="hover:text-blue-200 transition">Payment History</Link>
              
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login"
              className="bg-white text-blue-700 px-5 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
