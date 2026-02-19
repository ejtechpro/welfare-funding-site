-- DropIndex
DROP INDEX `user_sessions_sessionId_key` ON `user_sessions`;

-- AlterTable
ALTER TABLE `user_sessions` MODIFY `sessionId` TEXT NOT NULL;
