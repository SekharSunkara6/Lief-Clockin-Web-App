// src/pages/api/staff.js
import prisma from '../../lib/prisma'; // adjust path based on location

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        shifts: {
          orderBy: { clockInTime: "desc" },
          take: 1
        }
      }
    });

    const staffStatus = users.map((u) => {
      const latestShift = u.shifts[0];
      return {
        id: u.id,
        name: u.name || u.email,
        email: u.email,
        lastClockIn: latestShift?.clockInTime || null,
        lastClockOut: latestShift?.clockOutTime || null,
        active: latestShift ? !latestShift.clockOutTime : false,
        clockInNote: latestShift?.clockInNote || "-",
        clockOutNote: latestShift?.clockOutNote || "-"
      };
    });

    res.status(200).json({ staff: staffStatus });

  } catch (err) {
    console.error("Staff API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
