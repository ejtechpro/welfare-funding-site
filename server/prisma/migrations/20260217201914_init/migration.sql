/*
  Warnings:

  - You are about to drop the `membership_registrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff_registrations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `member_approvals` DROP FOREIGN KEY `member_approvals_approver_id_fkey`;

-- DropForeignKey
ALTER TABLE `member_approvals` DROP FOREIGN KEY `member_approvals_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `member_notes` DROP FOREIGN KEY `member_notes_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `member_notes` DROP FOREIGN KEY `member_notes_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `member_status_history` DROP FOREIGN KEY `member_status_history_changed_by_fkey`;

-- DropForeignKey
ALTER TABLE `member_status_history` DROP FOREIGN KEY `member_status_history_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `registration_audit_log` DROP FOREIGN KEY `registration_audit_log_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `registration_audit_log` DROP FOREIGN KEY `registration_audit_log_performed_by_fkey`;

-- DropForeignKey
ALTER TABLE `registration_documents` DROP FOREIGN KEY `registration_documents_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `registration_documents` DROP FOREIGN KEY `registration_documents_verified_by_fkey`;

-- DropForeignKey
ALTER TABLE `staff_registrations` DROP FOREIGN KEY `staff_registrations_supervisor_id_fkey`;

-- DropTable
DROP TABLE `membership_registrations`;

-- DropTable
DROP TABLE `staff_registrations`;

-- CreateTable
CREATE TABLE `staff` (
    `id` VARCHAR(191) NOT NULL,
    `surname` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `otherNames` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `address` JSON NULL,
    `employmentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `department` VARCHAR(191) NULL,
    `supervisorId` VARCHAR(191) NULL,
    `role` ENUM('admin', 'secretary', 'coordinator', 'auditor') NOT NULL,
    `assignedArea` VARCHAR(191) NULL,
    `approval` ENUM('pending', 'rejected', 'approved') NOT NULL DEFAULT 'pending',
    `qualifications` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `staff_email_key`(`email`),
    UNIQUE INDEX `staff_phoneNumber_key`(`phoneNumber`),
    INDEX `staff_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(10) NULL,
    `surname` VARCHAR(100) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `other_names` VARCHAR(100) NULL,
    `gender` VARCHAR(10) NULL,
    `date_of_birth` DATETIME(0) NULL,
    `marital_status` VARCHAR(20) NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `alternative_phone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `alternative_email` VARCHAR(255) NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
    `residential_address` TEXT NULL,
    `office_address` TEXT NULL,
    `id_type` VARCHAR(50) NULL,
    `id_number` VARCHAR(100) NULL,
    `id_issue_date` DATETIME(0) NULL,
    `id_expiry_date` DATETIME(0) NULL,
    `occupation` VARCHAR(100) NULL,
    `employer` VARCHAR(255) NULL,
    `work_position` VARCHAR(100) NULL,
    `next_of_kin_name` VARCHAR(200) NULL,
    `next_of_kin_relationship` VARCHAR(50) NULL,
    `next_of_kin_phone` VARCHAR(20) NULL,
    `next_of_kin_address` TEXT NULL,
    `membership_type` VARCHAR(50) NOT NULL DEFAULT 'regular',
    `registration_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `probation_end_date` DATETIME(0) NULL,
    `maturity_status` VARCHAR(20) NOT NULL DEFAULT 'probation',
    `days_to_maturity` INTEGER NULL,
    `tns_number` VARCHAR(50) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `approval_status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `rejection_reason` TEXT NULL,
    `registered_by` CHAR(36) NULL,
    `approved_by` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_tns_number_key`(`tns_number`),
    INDEX `members_email_idx`(`email`),
    INDEX `members_phone_number_idx`(`phone_number`),
    INDEX `members_tns_number_idx`(`tns_number`),
    INDEX `members_status_idx`(`status`),
    INDEX `members_city_state_idx`(`city`, `state`),
    INDEX `members_maturity_status_idx`(`maturity_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_documents` ADD CONSTRAINT `registration_documents_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_documents` ADD CONSTRAINT `registration_documents_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_notes` ADD CONSTRAINT `member_notes_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_notes` ADD CONSTRAINT `member_notes_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_status_history` ADD CONSTRAINT `member_status_history_changed_by_fkey` FOREIGN KEY (`changed_by`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_status_history` ADD CONSTRAINT `member_status_history_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_audit_log` ADD CONSTRAINT `registration_audit_log_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_audit_log` ADD CONSTRAINT `registration_audit_log_performed_by_fkey` FOREIGN KEY (`performed_by`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
