import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const now = new Date();
  const deletedAnnouncements = await prisma.announcement.deleteMany({
    where: {
      due_date: { lte: now },
    },
  });

  return NextResponse.json({
    message: "Expired announcements deleted successfully",
    deletedCount: deletedAnnouncements.count,
  });
}