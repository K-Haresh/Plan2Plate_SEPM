// app/api/recipes/[id]/rate/route.js
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Path to our recipes data file
const dataFilePath = path.join(process.cwd(), 'data', 'recipes.json');

// Helper function to read the recipes data
async function getRecipesData() {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading recipes data:', error);
    return [];
  }
}

// Helper function to write recipes data
async function saveRecipesData(data) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving recipes data:', error);
    throw error;
  }
}

// PUT handler - Update recipe rating and review
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { rating, review } = await request.json();
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Get recipes
    const recipes = await getRecipesData();
    
    // Find recipe by ID
    const recipeIndex = recipes.findIndex(recipe => recipe.id === id);
    
    if (recipeIndex === -1) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    // Update recipe rating and review
    recipes[recipeIndex].rating = rating;
    recipes[recipeIndex].review = review || '';
    
    // Save updated recipes
    await saveRecipesData(recipes);
    
    return NextResponse.json(recipes[recipeIndex]);
  } catch (error) {
    console.error('Failed to update recipe rating:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe rating' },
      { status: 500 }
    );
  }
}