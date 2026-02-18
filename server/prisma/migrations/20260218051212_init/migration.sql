/*
  Warnings:

  - You are about to drop the `staffs_session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `staffs_session` DROP FOREIGN KEY `staffs_session_staffId_fkey`;

-- DropTable
DROP TABLE `staffs_session`;

-- CreateTable
CREATE TABLE `staff_sessions` (
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

    UNIQUE INDEX `staff_sessions_sessionId_key`(`sessionId`),
    UNIQUE INDEX `staff_sessions_compositeKey_key`(`compositeKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `staff_sessions` ADD CONSTRAINT `staff_sessions_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staffs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
