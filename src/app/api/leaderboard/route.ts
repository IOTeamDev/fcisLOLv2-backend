import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET request to fetch leaderboard in ascending order of points
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: {
        points: 'asc',
      },
    });
    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
 