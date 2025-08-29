/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "restaurants_name_key" ON "public"."restaurants"("name");
