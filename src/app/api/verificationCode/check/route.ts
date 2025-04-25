import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();
    const { email, otp } = data;

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
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
          message: "No verification code found for this email"
        },
        { status: 400 }
      );
    }

    // Check if code is expired
    const now = new Date();
    if (now > verificationRecord.expiresAt) {
        await prisma.verificationCode.delete({
            where: { email }
          });
          
      return NextResponse.json(
        { 
          success: false,
          message: "Verification code has expired"
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

    // If we reach here, code is valid
    // Set user as verified in the user table if exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      await prisma.user.update({
        where: { email },
        data: { isVerified: true }
      });
    }

    // Delete the verification code after successful verification
    await prisma.verificationCode.delete({
      where: { email }
    });

    return NextResponse.json({
      success: true,
      message: "Verification successful"
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { 
        error: "Unable to verify code, please try again later",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 