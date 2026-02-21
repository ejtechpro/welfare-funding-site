-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `userRole` ENUM('super_admin', 'admin', 'user', 'member', 'advisory_committee', 'general_coordinator', 'area_coordinator', 'secretary', 'customer_service_personnel', 'organizing_secretary', 'treasurer', 'auditor') NOT NULL DEFAULT 'user',
    `requestedRole` ENUM('super_admin', 'admin', 'user', 'member', 'advisory_committee', 'general_coordinator', 'area_coordinator', 'secretary', 'customer_service_personnel', 'organizing_secretary', 'treasurer', 'auditor') NULL,
    `assignedArea` VARCHAR(191) NULL,
    `approval` ENUM('pending', 'rejected', 'approved') NOT NULL DEFAULT 'pending',
    `status` ENUM('active', 'inactive', 'suspended', 'banned') NOT NULL DEFAULT 'active',
    `verificationCode` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `photo` VARCHAR(191) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NULL,
    `deviceInfo` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `compositeKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_sessions_compositeKey_key`(`compositeKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contributions` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `contributionType` ENUM('monthly_contribution', 'case', 'project', 'registration', 'other') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `caseId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tns_projects` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('pending', 'completed', 'cancelled') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tns_cases` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('in_progress', 'completed', 'cancelled') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `transactionMethod` ENUM('mpesa', 'cash') NOT NULL,
    `transactionType` ENUM('contribution', 'disbursement') NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `transactionStatus` ENUM('completed', 'pending', 'failed') NOT NULL DEFAULT 'pending',
    `memberId` VARCHAR(191) NOT NULL,
    `transactedById` VARCHAR(191) NULL,
    `contributionId` VARCHAR(191) NULL,
    `disbursementId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_balances` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `prepaid` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `due` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` VARCHAR(191) NOT NULL,
    `tnsNumber` VARCHAR(191) NULL,
    `alternativePhone` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL,
    `areaOfResidence` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `idNumber` VARCHAR(191) NOT NULL,
    `sex` VARCHAR(191) NOT NULL,
    `maritalStatus` ENUM('married', 'single', 'divorced', 'widowed') NOT NULL,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactPhone` VARCHAR(191) NULL,
    `membershipType` ENUM('basic', 'individual', 'family') NOT NULL DEFAULT 'basic',
    `registrationStatus` ENUM('pending', 'rejected', 'approved') NOT NULL DEFAULT 'pending',
    `paymentStatus` ENUM('completed', 'pending', 'failed') NULL,
    `maturityStatus` ENUM('probation', 'matured') NULL,
    `probationEndDate` DATETIME(3) NULL,
    `mpesaPaymentReference` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_tnsNumber_key`(`tnsNumber`),
    UNIQUE INDEX `members_idNumber_key`(`idNumber`),
    UNIQUE INDEX `members_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disbursements` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `reason` TEXT NULL,
    `disbursementType` ENUM('regular', 'emergency', 'bereavement', 'other') NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'paid') NOT NULL DEFAULT 'pending',
    `approvedBy` VARCHAR(191) NULL,
    `bereavementFormUrl` VARCHAR(191) NULL,
    `disbursementDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `disbursements_status_idx`(`status`),
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
CREATE TABLE `mpesa_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `checkoutRequestId` VARCHAR(191) NULL,
    `merchantRequestId` VARCHAR(191) NULL,
    `mpesaReceiptNumber` VARCHAR(191) NULL,
    `resultCode` VARCHAR(191) NULL,
    `resultDesc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mpesa_transactions_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `tns_counts` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `current` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_parents` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `altPhone` VARCHAR(191) NULL,
    `areaOfResidence` VARCHAR(191) NULL,
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
    `areaOfResidence` VARCHAR(191) NULL,
    `sex` VARCHAR(191) NULL,
    `idNumber` VARCHAR(191) NULL,
    `photo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_children` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `dob` VARCHAR(191) NOT NULL,
    `age` VARCHAR(191) NOT NULL,
    `birthCertificate` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_files` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_documents` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_settings` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `beneficiaries` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,

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
CREATE TABLE `member_approvals` (
    `id` VARCHAR(191) NOT NULL,
    `approvalType` ENUM('registration', 'payment', 'loan', 'withdrawal', 'benefit', 'penalty', 'profile_update', 'user_status', 'termination') NOT NULL,
    `comment` TEXT NULL,
    `approverId` VARCHAR(191) NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_approvals` (
    `id` VARCHAR(191) NOT NULL,
    `approvalType` ENUM('registration', 'payment', 'loan', 'withdrawal', 'benefit', 'penalty', 'profile_update', 'user_status', 'termination') NOT NULL,
    `comment` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `approverId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

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

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `tns_projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `tns_cases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_transactedById_fkey` FOREIGN KEY (`transactedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_contributionId_fkey` FOREIGN KEY (`contributionId`) REFERENCES `contributions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_disbursementId_fkey` FOREIGN KEY (`disbursementId`) REFERENCES `disbursements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_balances` ADD CONSTRAINT `member_balances_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disbursement_documents` ADD CONSTRAINT `disbursement_documents_disbursementId_fkey` FOREIGN KEY (`disbursementId`) REFERENCES `disbursements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mpesa_transactions` ADD CONSTRAINT `mpesa_transactions_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_parents` ADD CONSTRAINT `member_parents_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_spouses` ADD CONSTRAINT `member_spouses_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_children` ADD CONSTRAINT `member_children_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_files` ADD CONSTRAINT `member_files_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_documents` ADD CONSTRAINT `member_documents_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_settings` ADD CONSTRAINT `member_settings_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `beneficiaries` ADD CONSTRAINT `beneficiaries_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_approvals` ADD CONSTRAINT `staff_approvals_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_approvals` ADD CONSTRAINT `staff_approvals_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
