import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const geofence = await prisma.geofence.findFirst();
      res.status(200).json({ geofence });
    } catch { // changed from (error) to (_) to silence the warning
      res.status(500).json({ error: "Failed to fetch geofence" });
    }
  }

  if (req.method === "POST") {
    try {
      const { centerLat, centerLng, radiusKm } = req.body;

      if (
        typeof centerLat !== "number" ||
        typeof centerLng !== "number" ||
        typeof radiusKm !== "number"
      ) {
        return res.status(400).json({ error: "Invalid geofence data" });
      }

      // Replace any existing geofence
      await prisma.geofence.deleteMany({});
      const newGeofence = await prisma.geofence.create({
        data: { centerLat, centerLng, radiusKm },
      });

      res.status(200).json({ geofence: newGeofence });
    } catch { // changed here too
      res.status(500).json({ error: "Failed to save geofence" });
    }
  }
}
