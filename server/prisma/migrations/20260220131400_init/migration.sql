/*
  Warnings:

  - The values [success] on the enum `mpesa_payments_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `mpesa_payments` MODIFY `status` ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending';
