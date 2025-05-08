import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(ingredients.map((ing: { name: string }) => ing.name));
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    );
  }
} 