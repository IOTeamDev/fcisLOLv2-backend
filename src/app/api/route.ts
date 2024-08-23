import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Subjects } from "@prisma/client";

const prisma = new PrismaClient();

// *** this will change and will be fetched from a separate arr of json file ***
interface Data {
  id?: number;
  subject: "CALC_1" | "CALC_2" | "PHYSICS_1" | "PHYSICS_2" | "INTRO_TO_CS";
  link: string;
  type: "YOUTUBE" | "DRIVE" | "TELEGRAM" | "OTHER";
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }

    const data = await prisma.data.findMany({
      where: {
        subject: subject as Subjects,
      },
      select: {
        link: true,
        type: true,
      },
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { subject, link, type }: Data = req.body;

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

    if (!validSubjects.includes(subject)) {
      return res.status(400).json({ error: "Invalid subject" });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    if (!link) {
      return res.status(400).json({ error: "Link is required" });
    }

    const newData = await prisma.data.create({
      data: {
        subject,
        link,
        type,
      },
    });

    return res.status(201).json(newData);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
