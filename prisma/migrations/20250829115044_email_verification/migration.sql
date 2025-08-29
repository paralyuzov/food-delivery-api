/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationTokenExpiry` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `restaurants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."restaurants" DROP COLUMN "emailVerificationToken",
DROP COLUMN "emailVerificationTokenExpiry",
DROP COLUMN "isEmailVerified";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
