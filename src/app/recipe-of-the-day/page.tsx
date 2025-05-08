'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Recipe {
  title: string;
  ingredients: string[];
  directions: string[];
  source: string;
  NER: string[];
  site: string;
}

export default function RecipeOfTheDay() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipeOfTheDay();
  }, []);

  const fetchRecipeOfTheDay = async () => {
    try {
      const response = await fetch('/api/recipes/random');
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }
      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      setError('Failed to fetch recipe. Please try again later.');
      console.error('Error fetching recipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRecipeUrl = (url: string) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-700 mb-4">{error}</p>
          <button
            onClick={fetchRecipeOfTheDay}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <p className="text-amber-700">No recipe available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-amber-600 hover:text-amber-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-semibold text-amber-900 mb-4">{recipe.title}</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-medium text-amber-800 mb-3">Ingredients</h2>
              <ul className="list-disc list-inside space-y-2 text-amber-700">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-medium text-amber-800 mb-3">Directions</h2>
              <ol className="list-decimal list-inside space-y-3 text-amber-700">
                {recipe.directions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-between border-t border-amber-100 pt-6">
              <div className="text-sm text-amber-600">
                Source: {recipe.source}
              </div>
              {recipe.site && (
                <a
                  href={formatRecipeUrl(recipe.site)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  View Original Recipe
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 