import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection by counting users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      userCount
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 500 }
    );
  }
} 