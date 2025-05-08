'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Recipe Search', href: '/recipes', icon: MagnifyingGlassIcon },
    { name: 'Recipe of the Day', href: '/dashboard/recipe-of-the-day', icon: CalendarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 bg-indigo-600">
            <h1 className="text-xl font-bold text-white">Plan2Plate</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-indigo-500' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`pl-64 ${!isSidebarOpen && 'pl-0'}`}>
        <div className="p-6">{children}</div>
      </div>

      {/* Mobile menu button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg"
        >
          <HomeIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
} 