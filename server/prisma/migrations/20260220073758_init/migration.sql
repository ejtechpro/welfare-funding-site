/*
  Warnings:

  - The values [active] on the enum `members_maturityStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `members` MODIFY `maturityStatus` ENUM('probation', 'matured') NULL;
