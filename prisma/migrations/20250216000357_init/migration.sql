/*
  Warnings:

  - You are about to drop the column `image` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "image",
DROP COLUMN "name",
ADD COLUMN     "eventImage" TEXT,
ADD COLUMN     "eventName" TEXT,
ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "Speaker" ADD COLUMN     "urlimage" TEXT;
