/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `memberships` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `memberships` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sex` to the `memberships` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_phoneNumber_key` ON `users`;

-- AlterTable
ALTER TABLE `memberships` DROP COLUMN `dateOfBirth`,
    DROP COLUMN `gender`,
    ADD COLUMN `sex` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `phoneNumber`,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_phone_key` ON `users`(`phone`);
