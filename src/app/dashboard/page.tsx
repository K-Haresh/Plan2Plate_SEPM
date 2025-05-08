'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, CalendarIcon, ArrowRightIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';


export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for token in cookies
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token.split('=')[1]}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
          setIsAuthenticated(true);
        } else {
          // Clear invalid token
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Welcome back,</span>
                  <span className="block text-indigo-600">{userName}</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Ready to discover your next culinary adventure? Let's get cooking!
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to cook better
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Recipe Search Feature */}
              <Link 
                href="/search"
                className="relative group cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="absolute inset-0 group-hover:bg-indigo-50 transition duration-300 rounded-lg"></div>
                <div className="relative p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MagnifyingGlassIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Recipe Search</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Find recipes based on the ingredients you have. No more wasted groceries!
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Upload Recipe Feature */}
              <Link 
                href="/recipes"
                className="relative group cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="absolute inset-0 group-hover:bg-indigo-50 transition duration-300 rounded-lg"></div>
                <div className="relative p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Recipe</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Add your own recipes to the database and view them anytime!
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Recipe of the Day Feature */}
              <Link 
                href="/recipe-of-the-day"
                className="relative group cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="absolute inset-0 group-hover:bg-indigo-50 transition duration-300 rounded-lg"></div>
                <div className="relative p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Recipe of the Day</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Discover a new recipe every day to keep your meals exciting and fresh.
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to start cooking?</span>
            <span className="block text-indigo-600">Let's find your next recipe.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transform transition-all hover:scale-105"
              >
                Get Started
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 