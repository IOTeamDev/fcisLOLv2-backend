import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Subjects } from "@prisma/client";

const prisma = new PrismaClient();

// removed rate limit

// *** this will change and will be fetched from a separate arr of json file ***
interface Data {
  id?: number;
  subject: "CALC_1" | "CALC_2" | "PHYSICS_1" | "PHYSICS_2" | "INTRO_TO_CS";
  link: string;
  type: "YOUTUBE" | "DRIVE" | "TELEGRAM" | "OTHER";
  authorId: number;
}

// *** this will change and will be fetched from a separate arr of json file ***
const validSubjects = [
  "CALC_1",
  "CALC_2",
  "PHYSICS_1",
  "PHYSICS_2",
  "INTRO_TO_CS",
];
// *** this will change and will be fetched from a separate arr of json file ***
const validTypes = ["YOUTUBE", "DRIVE", "TELEGRAM", "OTHER"];


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get("subject");

  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  if (!validSubjects.includes(subject as Subjects)) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }

  try {
    const data = await prisma.material.findMany({
      where: {
        subject: subject as Subjects,
      },
      select: {
        link: true,
        type: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body: Data = await request.json();
    const { subject, link, type, authorId } = body;

    if (!validSubjects.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!link) {
      return NextResponse.json({ error: "Link is required" }, { status: 400 });
    }

    if (!authorId) {
      return NextResponse.json({ error: "Author is required" }, { status: 400 });
    }

    const newData = await prisma.material.create({
      data: {
        subject,
        link,
        type,
        author: {
          connect: {
            id: authorId,
          },
        },
      },
    });

    await prisma.leaderboard.update({
      where: { id: authorId },
      data: {
        points: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
