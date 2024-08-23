import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Subjects } from "@prisma/client";

const prisma = new PrismaClient();
interface Data {
  // *** this will change and will be fetched from a seperate arr of json file ***
  id?: number;
  subject: "CALC_1" | "CALC_2" | "PHYSICS_1" | "PHYSICS_2" | "INTRO_TO_CS";
  link: string;
  type: "YOUTUBE" | "DRIVE" | "TELEGRAM" | "OTHER";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
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
    } else if (req.method === "POST") {
      const { subject, link, type }: Data = req.body;

      const validSubjects = [
        // *** this will change and will be fetched from a seperate arr of json file ***
        "CALC_1",
        "CALC_2",
        "PHYSICS_1",
        "PHYSICS_2",
        "INTRO_TO_CS",
      ];
      // *** this will change and will be fetched from a seperate arr of json file ***
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
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
