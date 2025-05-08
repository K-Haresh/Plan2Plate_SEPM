import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';


export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one ingredient' },
        { status: 400 }
      );
    }

    // Read the Excel file from the public directory
    const filePath = path.join(process.cwd(), 'public', 'recipes_data_processing.xlsx');
    console.log('Reading Excel file from:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found at:', filePath);
      return NextResponse.json(
        { error: 'Recipes file not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    console.log('Excel file read successfully');
    console.log('Available sheets:', workbook.SheetNames);
    
    // Use the correct sheet name
    const worksheet = workbook.Sheets['recipes_data'];
    
    // Convert to JSON
    const recipes = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${recipes.length} recipes in the Excel file`);

    // Filter recipes that contain all specified ingredients and calculate match percentage
    const matchingRecipes = recipes.filter((recipe: any) => {
      try {
        if (!recipe.ingredients) {
          console.log('Recipe missing ingredients:', recipe);
          return false;
        }
        
        const recipeIngredients = JSON.parse(recipe.ingredients);
        console.log('Searching for ingredients:', ingredients);
        console.log('Recipe ingredients:', recipeIngredients);
        
        // Calculate match percentage
        let matchedIngredients = 0;
        const matches = ingredients.every(searchIngredient => {
          const found = recipeIngredients.some((recipeIngredient: string) => {
            const match = recipeIngredient.toLowerCase().includes(searchIngredient.toLowerCase());
            if (match) {
              matchedIngredients++;
              console.log(`Found match: "${searchIngredient}" in "${recipeIngredient}"`);
            }
            return match;
          });
          if (!found) {
            console.log(`No match found for: "${searchIngredient}"`);
          }
          return found;
        });
        
        if (matches) {
          // Calculate match percentage
          const matchPercentage = (matchedIngredients / ingredients.length) * 100;
          console.log(`Found matching recipe: ${recipe.title} with ${matchPercentage.toFixed(1)}% match`);
          // Add match percentage to the recipe object
          recipe.matchPercentage = matchPercentage;
        }
        
        return matches;
      } catch (e) {
        console.error('Error parsing ingredients for recipe:', recipe, e);
        return false;
      }
    });

    console.log(`Found ${matchingRecipes.length} matching recipes`);

    if (matchingRecipes.length === 0) {
      return NextResponse.json(
        { error: 'No recipes found with the specified ingredients' },
        { status: 404 }
      );
    }

    // Sort recipes by match percentage in descending order
    matchingRecipes.sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);

    // Format the recipes data
    const formattedRecipes = matchingRecipes.map((recipe: any) => ({
      id: uuidv4(),
      title: recipe.title || '',
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : JSON.parse(recipe.ingredients || '[]'),
      directions: Array.isArray(recipe.directions)
        ? recipe.directions
        : JSON.parse(recipe.directions || '[]'),
      source: recipe.source || '',
      NER: Array.isArray(recipe.NER) ? recipe.NER : [],
      site: recipe.site || '',
      matchPercentage: recipe.matchPercentage || 0
    }));

    return NextResponse.json(formattedRecipes);
  } catch (error) {
    console.error('Error searching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes. Please try again.' },
      { status: 500 }
    );
  }
} 