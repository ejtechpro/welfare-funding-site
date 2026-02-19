/*
  Warnings:

  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `address`,
    DROP COLUMN `supervisorId`,
    MODIFY `employmentDate` DATETIME(3) NULL;
