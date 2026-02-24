/*
  Warnings:

  - You are about to drop the column `contributionId` on the `contribution_types` table. All the data in the column will be lost.
  - The values [monthly_contribution] on the enum `contribution_types_category` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `status` on the `contribution_types` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(7))` to `Enum(EnumId(6))`.
  - You are about to drop the column `contributionTypeId` on the `contributions` table. All the data in the column will be lost.
  - Added the required column `contributionType` to the `contributions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `contributions` DROP FOREIGN KEY `contributions_contributionTypeId_fkey`;

-- DropIndex
DROP INDEX `contributions_contributionTypeId_fkey` ON `contributions`;

-- AlterTable
ALTER TABLE `contribution_types` DROP COLUMN `contributionId`,
    MODIFY `category` ENUM('monthly', 'case', 'project', 'registration', 'other') NOT NULL,
    MODIFY `status` ENUM('active', 'inactive', 'cancelled', 'completed') NOT NULL DEFAULT 'inactive';

-- AlterTable
ALTER TABLE `contributions` DROP COLUMN `contributionTypeId`,
    ADD COLUMN `contributionType` ENUM('monthly', 'case', 'project', 'registration', 'other') NOT NULL;
