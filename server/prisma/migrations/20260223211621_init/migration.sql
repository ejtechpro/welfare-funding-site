/*
  Warnings:

  - The values [manual_payment] on the enum `transactions_transactionMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `member_balances` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `billingDate` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `member_balances` DROP FOREIGN KEY `member_balances_memberId_fkey`;

-- AlterTable
ALTER TABLE `members` ADD COLUMN `balance` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `billingDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `transactions` MODIFY `transactionMethod` ENUM('mpesa', 'cash') NOT NULL;

-- DropTable
DROP TABLE `member_balances`;
