-- AlterTable
ALTER TABLE `staffs` MODIFY `role` ENUM('admin', 'secretary', 'coordinator', 'auditor', 'treasurer', 'staff') NOT NULL DEFAULT 'staff';
