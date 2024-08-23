import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Subjects } from "@prisma/client";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const prisma = new PrismaClient();

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "10s"),
});

export const config = {
  runtime: "edge",
};

// *** this will change and will be fetched from a separate arr of json file ***
interface Data {
  id?: number;
  subject: "CALC_1" | "CALC_2" | "PHYSICS_1" | "PHYSICS_2" | "INTRO_TO_CS";
  link: string;
  type: "YOUTUBE" | "DRIVE" | "TELEGRAM" | "OTHER";
}

// *** this will change and will be fetched from a separate arr of json file ***
const validSubjects = [
  "CALC_1",
  "CALC_2",
  "PHYSICS_1",
  "PHYSICS_2",
  "INTRO_TO_CS",
];
// *** this will change and will be fetched from a separate arr of json file ***
const validTypes = ["YOUTUBE", "DRIVE", "TELEGRAM", "OTHER"];

const limitFunc = async (ip: string) => {
  const { limit, reset, remaining } = await ratelimit.limit(ip);
  if (remaining === 0) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
};

export async function GET(request: NextRequest) {
  const ip = request.ip || "127.0.0.1";
  await limitFunc(ip);

  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get("subject");

  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  if (!validSubjects.includes(subject as Subjects)) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }

  try {
    const data = await prisma.data.findMany({
      where: {
        subject: subject as Subjects,
      },
      select: {
        link: true,
        type: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = request.ip || "127.0.0.1";
  await limitFunc(ip);

  try {
    const body: Data = await request.json();
    const { subject, link, type } = body;

    if (!validSubjects.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!link) {
      return NextResponse.json({ error: "Link is required" }, { status: 400 });
    }

    const newData = await prisma.data.create({
      data: {
        subject,
        link,
        type,
      },
    });

    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
