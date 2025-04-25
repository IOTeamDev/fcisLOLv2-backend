import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Generate random 6-digit code
function generateOTP(): number {
  return 100000 + Math.floor(Math.random() * 900000);
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

    // Prepare payload for the email API
    const emailPayload = {
      "sender": {"name": "UniNotes", "email": process.env.EMAIL_SENDER || "notesu362@9091167.brevosend.com"},
      "to": [
        {"email": recipientEmail, "name": recipientName || "User"}
      ],
      "subject": "Verifying UniNotes Account",
      "htmlContent": htmlContent
    };

    // Send email using the API (e.g., Brevo, SendGrid, etc.)
    const response = await axios.post(
      process.env.EMAIL_API_ENDPOINT || "https://api.brevo.com/v3/smtp/email",
      emailPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.EMAIL_API_KEY || ""
        }
      }
    );

    // Store OTP in a secure way (session, database, etc.)
    // For now, just return it (in production, this should be handled more securely)
    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
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