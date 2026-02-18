/*
  Warnings:

  - You are about to drop the `staff_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staffs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `member_approvals` DROP FOREIGN KEY `member_approvals_approver_id_fkey`;

-- DropForeignKey
ALTER TABLE `member_notes` DROP FOREIGN KEY `member_notes_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `member_status_history` DROP FOREIGN KEY `member_status_history_changed_by_fkey`;

-- DropForeignKey
ALTER TABLE `registration_audit_log` DROP FOREIGN KEY `registration_audit_log_performed_by_fkey`;

-- DropForeignKey
ALTER TABLE `registration_documents` DROP FOREIGN KEY `registration_documents_verified_by_fkey`;

-- DropForeignKey
ALTER TABLE `staff_session` DROP FOREIGN KEY `staff_session_staffId_fkey`;

-- DropIndex
DROP INDEX `member_approvals_approver_id_fkey` ON `member_approvals`;

-- DropTable
DROP TABLE `staff_session`;

-- DropTable
DROP TABLE `staffs`;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `surname` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `otherNames` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `address` JSON NULL,
    `employmentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `department` VARCHAR(191) NULL,
    `supervisorId` VARCHAR(191) NULL,
    `role` ENUM('admin', 'advisory_committee', 'general_coordinator', 'area_coordinator', 'secretary', 'customer_service_personnel', 'organizing_secretary', 'treasurer', 'auditor', 'staff', 'member') NOT NULL DEFAULT 'member',
    `assignedArea` VARCHAR(191) NULL,
    `approval` ENUM('pending', 'rejected', 'approved') NOT NULL DEFAULT 'pending',
    `qualifications` JSON NULL,
    `status` ENUM('active', 'inactive', 'suspended', 'banned') NOT NULL DEFAULT 'active',
    `verificationCode` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phoneNumber_key`(`phoneNumber`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `UserId` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NULL,
    `deviceInfo` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `compositeKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_session_sessionId_key`(`sessionId`),
    UNIQUE INDEX `user_session_compositeKey_key`(`compositeKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_session` ADD CONSTRAINT `user_session_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_documents` ADD CONSTRAINT `registration_documents_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_notes` ADD CONSTRAINT `member_notes_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_status_history` ADD CONSTRAINT `member_status_history_changed_by_fkey` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_audit_log` ADD CONSTRAINT `registration_audit_log_performed_by_fkey` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
