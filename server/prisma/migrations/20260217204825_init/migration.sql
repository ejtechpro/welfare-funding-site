-- CreateTable
CREATE TABLE `staffs` (
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

    UNIQUE INDEX `staffs_email_key`(`email`),
    UNIQUE INDEX `staffs_phoneNumber_key`(`phoneNumber`),
    INDEX `staffs_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` VARCHAR(191) NOT NULL,
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

-- CreateTable
CREATE TABLE `member_approvals` (
    `id` CHAR(36) NOT NULL,
    `member_id` CHAR(36) NOT NULL,
    `approval_level` INTEGER NOT NULL,
    `approver_role` VARCHAR(100) NOT NULL,
    `approver_id` CHAR(36) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `comments` TEXT NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `member_approvals_member_id_idx`(`member_id`),
    INDEX `member_approvals_status_idx`(`status`),
    UNIQUE INDEX `member_approvals_member_id_approval_level_key`(`member_id`, `approval_level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registration_documents` (
    `id` CHAR(36) NOT NULL,
    `member_id` CHAR(36) NOT NULL,
    `document_type` VARCHAR(50) NOT NULL,
    `document_name` VARCHAR(255) NOT NULL,
    `file_url` TEXT NOT NULL,
    `file_size` INTEGER NULL,
    `mime_type` VARCHAR(100) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `verified_by` CHAR(36) NULL,
    `verified_at` DATETIME(3) NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `registration_documents_member_id_idx`(`member_id`),
    INDEX `registration_documents_document_type_idx`(`document_type`),
    INDEX `registration_documents_is_verified_idx`(`is_verified`),
    INDEX `registration_documents_verified_by_fkey`(`verified_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_notes` (
    `id` CHAR(36) NOT NULL,
    `member_id` CHAR(36) NOT NULL,
    `note_type` VARCHAR(50) NOT NULL DEFAULT 'general',
    `note_content` TEXT NOT NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `member_notes_member_id_idx`(`member_id`),
    INDEX `member_notes_note_type_idx`(`note_type`),
    INDEX `member_notes_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_status_history` (
    `id` CHAR(36) NOT NULL,
    `member_id` CHAR(36) NOT NULL,
    `previous_status` VARCHAR(50) NULL,
    `new_status` VARCHAR(50) NOT NULL,
    `change_reason` TEXT NULL,
    `changed_by` CHAR(36) NULL,
    `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `member_status_history_member_id_idx`(`member_id`),
    INDEX `member_status_history_new_status_idx`(`new_status`),
    INDEX `member_status_history_changed_by_fkey`(`changed_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registration_audit_log` (
    `id` CHAR(36) NOT NULL,
    `member_id` CHAR(36) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `field_name` VARCHAR(100) NULL,
    `old_value` TEXT NULL,
    `new_value` TEXT NULL,
    `performed_by` CHAR(36) NULL,
    `performed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,

    INDEX `registration_audit_log_member_id_idx`(`member_id`),
    INDEX `registration_audit_log_action_idx`(`action`),
    INDEX `registration_audit_log_performed_at_idx`(`performed_at`),
    INDEX `registration_audit_log_performed_by_fkey`(`performed_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `staffs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_documents` ADD CONSTRAINT `registration_documents_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_documents` ADD CONSTRAINT `registration_documents_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `staffs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_notes` ADD CONSTRAINT `member_notes_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_notes` ADD CONSTRAINT `member_notes_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_status_history` ADD CONSTRAINT `member_status_history_changed_by_fkey` FOREIGN KEY (`changed_by`) REFERENCES `staffs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_status_history` ADD CONSTRAINT `member_status_history_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_audit_log` ADD CONSTRAINT `registration_audit_log_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_audit_log` ADD CONSTRAINT `registration_audit_log_performed_by_fkey` FOREIGN KEY (`performed_by`) REFERENCES `staffs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
