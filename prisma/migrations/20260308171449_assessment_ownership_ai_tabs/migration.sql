-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "createdByRole" TEXT NOT NULL DEFAULT 'admin',
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "isAIGenerated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Assessment_createdByRole_idx" ON "Assessment"("createdByRole");

-- CreateIndex
CREATE INDEX "Assessment_createdByUserId_idx" ON "Assessment"("createdByUserId");
