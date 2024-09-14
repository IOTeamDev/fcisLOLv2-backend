import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Semester } from "@prisma/client";
import { verifyToken } from "@/utils/verifyToken";
import { SignJWT } from "jose";

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
  const haveMaterial = request.nextUrl.searchParams.get("haveMaterial");

  try {
    if (id) {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          material: haveMaterial === "true",
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const { password, ...filteredUser } = user;
      return NextResponse.json(filteredUser);
    } else {
      const users = await prisma.user.findMany({
        include: {
          material: haveMaterial === "true",
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
    console.log(data);

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
        score: 0,
      },
    });

    const { password, role, phone, photo, ...filteredUser } = newUser;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId: newUser.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + 12 * 30 * 24 * 60 * 60)
      .sign(secret);

    return NextResponse.json({
      message: "success",
      token: "Bearer " + token,
      user: filteredUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "user already exist with this Email" }, { status: 500 });
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

      const { password, ...filteredUser } = updatedUser;
      return NextResponse.json(filteredUser);
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
