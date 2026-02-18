/*
  Warnings:

  - You are about to drop the column `isActive` on the `staffs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `staffs` DROP COLUMN `isActive`,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `status` ENUM('active', 'inactive', 'suspended', 'banned') NOT NULL DEFAULT 'active',
    ADD COLUMN `verificationCode` INTEGER NULL;

-- CreateTable
CREATE TABLE `staffs_session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `staffId` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NULL,
    `deviceInfo` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `compositeKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `staffs_session_sessionId_key`(`sessionId`),
    UNIQUE INDEX `staffs_session_compositeKey_key`(`compositeKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `staffs_session` ADD CONSTRAINT `staffs_session_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staffs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
