import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = bcrypt.genSaltSync(10);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExp: resetTokenExpiry,
      },
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Plan2Plate - Password Reset Instructions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5; text-align: center;">Password Reset Instructions</h1>
          <p>Hello,</p>
          <p>You have requested to reset your password for your Plan2Plate account.</p>
          <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you did not request this password reset, please ignore this email.</p>
          <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="text-align: center; color: #666; font-size: 14px;">
            Best regards,<br/>Plan2Plate Team
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      message: 'Password reset instructions sent successfully' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to send reset instructions. Please try again.' },
      { status: 500 }
    );
  }
} 