import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, AnnouncementType } from '@prisma/client';

const prisma = new PrismaClient();

// Utility function to validate request body data for announcement creation and update
function validateAnnouncementData(data: any) {
  if (!data.title || typeof data.title !== 'string') {
    return { valid: false, message: 'Invalid or missing title' };
  }

  if (!data.content || typeof data.content !== 'string') {
    return { valid: false, message: 'Invalid or missing content' };
  }

  if (data.thumbnail && typeof data.thumbnail !== 'string') {
    return { valid: false, message: 'Invalid thumbnail' };
  }

  if (!data.type || !Object.values(AnnouncementType).includes(data.type)) {
    return { valid: false, message: 'Invalid or missing type' };
  }

  return { valid: true, message: '' };
}

// Fetch all announcements or a specific announcement by ID
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (id) {
      // Fetch a specific announcement by ID
      const announcement = await prisma.announcement.findUnique({
        where: { id: Number(id) },
      });

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      return res.status(200).json(announcement);
    } else {
      // Fetch all announcements
      const announcements = await prisma.announcement.findMany();
      return res.status(200).json(announcements);
    }
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Create a new announcement
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;

    // Validate announcement data
    const { valid, message } = validateAnnouncementData(data);
    if (!valid) {
      return res.status(400).json({ error: message });
    }

    // Create a new announcement
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        thumbnail: data.thumbnail,
        type: data.type,
        level: data.level,
      },
    });

    return res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Update an existing announcement
export async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const data = req.body;

    // Validate announcement data
    const { valid, message } = validateAnnouncementData(data);
    if (!valid) {
      return res.status(400).json({ error: message });
    }

    // Update announcement data
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        content: data.content,
        thumbnail: data.thumbnail,
        type: data.type,
      },
    });

    return res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
