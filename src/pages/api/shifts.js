import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch all shifts with related user data
    const shifts = await prisma.shift.findMany({
      orderBy: { clockInTime: "desc" },
      include: { user: true },
    });

    // Calculate basic analytics
    const totalShifts = shifts.length;
    let totalHours = 0;

    shifts.forEach((shift) => {
      if (shift.clockOutTime) {
        const hours =
          (new Date(shift.clockOutTime) - new Date(shift.clockInTime)) /
          (1000 * 60 * 60);
        totalHours += hours;
      }
    });

    const avgHours = totalShifts > 0 ? (totalHours / totalShifts).toFixed(2) : 0;

    res.status(200).json({
      shifts,
      stats: {
        totalShifts,
        totalHours: totalHours.toFixed(2),
        avgHours,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
