import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    // get all users and their latest shift
    const users = await prisma.user.findMany({
      include: {
        shifts: {
          orderBy: { clockInTime: "desc" },
          take: 1,
        },
      },
    });

    const staffStatus = users.map((u) => {
      const latestShift = u.shifts[0];
      const active = latestShift && !latestShift.clockOutTime;
      return {
        id: u.id,
        name: u.name || u.email,
        email: u.email,
        lastClockIn: latestShift?.clockInTime || null,
        lastClockOut: latestShift?.clockOutTime || null,
        active,
      };
    });

    res.status(200).json({ staff: staffStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
