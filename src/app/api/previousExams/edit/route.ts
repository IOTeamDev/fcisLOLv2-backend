import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Subjects, PreviousExamsType, Semester } from "@prisma/client";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

interface EditExamData {
  id: number;
  subject?: Subjects;
  link?: string;
  type?: PreviousExamsType;
  semester?: Semester;
  title?: string; // Add title field
}

export async function PATCH(request: NextRequest) {
  // Check for Authorization header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing token" },
      { status: 401 }
    );
  }

  let userDataFromToken;
  const token = authHeader.split(" ")[1];
  try {
    userDataFromToken = await verifyToken(token, {
      role: true,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }

  if (userDataFromToken.role !== "ADMIN" && userDataFromToken.role !== "DEV") {
    return NextResponse.json(
      { error: "Unauthorized: Admin or Dev role required" },
      { status: 403 }
    );
  }

  // Parse request body
  let data: EditExamData;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Ensure the required id is provided
  if (!data.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Prepare update payload by filtering out undefined values
  const updatePayload: Partial<EditExamData> = {};
  if (data.subject !== undefined) updatePayload.subject = data.subject;
  if (data.link !== undefined) updatePayload.link = data.link;
  if (data.type !== undefined) updatePayload.type = data.type;
  if (data.semester !== undefined) updatePayload.semester = data.semester;
  if (data.title !== undefined) updatePayload.title = data.title;

  try {
    const updatedExam = await prisma.previousExams.update({
      where: { id: Number(data.id) },
      data: updatePayload,
    });
    return NextResponse.json({ success: true, exam: updatedExam });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Update failed",
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
