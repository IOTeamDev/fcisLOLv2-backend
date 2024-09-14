import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Semester } from "@prisma/client";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/verifyToken";

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

  if (!data.semester || !Object.values(Semester).includes(data.semester)) {
    return {
      valid: false,
      message:
        "Invalid or missing semester. Valid values: One | Two | Three | Four | Five | Six | Seven | Eight",
    };
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

      const { password, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    } else {
      const users = await prisma.user.findMany({
        include: {
          material: true,
        },
      });

      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      return NextResponse.json(usersWithoutPasswords);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (
    request.method !== "POST" ||
    !request.headers.get("Content-Type")?.includes("application/json")
  ) {
    return NextResponse.json({ error: "JSON body required" }, { status: 400 });
  }

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
        semester: data.semester,
        phone: data.phone || null,
        photo: data.photo || null,
        role: "STUDENT",
      },
    });

    await prisma.leaderboard.create({
      data: {
        name: newUser.name,
        points: 0,
        semester: newUser.semester,
      },
    });

    const { password, role, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (
    request.method !== "PUT" ||
    !request.headers.get("Content-Type")?.includes("application/json")
  ) {
    return NextResponse.json({ error: "JSON body required" }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const data = await request.json();

    const { valid, message } = validateUserData(data);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const userDataFromToken = await verifyToken(token, { id: true });

    if (
      userDataFromToken.role === "ADMIN" ||
      userDataFromToken.id === Number(id)
    ) {
      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          semester: data.semester,
          phone: data.phone || null,
          photo: data.photo || null,
        },
      });

      const { password, ...userWithoutPassword } = updatedUser;
      return NextResponse.json(userWithoutPassword);
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
