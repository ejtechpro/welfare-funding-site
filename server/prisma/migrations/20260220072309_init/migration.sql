/*
  Warnings:

  - You are about to drop the column `mpesaPaymentPeference` on the `members` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `member_approvals` DROP FOREIGN KEY `member_approvals_approverId_fkey`;

-- DropIndex
DROP INDEX `member_approvals_approverId_fkey` ON `member_approvals`;

-- AlterTable
ALTER TABLE `member_approvals` MODIFY `approverId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `members` DROP COLUMN `mpesaPaymentPeference`,
    ADD COLUMN `mpesaPaymentReference` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `member_approvals` ADD CONSTRAINT `member_approvals_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
