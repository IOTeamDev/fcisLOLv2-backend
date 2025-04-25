import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();
    const { email, otp, newPassword } = data;

    // Validate required fields
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    // Check password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Find the verification code for the email
    const verificationRecord = await prisma.verificationCode.findUnique({
      where: { email }
    });

    // Check if verification code exists
    if (!verificationRecord) {
      return NextResponse.json(
        { 
          success: false,
          message: "No verification code found for this email. Please request a new code."
        },
        { status: 400 }
      );
    }

    // Check if code is expired
    const now = new Date();
    if (now > verificationRecord.expiresAt) {
      // Delete expired code
      await prisma.verificationCode.delete({
        where: { email }
      });
      
      return NextResponse.json(
        { 
          success: false,
          message: "Verification code has expired. Please request a new code."
        },
        { status: 400 }
      );
    }

    // Check if code matches
    if (verificationRecord.otp !== otp) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid verification code"
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "No user found with this email address"
        },
        { status: 404 }
      );
    }

    // Update password
    await prisma.user.update({
      where: { email },
      data: { 
        password: newPassword,
        isVerified: true  // Also mark as verified if not already
      }
    });

    // Delete the verification code after successful password reset
    await prisma.verificationCode.delete({
      where: { email }
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { 
        error: "Unable to reset password, please try again later",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 