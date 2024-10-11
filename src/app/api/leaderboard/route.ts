import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Semester } from "@prisma/client"; // Import the Semester enum from Prisma

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const semester = searchParams.get("semester") as Semester; // Cast the string to Semester enum

  const validSemesters = [
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
  ];

  if (!semester || !validSemesters.includes(semester)) {
    return NextResponse.json(
      {
        error: "semester is required",
        valid: validSemesters,
      },
      { status: 400 }
    );
  }

  try {
    const leaderboardUsers = await prisma.user.findMany({
      orderBy: {
        score: "asc",
      },
      where: {
        semester: semester,
      },
    });

    const leaderboard = leaderboardUsers.map((user) => ({
      id: user.id,
      name: user.name,
      score: user.score,
      role: user.role,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
