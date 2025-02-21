import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/verifyToken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const accepted = searchParams.get("accepted");

  if (!id || !accepted) {
    return NextResponse.json(
      { error: "ID and accepted status are required" },
      { status: 400 }
    );
  }

  if (!["true", "false"].includes(accepted)) {
    return NextResponse.json(
      { error: "Invalid accepted status" },
      { status: 400 }
    );
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const userDataFromToken = await verifyToken(token, { role: true });

    if (["ADMIN", "DEV"].includes(userDataFromToken.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin or Dev role required" },
        { status: 403 }
      );
    }

    const updatedMaterial = await prisma.material.update({
      where: { id: Number(id) },
      data: { accepted: accepted === "true" },
    });

    if (accepted === "true") {
      await prisma.user.update({
        where: {
          id: updatedMaterial.authorId,
        },
        data: {
          score: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json(updatedMaterial);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
