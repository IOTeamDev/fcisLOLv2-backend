import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
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
      message: "Expired announcements deleted successfully",
      deletedCount: deletedAnnouncements.count,
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
