import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Subjects, MaterialType, Semester } from "@prisma/client";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

interface EditMaterialData {
  id: number;
  subject?: Subjects;
  link?: string;
  type?: MaterialType;
  semester?: Semester;
  title?: string;
  description?: string;
}

export async function PATCH(request: NextRequest) {
  // Check for Authorization header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    await verifyToken(token);
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
  }

  // Parse request body
  let data: EditMaterialData;
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
  const updatePayload: Partial<EditMaterialData> = {};
  if (data.subject !== undefined) updatePayload.subject = data.subject;
  if (data.link !== undefined) updatePayload.link = data.link;
  if (data.type !== undefined) updatePayload.type = data.type;
  if (data.semester !== undefined) updatePayload.semester = data.semester;
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;

  try {
    const updatedMaterial = await prisma.material.update({
      where: { id: Number(data.id) },
      data: updatePayload,
    });
    return NextResponse.json({ success: true, material: updatedMaterial });
  } catch (err) {
    return NextResponse.json({ error: "Update failed", details: err instanceof Error ? err.message : err }, { status: 500 });
  }
}