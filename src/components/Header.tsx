'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, CalendarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserName(data.name);
        setIsLoggedIn(true);
      } else {
        // If the token is invalid, clear it
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsLoggedIn(false);
    setUserName('');
    router.push('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/plan2plate-logo.jpg"
                alt="Plan2Plate Logo"
                width={100}
                height={100}
                className="mr-2"
                priority
              />
              <span className="text-xl font-semibold text-amber-600">Plan2Plate</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/recipes"
                      className="inline-flex items-center text-amber-600 hover:text-amber-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
                      Recipe Search
                    </Link>
                    <Link
                      href="/recipe-of-the-day"
                      className="inline-flex items-center text-amber-600 hover:text-amber-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <CalendarIcon className="h-5 w-5 mr-1" />
                      Recipe of the Day
                    </Link>
                    <Link
                      href="/meal-planner"
                      className="inline-flex items-center text-amber-600 hover:text-amber-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <ClipboardDocumentListIcon className="h-5 w-5 mr-1" />
                      Meal Planner
                    </Link>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-700 font-medium">Welcome, {userName}</span>
                      <button
                        onClick={handleLogout}
                        className="bg-amber-600 text-white hover:bg-amber-700 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-amber-600 hover:text-amber-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 