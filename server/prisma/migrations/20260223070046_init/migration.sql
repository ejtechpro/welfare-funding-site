/*
  Warnings:

  - You are about to drop the column `contributionType` on the `contributions` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `disbursements` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `monthly_expenses` table. All the data in the column will be lost.
  - You are about to drop the column `monthYear` on the `monthly_expenses` table. All the data in the column will be lost.
  - The values [supplies] on the enum `monthly_expenses_expenseCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `tns_cases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tns_projects` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contributionTypeId` to the `contributions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `monthly_expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `contributions` DROP FOREIGN KEY `contributions_caseId_fkey`;

-- DropForeignKey
ALTER TABLE `contributions` DROP FOREIGN KEY `contributions_projectId_fkey`;

-- DropIndex
DROP INDEX `contributions_caseId_fkey` ON `contributions`;

-- DropIndex
DROP INDEX `contributions_projectId_fkey` ON `contributions`;

-- AlterTable
ALTER TABLE `contributions` DROP COLUMN `contributionType`,
    ADD COLUMN `contributionTypeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `disbursements` DROP COLUMN `approvedBy`,
    ADD COLUMN `approvedById` VARCHAR(191) NULL,
    MODIFY `status` ENUM('pending', 'approved', 'rejected', 'cancelled', 'paid') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `monthly_expenses` DROP COLUMN `approvedBy`,
    DROP COLUMN `monthYear`,
    ADD COLUMN `approvedById` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('pending', 'approved', 'rejected', 'cancelled', 'paid') NOT NULL,
    MODIFY `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `expenseCategory` ENUM('rent', 'utilities', 'salaries', 'office_supplies', 'maintenance', 'transportation', 'communication', 'professional_fees', 'insurance', 'marketing', 'other') NOT NULL,
    MODIFY `description` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `monthlyExpenseId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `tns_cases`;

-- DropTable
DROP TABLE `tns_projects`;

-- CreateTable
CREATE TABLE `contribution_types` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('monthly_contribution', 'case', 'project', 'registration', 'other') NOT NULL,
    `defaultAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `status` ENUM('active', 'pending', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    `description` TEXT NULL,
    `contributionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contribution_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_contributionTypeId_fkey` FOREIGN KEY (`contributionTypeId`) REFERENCES `contribution_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_monthlyExpenseId_fkey` FOREIGN KEY (`monthlyExpenseId`) REFERENCES `monthly_expenses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monthly_expenses` ADD CONSTRAINT `monthly_expenses_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disbursements` ADD CONSTRAINT `disbursements_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
