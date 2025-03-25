import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Subjects, PreviousExamsType, Semester } from "@prisma/client";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

interface Data {
  id?: number;
  Subject: Subjects;
  link: string;
  Type: PreviousExamsType;
  Semester?: Semester;
}

const validSubjects = Object.values(Subjects);
const validTypes = Object.values(PreviousExamsType);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get("subject");
  const semester = searchParams.get("semester");
  const accepted = searchParams.get("accepted");

  if (!accepted) {
    return NextResponse.json(
      { error: "accepted is required" },
      { status: 400 }
    );
  }

  if (!subject && !semester) {
    return NextResponse.json(
      { error: "(subject) OR (semester) is required" },
      { status: 400 }
    );
  }

  if (accepted !== "true" && accepted !== "false") {
    return NextResponse.json(
      { error: "accepted must be either true or false" },
      { status: 400 }
    );
  }

  if (subject) {
    if (!validSubjects.includes(subject as Subjects)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    try {
      const data = await prisma.previousExams.findMany({
        where: {
          Subject: subject as Subjects,
          accepted: accepted === "true",
        },
        select: {
          id: true,
          link: true,
          Type: true,
          Subject: true,
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
      const data = await prisma.previousExams.findMany({
        where: {
          Semester: semester as Semester,
          accepted: accepted === "true",
        },
        select: {
          id: true,
          link: true,
          Type: true,
          Subject: true,
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

export async function POST(request: NextRequest) {
  try {
    const body: Data = await request.json();
    const { Subject, link, Type, Semester } = body;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const userDataFromToken = await verifyToken(token, {
      id: true,
      role: true,
    });

    if (!userDataFromToken.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }

    if (!validSubjects.includes(Subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    if (!validTypes.includes(Type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!link) {
      return NextResponse.json({ error: "Link is required" }, { status: 400 });
    }

    if (
      (Semester && !Object.values(Semester).includes(Semester)) ||
      !Semester
    ) {
      return NextResponse.json({ error: "Invalid semester" }, { status: 400 });
    }

    const newData = await prisma.previousExams.create({
      data: {
        Subject,
        link,
        Type,
        Semester,
        accepted: userDataFromToken.role === "ADMIN",
      },
    });

    if (userDataFromToken.role === "ADMIN") {
      await prisma.user.update({
        where: {
          id: userDataFromToken.id,
        },
        data: {
          score: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const body: Data = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Exam ID is required" },
      { status: 400 }
    );
  }

  try {
    const examId = Number(id);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const userDataFromToken = await verifyToken(token, {
      id: true,
      role: true,
    });

    if (!userDataFromToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (userDataFromToken.role === "ADMIN" || userDataFromToken.role === "DEV") {
      await prisma.previousExams.delete({
        where: { id: examId },
      });
      
      return NextResponse.json({ message: "Exam deleted" });
    } else {
      return NextResponse.json({ error: "Unauthorized: Admin role required" }, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
