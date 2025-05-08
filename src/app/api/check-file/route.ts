import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'recipes_data_processing.xlsx');
    console.log('Checking file at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found', path: filePath },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    return NextResponse.json({
      success: true,
      sheets: workbook.SheetNames,
      firstRecipe: XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])[0]
    });
  } catch (error) {
    console.error('Error checking file:', error);
    return NextResponse.json(
      { error: 'Failed to read file', details: error },
      { status: 500 }
    );
  }
} 