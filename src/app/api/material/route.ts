import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Subjects, MaterialType } from "@prisma/client";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

interface Data {
  id?: number;
  subject: Subjects;
  link: string;
  type: MaterialType;
  authorId: number;
}

const validSubjects = Object.values(Subjects);
const validTypes = Object.values(MaterialType);

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

    const cookieStore = cookies()
    if (!cookieStore.has("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookieStore.get("token");
    const userDataFromToken = await verifyToken(token, { id: true });
    if (!authorId || authorId !== userDataFromToken.id) {
      return NextResponse.json({ error: "Unauthorized"}, { status: 400 });
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

export async function DELETE(request: NextRequest) {
  const body: Data = await request.json();
  const { id, authorId } = body;

  if (!id) {
    return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
  }

  try {
    const materialId = Number(id);

    const cookieStore = cookies()
    if (!cookieStore.has("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookieStore.get("token");
    const userDataFromToken = await verifyToken(token, { id: true });
    if (!userDataFromToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else if (userDataFromToken.id !== authorId) { // Check if the user is the author of the material
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.material.delete({
      where: { id: materialId },
    });

    return NextResponse.json({ message: "Material deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}