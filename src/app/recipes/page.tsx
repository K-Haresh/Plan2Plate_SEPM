'use client';

import { useEffect, useState } from 'react';
import styles from './Recipes.module.css';

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  directions: string;
  link: string;
  site: string;
  date: string;
  rating?: number;
  review?: string;
}

export default function RecipesPage() {
  const [showRating, setShowRating] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentReview, setCurrentReview] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [activeTab, setActiveTab] = useState('add-recipe');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    directions: '',
    link: '',
    site: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/recipes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addRecipe = async () => {
    if (!formData.title || !formData.ingredients || !formData.directions) {
      alert('Please fill in all required fields');
      return;
    }

    const newRecipe = {
      title: formData.title,
      ingredients: formData.ingredients.split(',').map(ing => ing.trim()),
      directions: formData.directions,
      link: formData.link,
      site: formData.site
    };

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecipe),
      });

      if (!response.ok) {
        throw new Error('Failed to add recipe');
      }

      // Refresh recipes list
      fetchRecipes();
      
      // Reset form
      setFormData({
        title: '',
        ingredients: '',
        directions: '',
        link: '',
        site: ''
      });
      
      setSuccessMessage('Recipe added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding recipe:', err);
      alert('Failed to add recipe. Please try again.');
    }
  };

  const searchRecipes = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const shareRecipe = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const recipeText = `${recipe.title}\n\n` +
                      `Ingredients: ${recipe.ingredients.join(', ')}\n\n` +
                      `Directions: ${recipe.directions}\n\n` +
                      `${recipe.link ? 'Original link: ' + recipe.link : ''}`;

    navigator.clipboard.writeText(recipeText)
      .then(() => alert('Recipe copied to clipboard!'))
      .catch(err => console.error('Failed to copy recipe:', err));
  };
  
  const openRating = (id: string, existingRating: number = 0, existingReview: string = "") => {
    setShowRating(id);
    setCurrentRating(existingRating);
    setCurrentReview(existingReview);
    setRatingError("");
  };
  
  const submitRating = async (id: string) => {
    setRatingError("");
    try {
      const response = await fetch(`/api/recipes/${id}/rate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: currentRating,
          review: currentReview,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }
      
      setShowRating(null);
      fetchRecipes(); // Refresh the recipes to show updated rating
    } catch (err) {
      console.error('Error submitting rating:', err);
      setRatingError("Failed to submit review. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 py-12">
        <div className={styles.container}>
          <h1 className={styles.header}>Recipe Manager</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 py-12">
      <div className={styles.container}>
        <h1 className={styles.header}>Recipe Manager</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'add-recipe' ? styles.active : ''}`}
            onClick={() => handleTabChange('add-recipe')}
          >
            Add Recipe
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'share-recipe' ? styles.active : ''}`}
            onClick={() => handleTabChange('share-recipe')}
          >
            Share Recipe
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'view-recipes' ? styles.active : ''}`}
            onClick={() => handleTabChange('view-recipes')}
          >
            View All Recipes
          </button>
        </div>

        {/* Add Recipe Tab */}
        {activeTab === 'add-recipe' && (
          <div className={styles.tabContent}>
            <h2 className={styles.subheader}>Add New Recipe</h2>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Recipe title"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="ingredients">Ingredients (comma separated):</label>
              <textarea
                id="ingredients"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                placeholder="e.g. 2 eggs, 1 cup flour, 1/2 tsp salt"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="directions">Directions:</label>
              <textarea
                id="directions"
                name="directions"
                value={formData.directions}
                onChange={handleInputChange}
                placeholder="Step-by-step cooking instructions"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="link">Link (optional):</label>
              <input
                type="text"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="URL to original recipe"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="site">Source Website:</label>
              <input
                type="text"
                id="site"
                name="site"
                value={formData.site}
                onChange={handleInputChange}
                placeholder="e.g. AllRecipes, Food Network"
                className={styles.input}
              />
            </div>

            <button onClick={addRecipe} className={styles.button}>
              Save Recipe
            </button>
            {successMessage && (
              <div className={styles.successMessage}>
                {successMessage}
              </div>
            )}

            <div className={styles.recipePreview}>
              <h3 className={styles.previewTitle}>Preview</h3>
              <div className={styles.previewContent}>
                {formData.title ? (
                  <>
                    <h4 className={styles.previewTitle}>{formData.title}</h4>
                    <p className={styles.previewText}><strong>Ingredients:</strong> {formData.ingredients}</p>
                    <p className={styles.previewText}><strong>Directions:</strong> {formData.directions}</p>
                    {formData.link && <p className={styles.previewText}><strong>Link:</strong> {formData.link}</p>}
                    {formData.site && <p className={styles.previewText}><strong>Source:</strong> {formData.site}</p>}
                  </>
                ) : (
                  <p className={styles.previewText}><em>Recipe preview will appear here as you type...</em></p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share Recipe Tab */}
        {activeTab === 'share-recipe' && (
          <div className={styles.tabContent}>
            <h2 className={styles.subheader}>Share Recipe</h2>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="search-recipe">Search Recipe:</label>
              <input
                type="text"
                id="search-recipe"
                value={searchQuery}
                onChange={(e) => searchRecipes(e.target.value)}
                placeholder="Start typing recipe name..."
                className={styles.input}
              />
            </div>

            <div className={styles.searchResults}>
              {searchResults.length > 0 ? (
                searchResults.map(recipe => (
                  <div key={recipe.id} className={styles.recipeCard}>
                    <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                    <p className={styles.recipeText}><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
                    <p className={styles.recipeText}><strong>Directions:</strong> {recipe.directions}</p>
                    {recipe.link && <p className={styles.recipeText}><strong>Link:</strong> {recipe.link}</p>}
                    {recipe.site && <p className={styles.recipeText}><strong>Source:</strong> {recipe.site}</p>}
                    <button
                      onClick={() => shareRecipe(recipe.id)}
                      className={styles.shareButton}
                    >
                      Share Recipe
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.recipeText}><em>
                  {searchQuery.length > 0 
                    ? "No recipes found matching your search."
                    : "Search for a recipe to view sharing options..."}
                </em></p>
              )}
            </div>
          </div>
        )}

        {/* View All Recipes Tab */}
        {activeTab === 'view-recipes' && (
          <div className={styles.tabContent}>
            <h2 className={styles.subheader}>All Recipes</h2>
            <div id="all-recipes">
              {recipes.length > 0 ? (
                recipes.map(recipe => (
                  <div key={recipe.id} className={styles.recipeCard}>
                    <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                    <p className={styles.recipeText}><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
                    <p className={styles.recipeText}><strong>Directions:</strong> {recipe.directions}</p>
                    {recipe.link && <p className={styles.recipeText}><strong>Link:</strong> {recipe.link}</p>}
                    {recipe.site && <p className={styles.recipeText}><strong>Source:</strong> {recipe.site}</p>}
                    <div className="flex items-center mb-2">
                      <span className="mr-2 text-amber-900 font-semibold">Rating:</span>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className={star <= (recipe.rating || 0) ? "text-yellow-400" : "text-gray-300"}>★</span>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{recipe.rating ? recipe.rating.toFixed(1) : "0.0"}</span>
                    </div>
                    {recipe.review && (
                      <div className="mb-2">
                        <span className="text-amber-900 font-semibold">Review:</span>
                        <span className="ml-2 text-gray-800">{recipe.review}</span>
                      </div>
                    )}
                    <button
                      className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-700 mt-2 mr-2"
                      onClick={() => openRating(recipe.id, recipe.rating, recipe.review)}
                    >
                      Rate and Review
                    </button>
                    {/* Frontend-only Rate/Review UI */}
                    {showRating === recipe.id && (
                      <div className="mt-2 p-2 border rounded bg-amber-50">
                        <div className="flex items-center mb-2">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={star <= currentRating ? "text-yellow-400 text-2xl" : "text-gray-300 text-2xl"}
                              onClick={() => setCurrentRating(star)}
                            >★</button>
                          ))}
                        </div>
                        <textarea
                          className="border p-2 w-full rounded mb-2"
                          placeholder="Write your review..."
                          value={currentReview}
                          onChange={e => setCurrentReview(e.target.value)}
                        />
                        <button
                          className="bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 mr-2"
                          onClick={() => {
                            setRecipes(prev =>
                              prev.map(r =>
                                r.id === recipe.id
                                  ? { ...r, rating: currentRating, review: currentReview }
                                  : r
                              )
                            );
                            setShowRating(null);
                          }}
                        >
                          Submit
                        </button>
                        <button
                          className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                          onClick={() => setShowRating(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => shareRecipe(recipe.id)}
                      className={styles.shareButton}
                    >
                      Share Recipe
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.recipeText}><em>No recipes found. Add some recipes first!</em></p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}