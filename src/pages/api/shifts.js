import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { clockInTime: "desc" },
      include: {
        user: { select: { email: true, name: true } } // get both email & name
      }
    });

    // ✅ Return user as object so frontend can access name/email
    const formattedShifts = shifts.map(s => ({
      id: s.id,
      user: s.user || null,
      clockInTime: s.clockInTime,
      clockOutTime: s.clockOutTime,
      hoursWorked: s.clockOutTime
        ? (
            (new Date(s.clockOutTime) - new Date(s.clockInTime)) /
            (1000 * 60 * 60)
          ).toFixed(2)
        : null,
      clockInNote: s.clockInNote ?? "-",
      clockOutNote: s.clockOutNote ?? "-"
    }));

    const totalShifts = formattedShifts.length;
    const totalHours = formattedShifts.reduce(
      (sum, s) => sum + (parseFloat(s.hoursWorked) || 0),
      0
    );
    const avgHours = totalShifts > 0 ? (totalHours / totalShifts).toFixed(2) : "0";

    return res.status(200).json({
      shifts: formattedShifts,
      stats: {
        totalShifts,
        totalHours: totalHours.toFixed(2),
        avgHours
      }
    });

  } catch (err) {
    console.error("Shift API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
