'use client';

import MealPlanner from '@/components/MealPlanner';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function MealPlannerPage() {
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
                  Create your weekly meal plan and get a comprehensive shopping list with all the ingredients you need.
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Meal Planner Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-amber-500 text-white mx-auto">
              <ClipboardDocumentListIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-amber-900 sm:text-4xl">
              Weekly Meal Planner
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-amber-600 lg:mx-auto">
              Plan your meals for the week and get a detailed shopping list
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <MealPlanner />
          </div>
        </div>
      </div>
    </div>
  );
} 