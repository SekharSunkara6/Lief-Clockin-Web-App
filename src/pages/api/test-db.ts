import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma'; // adjust path if your prisma.ts is located elsewhere

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userCount = await prisma.user.count();
    res.status(200).json({ userCount });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
