-- AlterTable
ALTER TABLE `users` ADD COLUMN `requestedRole` ENUM('admin', 'advisory_committee', 'general_coordinator', 'area_coordinator', 'secretary', 'customer_service_personnel', 'organizing_secretary', 'treasurer', 'auditor', 'staff', 'member') NULL;
