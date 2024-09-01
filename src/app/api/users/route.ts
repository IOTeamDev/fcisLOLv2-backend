import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Level } from "@prisma/client";

const prisma = new PrismaClient();

function validateUserData(data: any) {
  if (!data.name || typeof data.name !== "string") {
    return { valid: false, message: "Invalid or missing name" };
  }

  if (!data.email || typeof data.email !== "string") {
    return { valid: false, message: "Invalid or missing email" };
  }

  if (!data.password || typeof data.password !== "string") {
    return { valid: false, message: "Invalid or missing password" };
  }

  if (!data.level || !Object.values(Level).includes(data.level)) {
    return { valid: false, message: "Invalid or missing level" };
  }

  return { valid: true, message: "" };
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          material: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    } else {
      const users = await prisma.user.findMany({
        include: {
          material: true,
        },
      });

      return NextResponse.json(users);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { valid, message } = validateUserData(data);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        level: data.level,
        role: "STUDENT",
      },
    });

    await prisma.leaderboard.create({
      data: {
        name: newUser.name,
        points: 0,
        level: newUser.level,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    const data = await request.json();

    const { valid, message } = validateUserData(data);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        level: data.level,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
