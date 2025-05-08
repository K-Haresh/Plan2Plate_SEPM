"use client";

import { useState } from "react";

export default function RecipeSearchPage() {
  const [ingredients, setIngredients] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const response = await fetch("/api/recipes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean) })
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "No recipes found.");
        setResults([]);
      } else {
        const data = await response.json();
        setResults(data);
      }
    } catch (e) {
      setError("Failed to search recipes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipe Search</h1>
      <div className="mb-4">
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="Enter ingredients, separated by commas"
          value={ingredients}
          onChange={e => setIngredients(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
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
            {results.map((recipe, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded bg-white">
                <h3 className="font-bold text-amber-700">{recipe.title}</h3>
                <p className="text-gray-800">
                  <strong className="text-amber-900">Ingredients:</strong> {Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients}
                </p>
                <p className="text-gray-800">
                  <strong className="text-amber-900">Directions:</strong> {Array.isArray(recipe.directions) ? recipe.directions.join(" ") : recipe.directions}
                </p>
                {recipe.source && (
                  <p className="text-gray-800">
                    <strong className="text-amber-900">Source:</strong> {recipe.source}
                  </p>
                )}
                {recipe.site && (
                  <p className="text-gray-800">
                    <strong className="text-amber-900">Site:</strong> {recipe.site}
                  </p>
                )}
                {recipe.matchPercentage && (
                  <p className="text-gray-800">
                    <strong className="text-amber-900">Match:</strong> {recipe.matchPercentage.toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 