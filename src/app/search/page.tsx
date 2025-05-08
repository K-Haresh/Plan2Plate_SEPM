"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function RecipeSearchPage() {
  const [ingredients, setIngredients] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const RESULTS_PER_PAGE = 10;
  
  // Change favorites to store objects with id, title, ingredients, directions
  const [favorites, setFavorites] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const favs = localStorage.getItem('favoriteRecipes');
      return favs ? JSON.parse(favs) : [];
    }
    return [];
  });

  // Memoize the favorites set for faster lookups by id
  const favoritesIdSet = useMemo(() => new Set(favorites.map(fav => fav.id)), [favorites]);

  // Sync favorites to localStorage with throttling to prevent excessive writes
  useEffect(() => {
    const saveToLocalStorage = () => {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    };
    
    // Delay saving to localStorage to batch updates
    const timeoutId = setTimeout(saveToLocalStorage, 500);
    return () => clearTimeout(timeoutId);
  }, [favorites]);

  // Custom debounce implementation
  const debounceTimeout = useRef(null);
  
  // Search function with custom debouncing and debug logging
  const debouncedSearch = useCallback(async (ingredientList) => {
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Set a new timeout
    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      
      try {
        console.log("Searching for:", ingredientList);
        
        const response = await fetch("/api/recipes/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ingredients: ingredientList,
            page: 1,
            limit: RESULTS_PER_PAGE
          })
        });
        
        // Log the raw response for debugging
        const rawData = await response.text();
        console.log("Raw API response:", rawData);
        
        // Try to parse the response
        let data;
        try {
          data = JSON.parse(rawData);
        } catch (parseError) {
          console.error("Failed to parse API response:", parseError);
          setError("Invalid response from server");
          setResults([]);
          return;
        }
        
        console.log("Parsed API response:", data);
        
        // Check for error message in response
        if (data.error) {
          setError(data.error);
          setResults([]);
          setHasMore(false);
        } 
        // Check if we have recipes array directly
        else if (Array.isArray(data)) {
          setResults(data);
          setHasMore(false); // No pagination info in this format
          setPage(1);
        } 
        // Check for recipes property
        else if (data.recipes && Array.isArray(data.recipes)) {
          setResults(data.recipes);
          setHasMore(data.hasMore || false);
          setPage(1);
        }
        // Check for matches property (assuming it might be named differently)
        else if (data.matches && Array.isArray(data.matches)) {
          setResults(data.matches);
          setHasMore(data.hasMore || false);
          setPage(1);
        }
        // Handle case where API returns message about found recipes but doesn't return them
        else if (rawData.includes("Found") && rawData.includes("matching recipes")) {
          setError("API found recipes but didn't return them properly. Please check server logs.");
          setResults([]);
        }
        else {
          setError("Unexpected response format from server");
          setResults([]);
        }
      } catch (e) {
        console.error("Search error:", e);
        setError("Failed to search recipes: " + e.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  const handleSearch = () => {
    const ingredientList = ingredients
      .split(",")
      .map(i => i.trim())
      .filter(Boolean);
      
    if (ingredientList.length === 0) {
      setError("Please enter at least one ingredient");
      return;
    }
    
    // Cancel any pending debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Immediate search when button is clicked
    setLoading(true);
    setError("");
    
    console.log("Searching for:", ingredientList);
    
    fetch("/api/recipes/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ingredients: ingredientList,
        page: 1,
        limit: RESULTS_PER_PAGE
      })
    })
    .then(response => response.text())
    .then(rawData => {
      console.log("Raw API response:", rawData);
      
      // Try to parse the response
      let data;
      try {
        data = JSON.parse(rawData);
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError);
        
        // Check if the response contains text about found recipes
        if (rawData.includes("Found") && rawData.includes("matching recipes")) {
          setError("API found recipes but didn't return them properly. Please check server logs.");
        } else {
          setError("Invalid response from server");
        }
        setResults([]);
        return;
      }
      
      console.log("Parsed API response:", data);
      
      // Check for error message in response
      if (data.error) {
        setError(data.error);
        setResults([]);
        setHasMore(false);
      } 
      // Check if we have recipes array directly
      else if (Array.isArray(data)) {
        setResults(data);
        setHasMore(false); // No pagination info in this format
        setPage(1);
      } 
      // Check for recipes property
      else if (data.recipes && Array.isArray(data.recipes)) {
        setResults(data.recipes);
        setHasMore(data.hasMore || false);
        setPage(1);
      }
      // Check for matches property (assuming it might be named differently)
      else if (data.matches && Array.isArray(data.matches)) {
        setResults(data.matches);
        setHasMore(data.hasMore || false);
        setPage(1);
      }
      else {
        setError("Unexpected response format from server");
        setResults([]);
      }
    })
    .catch(e => {
      console.error("Search error:", e);
      setError("Failed to search recipes: " + e.message);
      setResults([]);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const loadMoreResults = async () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    setLoading(true);
    
    try {
      const ingredientList = ingredients
        .split(",")
        .map(i => i.trim())
        .filter(Boolean);
        
      const response = await fetch("/api/recipes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredients: ingredientList,
          page: nextPage,
          limit: RESULTS_PER_PAGE
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(prev => [...prev, ...(data.recipes || [])]);
        setHasMore(data.hasMore || false);
        setPage(nextPage);
      }
    } catch (e) {
      setError("Failed to load more results.");
    } finally {
      setLoading(false);
    }
  };

  // Update toggleFavorite to store/remove full recipe objects
  const toggleFavorite = useCallback((recipe: any) => {
    setFavorites((prev: any[]) => {
      const exists = prev.some(fav => fav.id === recipe.id);
      if (exists) {
        return prev.filter(fav => fav.id !== recipe.id);
      } else {
        // Store only the fields needed for display
        return [
          ...prev,
          {
            id: recipe.id,
            title: recipe.title,
            ingredients: recipe.ingredients,
            directions: recipe.directions
          }
        ];
      }
    });
  }, []);

  // State for managing expanded recipe details
  const [expandedRecipes, setExpandedRecipes] = useState(new Set());
  
  const toggleRecipeDetails = useCallback((recipeId) => {
    setExpandedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  }, []);

  // Recipe card component for better performance
  const RecipeCard = useCallback(({ recipe }: { recipe: any }) => {
    // Update isFavorite logic
    const isFavorite = favoritesIdSet.has(recipe.id);
    
    return (
      <div className="mb-4 p-4 border rounded bg-white relative">
        <button
          onClick={() => toggleFavorite(recipe)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          {isFavorite ? (
            <HeartIconSolid className="h-6 w-6 text-red-500" />
          ) : (
            <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
          )}
        </button>
        <h3 className="font-bold text-amber-700">{recipe.title}</h3>
        <p className="text-gray-800">
          <strong className="text-amber-900">Ingredients:</strong> {
            Array.isArray(recipe.ingredients) 
              ? recipe.ingredients.join(", ") 
              : recipe.ingredients
          }
        </p>
        {recipe.matchPercentage && (
          <p className="text-gray-800">
            <strong className="text-amber-900">Match:</strong> {recipe.matchPercentage.toFixed(1)}%
          </p>
        )}
        <button 
          className="mt-2 text-amber-600 hover:text-amber-800 font-medium"
          onClick={() => toggleRecipeDetails(recipe.id)}
        >
          {expandedRecipes.has(recipe.id) ? "Hide Details" : "Show Details"}
        </button>
        
        {expandedRecipes.has(recipe.id) && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-gray-800">
              <strong className="text-amber-900">Directions:</strong> {
                Array.isArray(recipe.directions) 
                  ? recipe.directions.join(" ") 
                  : recipe.directions
              }
            </p>
            {recipe.source && (
              <p className="text-gray-700 text-sm">
                <strong className="text-amber-900">Source:</strong> {recipe.source}
              </p>
            )}
            {recipe.site && (
              <p className="text-gray-700 text-sm">
                <strong className="text-amber-900">Site:</strong> {recipe.site}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }, [favoritesIdSet, toggleFavorite, expandedRecipes, toggleRecipeDetails]);

  // Keyboard handler for accessibility
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipe Search</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          className="border p-2 flex-grow rounded"
          placeholder="Enter ingredients, separated by commas"
          value={ingredients}
          onChange={e => setIngredients(e.target.value)}
          onKeyPress={handleKeyPress}
          aria-label="Ingredient search"
        />
        <button
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 whitespace-nowrap"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      
      {error && <div className="text-red-600 mb-2">{error}</div>}
      
      <div>
        {results.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Results:</h2>
            <div className="space-y-2">
              {results.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
                  onClick={loadMoreResults}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}