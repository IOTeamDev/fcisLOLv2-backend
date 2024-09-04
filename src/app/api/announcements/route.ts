import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AnnouncementType } from "@prisma/client";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

function validateAnnouncementData(data: any) {
  if (!data.title || typeof data.title !== "string") {
    return { valid: false, message: "Invalid or missing title" };
  }

  if (!data.content || typeof data.content !== "string") {
    return { valid: false, message: "Invalid or missing content" };
  }

  if (data.thumbnail && typeof data.thumbnail !== "string") {
    return { valid: false, message: "Invalid thumbnail" };
  }

  if (!data.type || !Object.values(AnnouncementType).includes(data.type)) {
    return { valid: false, message: "Invalid or missing type" };
  }

  return { valid: true, message: "" };
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const announcement = await prisma.announcement.findUnique({
        where: { id: Number(id) },
      });

      if (!announcement) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
      }

      return NextResponse.json(announcement);
    } else {
      const announcements = await prisma.announcement.findMany();
      return NextResponse.json(announcements);
    }
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { valid, message } = validateAnnouncementData(data);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        thumbnail: data.thumbnail,
        type: data.type,
        semester: data.semester,
      },
    });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

    const cookieStore = cookies();
    if (!cookieStore.has("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookieStore.get("token");
    const userDataFromToken = await verifyToken(token, { role: true });

    if (userDataFromToken.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        content: data.content,
        thumbnail: data.thumbnail,
        type: data.type,
      },
    });

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
