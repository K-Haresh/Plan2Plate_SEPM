// app/api/recipes/route.js
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Path to our recipes data file
const dataFilePath = path.join(process.cwd(), 'data', 'recipes.json');

// Helper function to read the recipes data
async function getRecipesData() {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    console.error('Error reading recipes data:', error);
    return [];
  }
}

// Helper function to write recipes data
async function saveRecipesData(data) {
  try {
    const dirPath = path.join(process.cwd(), 'data');
    
    // Create directory if it doesn't exist
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
    
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving recipes data:', error);
    throw error;
  }
}

// GET handler - Get all recipes
export async function GET() {
  try {
    const recipes = await getRecipesData();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Failed to get recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' }, 
      { status: 500 }
    );
  }
}

// POST handler - Create a new recipe
export async function POST(request) {
  try {
    const recipes = await getRecipesData();
    const newRecipe = await request.json();
    
    // Validate required fields
    if (!newRecipe.title || !newRecipe.ingredients || !newRecipe.directions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Add metadata
    const recipeToSave = {
      id: uuidv4(), // Generate unique ID
      ...newRecipe,
      date: new Date().toISOString(),
      rating: 0,
      review: ''
    };
    
    // Add to recipes array
    recipes.push(recipeToSave);
    
    // Save to file
    await saveRecipesData(recipes);
    
    return NextResponse.json(recipeToSave, { status: 201 });
  } catch (error) {
    console.error('Failed to create recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}