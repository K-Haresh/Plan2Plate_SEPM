import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExp,
      },
    });

    // Send reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return NextResponse.json(
        { message: 'Failed to send reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Password reset instructions have been sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 