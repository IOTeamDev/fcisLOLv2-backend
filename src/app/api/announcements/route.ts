import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AnnouncementType, Semester } from "@prisma/client";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

function validateAnnouncementData(data: any) {
  if (!data.title || typeof data.title !== "string") {
    return { valid: false, message: "Invalid or missing title" };
  }

  if (!data.content || typeof data.content !== "string") {
    return { valid: false, message: "Invalid or missing content" };
  }

  if (data.due_date && typeof data.due_date !== "string") {
    return { valid: false, message: "due date should be a string" };
  }

  if (!data.type || !Object.values(AnnouncementType).includes(data.type)) {
    return { valid: false, message: "Invalid or missing type" };
  }

  if (!data.semester || !Object.values(Semester).includes(data.semester)) {
    return {
      valid: false,
      message: `Invalid or missing semester. Must be one of: ${Object.values(
        Semester
      ).join(", ")}`,
    };
  }

  return { valid: true, message: "" };
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const semester = request.nextUrl.searchParams.get("semester");
  try {
    if (id) {
      const announcement = await prisma.announcement.findUnique({
        where: { id: Number(id) },
      });

      if (!announcement) {
        return NextResponse.json(
          { error: "Announcement not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(announcement);
    } else if (semester) {
      const announcements = await prisma.announcement.findMany({
        where: { semester: semester as Semester },
      });
      return NextResponse.json(announcements);
    } else {
      const announcements = await prisma.announcement.findMany();
      return NextResponse.json(announcements);
    }
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { valid, message } = validateAnnouncementData(data);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const userDataFromToken = await verifyToken(token, { role: true });

    if (userDataFromToken.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: User does not have the required permissions" },
        { status: 403 }
      );
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        due_date: data.due_date,
        type: data.type,
        semester: data.semester,
        image: data.image || null,
      },
    });

    // check for other annuncements' due dates and delete them if they are past
    const now = new Date();
    await prisma.announcement.deleteMany({
      where: {
        due_date: { lte: now },
      },
    });
    // due_dateexample: 2021-09-30T00:00:00.000Z
    // this type is called ISO 8601

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    const data = await request.json();

    const { valid, message } = validateAnnouncementData(data);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const userDataFromToken = await verifyToken(token, { role: true });

    if (userDataFromToken.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: User does not have the required permissions" },
        { status: 403 }
      );
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        content: data.content,
        due_date: data.due_date,
        type: data.type,
      },
    });

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is missing" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const userDataFromToken = await verifyToken(token, { role: true });

    if (userDataFromToken.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: User does not have the required permissions" },
        { status: 403 }
      );
    }

    const deletedAnnouncement = await prisma.announcement.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedAnnouncement);
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
