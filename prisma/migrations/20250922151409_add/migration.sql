/*
  Warnings:

  - You are about to drop the column `category` on the `restaurants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."dishes" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "public"."restaurants" DROP COLUMN "category";
