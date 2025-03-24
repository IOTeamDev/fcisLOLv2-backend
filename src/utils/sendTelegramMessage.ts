"use server";

import axios from "axios";

export async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID; // Single chat ID

  if (!botToken || !chatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables.");
  }

  try {
    // Ensure chat_id is properly formatted (remove whitespace and convert to number)
    const formattedChatId = Number(chatId.trim());
    if (isNaN(formattedChatId)) {
      throw new Error(`Invalid chat ID format: ${chatId}`);
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: formattedChatId,
        text: message,
        parse_mode: "HTML",
      },
      { timeout: 10000 }
    );

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Telegram API error for chat ID ${chatId}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}