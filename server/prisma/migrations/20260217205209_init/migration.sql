/*
  Warnings:

  - You are about to drop the column `last_name` on the `staffs` table. All the data in the column will be lost.
  - Added the required column `lastName` to the `staffs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `staffs` DROP COLUMN `last_name`,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL;
