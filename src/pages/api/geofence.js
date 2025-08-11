import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { centerLat, centerLng, radiusKm } = req.body;
      if (!centerLat || !centerLng || !radiusKm) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Clear old geofence & create new one (only one active)
      await prisma.geofence.deleteMany({});
      const geofence = await prisma.geofence.create({
        data: { centerLat, centerLng, radiusKm },
      });

      return res.status(200).json({ message: "Geofence updated", geofence });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "GET") {
    try {
      const geofence = await prisma.geofence.findFirst();
      return res.status(200).json({ geofence });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
