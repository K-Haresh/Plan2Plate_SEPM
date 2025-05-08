'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, CalendarIcon, ClipboardDocumentListIcon, ClockIcon } from '@heroicons/react/24/outline';
import TimerManager from '@/components/TimerManager';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<any[]>([]);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      const isAuthenticated = !!token;
      setIsLoggedIn(isAuthenticated);
    };

    // Check auth immediately
    checkAuth();

    // Check auth every 100ms for the first 2 seconds after mount
    const interval = setInterval(checkAuth, 100);
    const timeout = setTimeout(() => clearInterval(interval), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = localStorage.getItem('favoriteRecipes');
      setFavoriteRecipes(favs ? JSON.parse(favs) : []);
    }
  }, []);

  // No need to fetch or link, just use favoriteRecipes directly

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-amber-900 sm:text-5xl md:text-6xl">
                  <span className="block">Map your meals,</span>
                  <span className="block text-amber-600">Munch with ease</span>
                </h1>
                <p className="mt-3 text-base text-amber-700 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover delicious recipes, plan your meals, and make cooking a breeze with Plan2Plate.
                </p>
                {!isLoggedIn && (
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <Link
                      href="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-amber-600 font-semibold tracking-wide uppercase">Quick Access</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-amber-900 sm:text-4xl">
              Explore Plan2Plate Features
            </p>
          </div>

            {/* Favorite Recipes Section */}
            <div className="mt-10 mb-10">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-2xl font-bold text-amber-700 mb-4">Favorite Recipes</h3>
                {favoriteRecipes.length === 0 ? (
                  <div className="text-amber-600">You have no favorite recipes yet. Add some from the Recipes page!</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favoriteRecipes.map(recipe => (
                      <div key={recipe.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
                        <div className="bg-amber-500 p-3 rounded mb-4">
                          <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-amber-900 mb-2">{recipe.title}</h4>
                        <p className="text-amber-700 mb-2"><span className="font-semibold">Ingredients:</span> {Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients}</p>
                        <p className="text-amber-700 mb-2"><span className="font-semibold">Directions:</span> {Array.isArray(recipe.directions) ? recipe.directions.join(' ') : recipe.directions}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Recipe Search Feature */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
              <div className="bg-amber-500 p-3 rounded mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">Recipe Search</h3>
              <p className="text-amber-700 mb-4">
                Find recipes based on ingredients you have. Add ingredients one by one and discover new dishes.
              </p>
              <Link href="/search">
                <button className="bg-amber-600 text-white px-4 py-2 rounded font-semibold hover:bg-amber-700">
                  Search Recipes
                </button>
              </Link>
            </div>

            {/* Recipe of the Day Feature */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
              <div className="bg-amber-500 p-3 rounded mb-4">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">Recipe of the Day</h3>
              <p className="text-amber-700 mb-4">
                Get inspired with a new recipe every day. Perfect for when you're looking for something different.
              </p>
              <Link href="/recipe-of-the-day">
                <button className="bg-amber-600 text-white px-4 py-2 rounded font-semibold hover:bg-amber-700">
                  View Today's Recipe
                </button>
              </Link>
            </div>

            {/* Upload Recipe Feature */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
              <div className="bg-amber-500 p-3 rounded mb-4">
                <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">Upload Recipe</h3>
              <p className="text-amber-700 mb-4">
                Add your own recipes to the database and view them anytime!
              </p>
              <Link href="/recipes">
                <button className="bg-amber-600 text-white px-4 py-2 rounded font-semibold hover:bg-amber-700">
                  Upload Recipe
                </button>
              </Link>
            </div>

            <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-amber-500 text-white">
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-amber-900">Meal Planner</p>
                <p className="mt-2 ml-16 text-base text-amber-600">
                  Plan your meals for the week and get a comprehensive shopping list with all the ingredients you need.
                </p>
                {isLoggedIn && (
                  <div className="mt-4 ml-16">
                    <Link
                      href="/meal-planner"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                    >
                      Plan Your Meals
                    </Link>
                  </div>
                )}
              </div>


              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-amber-500 text-white">
                  <ClockIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-amber-900">Cooking Timer</p>
                <p className="mt-2 ml-16 text-base text-amber-600">
                  Manage multiple cooking timers for different dishes. Never miss a perfect cooking time again.
                </p>
                {isLoggedIn && (
                  <div className="mt-4 ml-16">
                    <button
                      onClick={() => setShowTimer(!showTimer)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                    >
                      {showTimer ? 'Hide Timer' : 'Show Timer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      

      {/* Timer Section */}
      {isLoggedIn && showTimer && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <TimerManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
