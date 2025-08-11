import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId, lat, lng, note } = req.body;
    if (!userId || lat == null || lng == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Ensure the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ error: "Invalid userId - no such user in database" });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    const geofence = await prisma.geofence.findFirst();
    if (!geofence) {
      return res.status(500).json({ error: "Geofence not configured" });
    }

    const distance = haversineDistance(
      latNum, lngNum,
      parseFloat(geofence.centerLat),
      parseFloat(geofence.centerLng)
    );

    if (distance > parseFloat(geofence.radiusKm)) {
      return res.status(403).json({
        error: "You are outside the allowed clock-out perimeter",
        distance,
        geofence,
        userLocation: { lat: latNum, lng: lngNum }
      });
    }

    const activeShift = await prisma.shift.findFirst({
      where: { userId, clockOutTime: null },
    });
    if (!activeShift) {
      return res.status(400).json({ error: "No active shift found" });
    }

    const updatedShift = await prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        clockOutTime: new Date(),
        clockOutLat: latNum,
        clockOutLng: lngNum,
        clockOutNote: note || null,
      },
    });

    return res.status(200).json({
      message: "Clock-out successful",
      distance,
      userLocation: { lat: latNum, lng: lngNum },
      shift: updatedShift
    });
  } catch (err) {
    console.error("Clock-out error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
