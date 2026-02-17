/*
  Warnings:

  - The values [coordinator] on the enum `staffs_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `staffs` MODIFY `role` ENUM('admin', 'advisory_committee', 'general_coordinator', 'area_coordinator', 'secretary', 'customer_serviceice', 'organizing_secretary', 'treasurer', 'auditor', 'staff') NOT NULL DEFAULT 'staff';
