/*
  Warnings:

  - Added the required column `ingredients` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `recipe` ADD COLUMN `ingredients` VARCHAR(191) NOT NULL;
