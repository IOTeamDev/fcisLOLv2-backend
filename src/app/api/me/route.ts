import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";

export async function GET(request: NextRequest) {
  // Extract the Authorization header
  const authHeader = request.headers.get("Authorization");

  // Check if the Authorization header is present and correctly formatted
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token and extract user data
    const userDataFromToken = await verifyToken(token, {
      id: true,
      email: true,
      name: true,
      semester: true,
      role: true,
      phone: true,
      photo: true,
      material: true
    });

    // Return the user data
    return NextResponse.json(userDataFromToken);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
