/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `role`,
    ADD COLUMN `userRole` ENUM('super_admin', 'admin', 'user', 'member', 'advisory_committee', 'general_coordinator', 'area_coordinator', 'secretary', 'customer_service_personnel', 'organizing_secretary', 'treasurer', 'auditor') NOT NULL DEFAULT 'user';
