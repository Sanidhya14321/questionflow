ALTER TABLE "AssessmentResult" ADD COLUMN "submissionKey" TEXT;
CREATE UNIQUE INDEX "AssessmentResult_submissionKey_key" ON "AssessmentResult"("submissionKey");
CREATE TABLE "AssessmentVote" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "voteType" TEXT NOT NULL,
  CONSTRAINT "AssessmentVote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AssessmentVote_assessmentId_userId_key" ON "AssessmentVote"("assessmentId", "userId");
CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");
