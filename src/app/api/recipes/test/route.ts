import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    console.log('Starting test endpoint...');
    const filePath = path.join(process.cwd(), 'public', 'recipes_data_processing.xlsx');
    console.log('File path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found at:', filePath);
      return NextResponse.json(
        { error: 'File not found', path: filePath },
        { status: 404 }
      );
    }

    console.log('File exists, reading workbook...');
    const workbook = XLSX.readFile(filePath);
    console.log('Workbook sheets:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('First row of data:', data[0]);
    console.log('Total rows:', data.length);

    return NextResponse.json({
      message: 'File read successfully',
      sheetName,
      totalRows: data.length,
      firstRow: data[0]
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to read file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 