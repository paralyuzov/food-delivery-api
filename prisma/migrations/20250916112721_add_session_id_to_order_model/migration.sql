/*
  Warnings:

  - A unique constraint covering the columns `[session_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `session_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "session_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_session_id_key" ON "public"."orders"("session_id");
