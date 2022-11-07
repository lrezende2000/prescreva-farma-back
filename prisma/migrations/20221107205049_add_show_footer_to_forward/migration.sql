/*
  Warnings:

  - Added the required column `showFooter` to the `forwarders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "forwarders" ADD COLUMN     "showFooter" BOOLEAN NOT NULL;
