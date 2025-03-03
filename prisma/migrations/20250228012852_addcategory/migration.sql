-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "Speaker" ADD COLUMN     "status" VARCHAR;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "first_name" VARCHAR,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
