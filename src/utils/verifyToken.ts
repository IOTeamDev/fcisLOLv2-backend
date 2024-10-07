import { jwtVerify } from "jose";
import { PrismaClient, User } from "@prisma/client";
import { TextEncoder } from "util";

const prisma = new PrismaClient();

export async function verifyToken(
  token: any,
  select: Partial<Record<keyof User, boolean>>,
  withMaterial: boolean = false
) {
  try {
    // Decode and verify the JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Extract userId from the token's payload
    const userId = payload.userId as number;

    // Retrieve the user from the database using the userId and the select parameter
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...select,
        material: withMaterial,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error("Invalid or expired token");
  }
}
