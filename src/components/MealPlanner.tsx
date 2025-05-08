'use client';

import { useState, useEffect } from 'react';
import { useExcelData } from '../lib/dataLoader';
import { ClipboardDocumentListIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Recipe {
  title: string;
  ingredients: string[];
  directions?: string[];
  link?: string;
  NER: string[];
  site?: string;
}

interface MealState {
  [key: string]: string;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}

export default function MealPlanner() {
  const { data: recipes, loading, error } = useExcelData('/recipes_data_processing.xlsx');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [currentDay, setCurrentDay] = useState(0);
  const [meals, setMeals] = useState<MealState>({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: ''
  });
  const [currentInput, setCurrentInput] = useState('');
  const [allMealsEntered, setAllMealsEntered] = useState(false);
  const [askGenerateList, setAskGenerateList] = useState(false);
  const [askChangeRecipe, setAskChangeRecipe] = useState(false);
  const [changeDayInput, setChangeDayInput] = useState('');
  const [showIngredients, setShowIngredients] = useState(false);
  const [changeDay, setChangeDay] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState<Recipe | null>(null);
  const [ingredientList, setIngredientList] = useState<{ [key: string]: string[] }>({});

  // Debug useEffect to log recipe data
  useEffect(() => {
    if (recipes && recipes.length > 0) {
      console.log('Recipes loaded:', recipes);
    }
  }, [recipes]);

  // Find recipe data based on name
  const findRecipe = (recipeName: string): Recipe | undefined => {
    if (!recipes || recipes.length === 0) return undefined;
    const foundRecipe = recipes.find((recipe: Recipe) =>
      recipe.title.toLowerCase().includes(recipeName.toLowerCase())
    );
    console.log('Looking for recipe:', recipeName);
    console.log('Found recipe:', foundRecipe);
    return foundRecipe;
  };

  // Generate suggestions based on user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCurrentInput(input);

    if (input.length > 1 && recipes && recipes.length > 0) {
      const filtered = recipes
        .filter((recipe: Recipe) => recipe.title.toLowerCase().includes(input.toLowerCase()))
        .map((recipe: Recipe) => recipe.title);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select suggestion
  const selectSuggestion = (suggestion: string) => {
    setCurrentInput(suggestion);
    setShowSuggestions(false);
    const recipe = findRecipe(suggestion);
    setSelectedRecipeDetails(recipe || null);
  };

  // Get all ingredients from meal plan with recipe usage mapping
  const getIngredientUsage = () => {
    const ingredientMap: { [key: string]: string[] } = {};

    Object.entries(meals).forEach(([day, meal]) => {
      if (!meal) return; // Skip empty meals
      
      const recipe = findRecipe(meal);
      console.log(`Processing meal for ${day}:`, meal);
      console.log('Found recipe:', recipe);

      if (recipe && recipe.NER) {
        recipe.NER.forEach(ingredient => {
          if (!ingredientMap[ingredient]) {
            ingredientMap[ingredient] = [];
          }
          if (!ingredientMap[ingredient].includes(day)) {
            ingredientMap[ingredient].push(day);
          }
        });
      }
    });

    console.log('Generated ingredient map:', ingredientMap);
    return ingredientMap;
  };

  // Handle day meal input
  const handleDayInput = () => {
    if (!currentInput.trim()) return;

    const day = days[currentDay];
    setMeals({...meals, [day]: currentInput});
    setCurrentInput('');
    setSelectedRecipeDetails(null);

    if (currentDay < days.length - 1) {
      setCurrentDay(currentDay + 1);
    } else {
      setAllMealsEntered(true);
      setAskGenerateList(true);
    }
  };

  // Handle generate list response
  const handleGenerateListResponse = (response: 'Yes' | 'No') => {
    if (response === 'Yes') {
      const ingredients = getIngredientUsage();
      setIngredientList(ingredients);
      setShowIngredients(true);
    } else {
      setAskChangeRecipe(true);
    }
    setAskGenerateList(false);
  };

  // Handle change recipe response
  const handleChangeRecipeResponse = (response: 'Yes' | 'No') => {
    if (response === 'Yes') {
      setChangeDay('');
      setChangeDayInput('');
    } else {
      setAskGenerateList(true);
    }
    setAskChangeRecipe(false);
  };

  // Update recipe for a day
  const updateDayRecipe = () => {
    if (!changeDayInput.trim()) return;

    setMeals({...meals, [changeDay]: changeDayInput});
    setChangeDayInput('');
    setChangeDay('');
    setAskGenerateList(true);
  };

  // Reset the process
  const resetPlanner = () => {
    setCurrentDay(0);
    setMeals({
      Monday: '',
      Tuesday: '',
      Wednesday: '',
      Thursday: '',
      Friday: '',
      Saturday: '',
      Sunday: ''
    });
    setCurrentInput('');
    setAllMealsEntered(false);
    setAskGenerateList(false);
    setAskChangeRecipe(false);
    setShowIngredients(false);
    setSelectedRecipeDetails(null);
  };

  // Get recipe details for a specific day
  const getDayRecipeDetails = (day: string): Recipe | null => {
    const recipe = findRecipe(meals[day]);
    return recipe || null;
  };

  if (loading) return (
    <div className="text-center p-6">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
      <p className="mt-4 text-amber-700">Loading recipe database...</p>
    </div>
  );

  if (error) return (
    <div className="text-center p-6 text-red-500">
      <p>Error loading recipes. Please check your Excel file.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Display Current Meal Plan */}
      {Object.entries(meals).some(([_, meal]) => meal !== '') && (
        <div className="mb-8 bg-amber-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-amber-900">Your Meal Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(meals).map(([day, meal]) => (
              meal && (
                <div key={day} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <CheckCircleIcon className="h-5 w-5 text-amber-600 mr-2" />
                  <div>
                    <p className="font-medium text-amber-900">{day}</p>
                    <p className="text-amber-700">{meal}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {!allMealsEntered && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-amber-900">What would you like to eat on {days[currentDay]}?</h2>
          <div className="relative">
            <input
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              className="w-full border-2 border-amber-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-amber-900 placeholder-amber-400"
              placeholder="Enter a meal"
            />
            {showSuggestions && (
              <ul className="absolute z-10 w-full bg-white border-2 border-amber-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-3 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-b-0 text-amber-900"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleDayInput}
            className="mt-4 w-full bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Submit
          </button>
        </div>
      )}

      {showIngredients && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-amber-900 flex items-center">
            <ClipboardDocumentListIcon className="h-6 w-6 mr-2" />
            Shopping List
          </h2>
          {Object.keys(ingredientList).length === 0 ? (
            <div className="text-center p-6 bg-amber-50 rounded-lg">
              <p className="text-amber-700">No ingredients found. Please make sure you've entered valid recipe names.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {Object.entries(ingredientList).map(([ingredient, days]) => (
                <li key={ingredient} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="font-medium text-amber-900">{ingredient}</span>
                  <span className="text-sm text-amber-600">Used on: {days.join(', ')}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={resetPlanner}
            className="mt-6 w-full bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Start Over
          </button>
        </div>
      )}

      {askGenerateList && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-amber-900">Would you like to generate the shopping list?</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleGenerateListResponse('Yes')}
              className="flex-1 bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => handleGenerateListResponse('No')}
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}

      {askChangeRecipe && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-amber-900">Do you wish to change any day's recipe?</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleChangeRecipeResponse('Yes')}
              className="flex-1 bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => handleChangeRecipeResponse('No')}
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}

      {changeDay === '' && askChangeRecipe === false && askGenerateList === false && allMealsEntered && !showIngredients && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-amber-900">What day's recipe do you want to change?</h2>
          <div className="flex">
            <input
              type="text"
              value={changeDayInput}
              onChange={(e) => setChangeDayInput(e.target.value)}
              className="flex-grow border border-amber-300 p-3 rounded-l-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter day (e.g., Monday)"
            />
            <button
              onClick={() => {
                if (days.includes(changeDayInput)) {
                  setChangeDay(changeDayInput);
                } else {
                  alert('Please enter a valid day of the week');
                }
              }}
              className="bg-amber-600 text-white px-4 py-3 rounded-r-lg hover:bg-amber-700 transition-colors"
            >
              Select Day
            </button>
          </div>
        </div>
      )}

      {changeDay !== '' && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-amber-900">Enter new recipe for {changeDay}</h2>
          <div className="flex">
            <input
              type="text"
              value={changeDayInput}
              onChange={(e) => setChangeDayInput(e.target.value)}
              className="flex-grow border border-amber-300 p-3 rounded-l-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter new recipe"
            />
            <button
              onClick={updateDayRecipe}
              className="bg-amber-600 text-white px-4 py-3 rounded-r-lg hover:bg-amber-700 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 