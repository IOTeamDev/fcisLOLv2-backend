import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Subjects, MaterialType, Semester } from "@prisma/client";

const prisma = new PrismaClient();

const validSubjects = Object.values(Subjects);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get("subject");
  const semester = searchParams.get("semester");

  if (!subject || !semester) {
    return NextResponse.json(
      { error: "Subject or semester is required" },
      { status: 400 }
    );
  }

  if (subject) {
    if (!validSubjects.includes(subject as Subjects)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    try {
      const data = await prisma.material.findMany({
        where: {
          subject: subject as Subjects,
          accepted: true,
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

  if (semester) {
    if (!Object.values(Semester).includes(semester as Semester)) {
      return NextResponse.json({ error: "Invalid semester" }, { status: 400 });
    }

    try {
      const data = await prisma.material.findMany({
        where: {
          semester: semester as Semester,
          accepted: true,
        },
        select: {
          link: true,
          type: true,
          subject: true,
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
}
