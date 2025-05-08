'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Recipe {
  title: string;
  ingredients: string[];
  directions?: string[];
  link?: string;
  NER: string[];
  site?: string;
}

export function useExcelData(filePath: string) {
  const [data, setData] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Use the recipes_data sheet
        const worksheet = workbook.Sheets['recipes_data'];
        if (!worksheet) {
          throw new Error('recipes_data sheet not found in Excel file');
        }

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process the data to match your recipe format
        const processedData = jsonData.map((row: any) => {
          try {
            return {
              title: row.title || '',
              ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : (row.ingredients || []),
              directions: typeof row.directions === 'string' ? JSON.parse(row.directions) : (row.directions || []),
              link: row.link || '',
              NER: typeof row.NER === 'string' ? JSON.parse(row.NER) : (row.NER || []),
              site: row.site || ''
            };
          } catch (e) {
            console.error('Error processing row:', row, e);
            return null;
          }
        }).filter(Boolean) as Recipe[];

        console.log('Loaded recipes:', processedData.length);
        setData(processedData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading Excel file:", err);
        setError(err as Error);
        setLoading(false);
      }
    }

    fetchData();
  }, [filePath]);

  return { data, loading, error };
} 