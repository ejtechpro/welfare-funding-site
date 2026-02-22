/*
  Warnings:

  - You are about to alter the column `amount` on the `contributions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `disbursements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `prepaid` on the `member_balances` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `due` on the `member_balances` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `contributions` MODIFY `amount` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `disbursements` MODIFY `amount` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `member_balances` MODIFY `prepaid` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `due` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `transactions` MODIFY `amount` DECIMAL(10, 2) NOT NULL;
