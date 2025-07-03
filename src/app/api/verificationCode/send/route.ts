import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

// Generate random 6-digit code
function generateOTP(): string {
  return (100000 + Math.floor(Math.random() * 900000)).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();
    const { recipientEmail, recipientName } = data;

    // Validate required fields
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Set expiry time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Log OTP for development purposes
    console.log(`OTP for ${recipientEmail}: ${otp}`);

    // Create HTML email content
    const htmlContent = `<html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: #fff; padding: 20px; border-radius: 8px; max-width: 500px; margin: auto; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
          h2 { color: #333; }
          p { font-size: 16px; color: #555; }
          .otp { font-size: 18px; font-weight: bold; color: #007BFF; }
        </style>
      </head>
      <body>
        <div class='container'>
          <h2>Hello ${recipientName || 'User'},</h2>
          <p>Welcome to UniNotes! Your one-time password (OTP) is:</p>
          <p class='otp'>${otp}</p>
          <p>Please use this code to complete your verification.</p>
          <p>Best regards,<br>UniNotes Team</p>
        </div>
      </body>
    </html>`;

    // Check for required environment variables
    const apiKey = process.env.EMAIL_API_KEY;
    const apiEndpoint = process.env.EMAIL_API_ENDPOINT || "https://api.brevo.com/v3/smtp/email";
    const emailSender = process.env.EMAIL_SENDER || "notesu362@gmail.com";

    if (!apiKey) {
      console.error("Missing EMAIL_API_KEY environment variable");
      return NextResponse.json(
        { error: "Email service configuration is incomplete" },
        { status: 500 }
      );
    }

    // Prepare promises for concurrent execution
    const dbPromise = prisma.verificationCode.upsert({
      where: { email: recipientEmail },
      update: { otp, expiresAt },
      create: { email: recipientEmail, otp, expiresAt },
    });

    const emailPromise = axios.post(
      apiEndpoint,
      {
        "sender": {"name": "UniNotes", "email": emailSender},
        "to": [{"email": recipientEmail, "name": recipientName || "User"}],
        "subject": "Verifying UniNotes Account",
        "htmlContent": htmlContent
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        },
        timeout: 10000
      }
    );

    // Execute both promises concurrently
    const [dbResult, emailApiResponse] = await Promise.all([dbPromise, emailPromise]);

    console.log("Email API response:", emailApiResponse.status, emailApiResponse.statusText);

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Email API error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    
    console.error("Error sending verification code:", error);
    return NextResponse.json(
      { 
        error: "Unable to send verification code now, please try again later",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}