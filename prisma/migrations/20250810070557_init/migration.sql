/*
  Warnings:

  - You are about to drop the `LocationSetting` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `clockInLat` on table `Shift` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clockInLng` on table `Shift` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MANAGER', 'CAREWORKER');

-- AlterTable
ALTER TABLE "public"."Shift" ALTER COLUMN "clockInLat" SET NOT NULL,
ALTER COLUMN "clockInLng" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'CAREWORKER';

-- DropTable
DROP TABLE "public"."LocationSetting";

-- CreateTable
CREATE TABLE "public"."Geofence" (
    "id" TEXT NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Geofence_pkey" PRIMARY KEY ("id")
);
