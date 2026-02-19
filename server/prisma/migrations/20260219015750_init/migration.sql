/*
  Warnings:

  - You are about to drop the `emergency_contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `memberships` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contributionType` to the `contributions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `contributions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `disbursements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disbursementDate` to the `disbursements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `disbursements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `beneficiaries` DROP FOREIGN KEY `beneficiaries_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `emergency_contacts` DROP FOREIGN KEY `emergency_contacts_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `member_activities` DROP FOREIGN KEY `member_activities_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `member_approvals` DROP FOREIGN KEY `member_approvals_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `member_documents` DROP FOREIGN KEY `member_documents_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `member_files` DROP FOREIGN KEY `member_files_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `member_logs` DROP FOREIGN KEY `member_logs_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `member_payments` DROP FOREIGN KEY `member_payments_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `member_settings` DROP FOREIGN KEY `member_settings_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `memberships` DROP FOREIGN KEY `memberships_userId_fkey`;

-- DropForeignKey
ALTER TABLE `payment_history` DROP FOREIGN KEY `payment_history_memberId_fkey`;

-- DropIndex
DROP INDEX `beneficiaries_memberId_fkey` ON `beneficiaries`;

-- DropIndex
DROP INDEX `member_approvals_memberId_fkey` ON `member_approvals`;

-- DropIndex
DROP INDEX `member_documents_memberId_fkey` ON `member_documents`;

-- DropIndex
DROP INDEX `member_files_memberId_fkey` ON `member_files`;

-- DropIndex
DROP INDEX `member_settings_memberId_fkey` ON `member_settings`;

-- DropIndex
DROP INDEX `payment_history_memberId_fkey` ON `payment_history`;

-- AlterTable
ALTER TABLE `contributions` ADD COLUMN `amount` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `caseId` VARCHAR(191) NULL,
    ADD COLUMN `contributionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `contributionType` ENUM('monthly_contribution', 'cases', 'project', 'registration', 'other') NOT NULL,
    ADD COLUMN `memberId` VARCHAR(191) NOT NULL,
    ADD COLUMN `month` INTEGER NULL,
    ADD COLUMN `projectId` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('paid', 'pending', 'failed') NOT NULL DEFAULT 'pending',
    ADD COLUMN `year` INTEGER NULL;

-- AlterTable
ALTER TABLE `disbursements` ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `approvedBy` VARCHAR(191) NULL,
    ADD COLUMN `bereavementFormUrl` VARCHAR(191) NULL,
    ADD COLUMN `disbursementDate` DATETIME(3) NOT NULL,
    ADD COLUMN `disbursementType` ENUM('regular', 'emergency', 'bereavement', 'other') NULL,
    ADD COLUMN `memberId` VARCHAR(191) NOT NULL,
    ADD COLUMN `reason` TEXT NULL,
    ADD COLUMN `status` ENUM('pending', 'approved', 'rejected', 'paid') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `profilePicture` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `emergency_contacts`;

-- DropTable
DROP TABLE `member_activities`;

-- DropTable
DROP TABLE `member_logs`;

-- DropTable
DROP TABLE `member_payments`;

-- DropTable
DROP TABLE `memberships`;

-- CreateTable
CREATE TABLE `contact_submission` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'read', 'resolved') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disbursement_documents` (
    `id` VARCHAR(191) NOT NULL,
    `disbursementId` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `fileData` VARCHAR(191) NOT NULL,
    `uploadedBy` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `disbursement_documents_disbursementId_idx`(`disbursementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` VARCHAR(191) NOT NULL,
    `tnsNumber` VARCHAR(191) NOT NULL,
    `alternativePhone` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `zipCode` VARCHAR(191) NOT NULL,
    `idNumber` VARCHAR(191) NOT NULL,
    `sex` VARCHAR(191) NOT NULL,
    `maritalStatus` ENUM('married', 'single', 'widow', 'widower', 'other') NOT NULL,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactPhone` VARCHAR(191) NULL,
    `membershipType` ENUM('basic', 'family', 'regular', 'premium', 'vip', 'honorary') NOT NULL DEFAULT 'basic',
    `registrationStatus` ENUM('pending', 'rejected', 'approved') NOT NULL DEFAULT 'pending',
    `paymentStatus` ENUM('paid', 'pending') NULL,
    `maturityStatus` ENUM('probation', 'matured', 'active') NULL,
    `daysToMaturity` INTEGER NULL,
    `probationEndDate` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_parents` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `altPhone` VARCHAR(191) NULL,
    `area` VARCHAR(191) NULL,
    `idNumber` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_spouses` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `altPhone` VARCHAR(191) NULL,
    `area` VARCHAR(191) NULL,
    `sex` VARCHAR(191) NULL,
    `idNumber` VARCHAR(191) NULL,
    `photoUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monthly_expenses` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `expenseCategory` ENUM('utilities', 'salaries', 'rent', 'supplies', 'maintenance', 'other') NOT NULL,
    `description` TEXT NULL,
    `approvedBy` VARCHAR(191) NULL,
    `expenseDate` DATETIME(3) NOT NULL,
    `monthYear` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `monthly_expenses_expenseCategory_idx`(`expenseCategory`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mpesa_payments` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `checkoutRequestId` VARCHAR(191) NULL,
    `merchantRequestId` VARCHAR(191) NULL,
    `mpesaReceiptNumber` VARCHAR(191) NULL,
    `resultCode` VARCHAR(191) NULL,
    `resultDesc` VARCHAR(191) NULL,
    `transactionDate` DATETIME(3) NULL,
    `status` ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `mpesa_payments_memberId_idx`(`memberId`),
    INDEX `mpesa_payments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_balance` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `data` JSON NULL,
    `assignedArea` VARCHAR(191) NULL,
    `submittedToRole` VARCHAR(191) NOT NULL,
    `taskType` ENUM('general', 'maintenance', 'follow_up', 'other') NOT NULL,
    `priority` ENUM('low', 'medium', 'high', 'urgent') NULL,
    `status` ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `tasks_assignedArea_idx`(`assignedArea`),
    INDEX `tasks_submittedToRole_idx`(`submittedToRole`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `contributions_memberId_idx` ON `contributions`(`memberId`);

-- CreateIndex
CREATE INDEX `contributions_projectId_idx` ON `contributions`(`projectId`);

-- CreateIndex
CREATE INDEX `contributions_caseId_idx` ON `contributions`(`caseId`);

-- CreateIndex
CREATE INDEX `disbursements_memberId_idx` ON `disbursements`(`memberId`);

-- CreateIndex
CREATE INDEX `disbursements_status_idx` ON `disbursements`(`status`);

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disbursements` ADD CONSTRAINT `disbursements_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disbursement_documents` ADD CONSTRAINT `disbursement_documents_disbursementId_fkey` FOREIGN KEY (`disbursementId`) REFERENCES `disbursements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_parents` ADD CONSTRAINT `member_parents_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_spouses` ADD CONSTRAINT `member_spouses_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_history` ADD CONSTRAINT `payment_history_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_files` ADD CONSTRAINT `member_files_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_documents` ADD CONSTRAINT `member_documents_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_settings` ADD CONSTRAINT `member_settings_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `beneficiaries` ADD CONSTRAINT `beneficiaries_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mpesa_payments` ADD CONSTRAINT `mpesa_payments_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
