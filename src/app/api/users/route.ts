import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Level } from '@prisma/client';

const prisma = new PrismaClient();

// Utility function to validate request body data for user creation and update
function validateUserData(data: any) {
  if (!data.name || typeof data.name !== 'string') {
    return { valid: false, message: 'Invalid or missing name' };
  }

  if (!data.email || typeof data.email !== 'string') {
    return { valid: false, message: 'Invalid or missing email' };
  }

  if (!data.password || typeof data.password !== 'string') {
    return { valid: false, message: 'Invalid or missing password' };
  }

  if (!data.level || !Object.values(Level).includes(data.level)) {
    return { valid: false, message: 'Invalid or missing level' };
  }

  return { valid: true, message: '' };
}

// Fetch all users or a specific user by ID
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (id) {
      // Fetch a specific user by ID
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          material: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } else {
      // Fetch all users
      const users = await prisma.user.findMany({
        include: {
          material: true,
        },
      });

      return res.status(200).json(users);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Create a new user
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;

    // Validate user data
    const { valid, message } = validateUserData(data);
    if (!valid) {
      return res.status(400).json({ error: message });
    }

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,  // Make sure to hash this in a real application!
        level: data.level,
      },
    });

    // Add the new user to the leaderboard with 0 points
    await prisma.leaderboard.create({
      data: {
        name: newUser.name,
        points: 0,
      },
    })

    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Update an existing user
export async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const data = req.body;

    // Validate user data
    const { valid, message } = validateUserData(data);
    if (!valid) {
      return res.status(400).json({ error: message });
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        email: data.email,
        password: data.password,  // Make sure to hash this in a real application!
        level: data.level,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Delete a user
// export async function DELETE(req: NextApiRequest, res: NextApiResponse) {
//   const { id } = req.query;

//   try {
//     await prisma.user.delete({
//       where: { id: Number(id) },
//     });

//     return res.status(200).json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// }
