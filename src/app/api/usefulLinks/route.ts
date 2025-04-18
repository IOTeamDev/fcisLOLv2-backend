import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Subjects, Semester } from "@prisma/client";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

function validateUsefulLinkData(data: any) {
  if (!data.link || typeof data.link !== "string") {
    return { valid: false, message: "Invalid or missing link" };
  }

  if (!data.subject || !Object.values(Subjects).includes(data.subject)) {
    return {
      valid: false,
      message: `Invalid or missing subject. Must be one of the valid subjects.`,
    };
  }

  if (!data.semester || !Object.values(Semester).includes(data.semester)) {
    return {
      valid: false,
      message: `Invalid or missing semester. Must be one of: ${Object.values(
        Semester
      ).join(", ")}`,
    };
  }

  if (data.isGeneral !== undefined && typeof data.isGeneral !== "boolean") {
    return { valid: false, message: "isGeneral must be a boolean value" };
  }

  return { valid: true, message: "" };
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const semester = request.nextUrl.searchParams.get("semester");
  const subject = request.nextUrl.searchParams.get("subject");
  const isGeneral = request.nextUrl.searchParams.get("isGeneral");

  try {
    if (id) {
      const usefulLink = await prisma.usefulLink.findUnique({
        where: { id: Number(id) },
      });

      if (!usefulLink) {
        return NextResponse.json(
          { error: "Useful link not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(usefulLink);
    } else {
      let whereClause: any = {};
      
      if (semester) {
        whereClause.semester = semester as Semester;
      }
      
      if (subject) {
        whereClause.subject = subject as Subjects;
      }
      
      if (isGeneral !== null) {
        whereClause.isGeneral = isGeneral === "true";
      }

      const usefulLinks = await prisma.usefulLink.findMany({
        where: whereClause,
      });
      
      return NextResponse.json(usefulLinks);
    }
  } catch (error) {
    console.error("Error fetching useful links:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { valid, message } = validateUsefulLinkData(data);
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

    if (userDataFromToken.role !== "DEV") {
      return NextResponse.json(
        { error: "Unauthorized: Only DEV users can create useful links" },
        { status: 403 }
      );
    }

    const newUsefulLink = await prisma.usefulLink.create({
      data: {
        link: data.link,
        subject: data.subject,
        semester: data.semester,
        isGeneral: data.isGeneral || false,
      },
    });

    return NextResponse.json(newUsefulLink, { status: 201 });
  } catch (error) {
    console.error("Error creating useful link:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is missing" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { valid, message } = validateUsefulLinkData(data);
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

    if (userDataFromToken.role !== "DEV") {
      return NextResponse.json(
        { error: "Unauthorized: Only DEV users can update useful links" },
        { status: 403 }
      );
    }

    const updatedUsefulLink = await prisma.usefulLink.update({
      where: { id: Number(id) },
      data: {
        link: data.link,
        subject: data.subject,
        semester: data.semester,
        isGeneral: data.isGeneral !== undefined ? data.isGeneral : undefined,
      },
    });

    return NextResponse.json(updatedUsefulLink);
  } catch (error) {
    console.error("Error updating useful link:", error);
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

    if (userDataFromToken.role !== "DEV") {
      return NextResponse.json(
        { error: "Unauthorized: Only DEV users can delete useful links" },
        { status: 403 }
      );
    }

    const deletedUsefulLink = await prisma.usefulLink.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedUsefulLink);
  } catch (error) {
    console.error("Error deleting useful link:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
} 