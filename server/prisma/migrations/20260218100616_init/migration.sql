/*
  Warnings:

  - You are about to drop the column `department` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `employmentDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `qualifications` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `department`,
    DROP COLUMN `employmentDate`,
    DROP COLUMN `qualifications`;
