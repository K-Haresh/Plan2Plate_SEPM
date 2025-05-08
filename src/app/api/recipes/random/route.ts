import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface RecipeData {
  title: string;
  ingredients: string | string[];
  directions: string | string[];
  link: string;
  source: string;
  NER?: string;
  site?: string;
}

export async function GET() {
  try {
    console.log('Starting to fetch random recipe...');
    
    // Fetch the Excel file
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/recipes_data_processing.xlsx`);
    if (!response.ok) {
      throw new Error('Failed to fetch Excel file');
    }
    
    // Get the file as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    console.log('Excel file fetched successfully');
    
    // Read the workbook
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = 'recipes_data';
    console.log('Sheet name:', sheetName);
    
    if (!workbook.Sheets[sheetName]) {
      console.error('Sheet not found:', sheetName);
      return NextResponse.json(
        { error: 'Sheet not found in Excel file' },
        { status: 404 }
      );
    }

    const worksheet = workbook.Sheets[sheetName];
    const recipes = XLSX.utils.sheet_to_json<RecipeData>(worksheet);
    console.log('Number of recipes found:', recipes.length);

    if (!recipes || recipes.length === 0) {
      console.error('No recipes found in the file');
      return NextResponse.json(
        { error: 'No recipes found in the file' },
        { status: 404 }
      );
    }

    // Get today's recipe based on the current date
    const today = new Date();
    const recipeIndex = today.getDate() % recipes.length;
    const randomRecipe = recipes[recipeIndex];
    console.log('Selected recipe for today:', randomRecipe.title);

    // Format the recipe data
    const formattedRecipe = {
      title: randomRecipe.title || '',
      ingredients: Array.isArray(randomRecipe.ingredients) 
        ? randomRecipe.ingredients 
        : JSON.parse(randomRecipe.ingredients || '[]'),
      directions: Array.isArray(randomRecipe.directions)
        ? randomRecipe.directions
        : JSON.parse(randomRecipe.directions || '[]'),
      link: randomRecipe.link || '',
      source: randomRecipe.source || '',
      NER: randomRecipe.NER || '',
      site: randomRecipe.site || ''
    };

    console.log('Returning formatted recipe');
    return NextResponse.json(formattedRecipe);
  } catch (error) {
    console.error('Detailed error in random recipe endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random recipe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 