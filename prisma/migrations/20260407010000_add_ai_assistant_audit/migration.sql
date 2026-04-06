-- CreateTable
CREATE TABLE "AiAssistantAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "requestMessage" TEXT NOT NULL,
    "responsePreview" TEXT NOT NULL,
    "sensitiveBlocked" BOOLEAN NOT NULL DEFAULT false,
    "toolsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAssistantAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiAssistantAudit_userId_createdAt_idx" ON "AiAssistantAudit"("userId", "createdAt");
