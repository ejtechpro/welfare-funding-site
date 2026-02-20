/*
  Warnings:

  - The values [suspension] on the enum `staff_approvals_approvalType` will be removed. If these variants are still used in the database, this will fail.
  - The values [suspension] on the enum `staff_approvals_approvalType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `member_approvals` MODIFY `approvalType` ENUM('registration', 'payment', 'loan', 'withdrawal', 'benefit', 'penalty', 'profile_update', 'user_status', 'termination') NOT NULL;

-- AlterTable
ALTER TABLE `staff_approvals` MODIFY `approvalType` ENUM('registration', 'payment', 'loan', 'withdrawal', 'benefit', 'penalty', 'profile_update', 'user_status', 'termination') NOT NULL;
