import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/utils/sendTelegramMessage"; // Import the utility function

interface ReportData {
  name: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ReportData = await request.json();
    const { name, message } = body;

    // Validate required fields
    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      );
    }

    // Format message for Telegram
    const formattedMessage = `📢 New Report\n\nFrom: ${name}\n\nMessage: ${message}`;

    // Send message to Telegram using the utility function
    try {
      await sendTelegramMessage(formattedMessage);
    } catch (error) {
      console.error("Failed to send message via Telegram:", error);
      return NextResponse.json(
        { error: "Failed to send report to admin" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Report sent successfully" });
  } catch (error) {
    console.error("Error processing report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}