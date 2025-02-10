import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Semester } from "@prisma/client";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

interface EditUserData {
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  semester?: string;
}

export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing token" },
      { status: 401 }
    );
  }

  // Get user data from token
  const token = authHeader.split(" ")[1];
  let userDataFromToken;
  try {
    userDataFromToken = await verifyToken(token, {
      id: true,
      email: true,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }

  // Parse request body
  let data: EditUserData;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Prepare update payload
  const updatePayload: EditUserData = {};

  if (data.name) updatePayload.name = data.name;
  if (data.phone) updatePayload.phone = data.phone;
  if (data.photo) updatePayload.photo = data.photo;

  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
        NOT: { id: userDataFromToken.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    updatePayload.email = data.email;
  }

  if (data.semester) {
    if (!Object.values(Semester).includes(data.semester as Semester)) {
      return NextResponse.json({ error: "Invalid semester" }, { status: 400 });
    } else {
      updatePayload.semester = data.semester;
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userDataFromToken.id },
      data: { ...updatePayload, semester: data.semester as Semester },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
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
