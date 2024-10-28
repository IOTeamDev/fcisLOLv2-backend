import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    const deletedAnnouncements = await prisma.announcement.deleteMany({
      where: {
        due_date: {
          lt: now,
        },
      },
    });

    return NextResponse.json({
      now: now,
      message: "Expired announcements deleted successfully",
      deletedCount: deletedAnnouncements,
    });
  } catch (error) {
    console.error("Error deleting announcements:", error);
    return NextResponse.json(
      { message: "Error deleting announcements", error: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
