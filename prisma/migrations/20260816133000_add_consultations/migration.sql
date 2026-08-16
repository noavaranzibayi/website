-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('OPEN', 'ANSWERED', 'CLOSED');

-- CreateTable
CREATE TABLE "consultation_threads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "serviceId" TEXT,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isAdminReply" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consultation_threads_userId_idx" ON "consultation_threads"("userId");

-- CreateIndex
CREATE INDEX "consultation_threads_status_idx" ON "consultation_threads"("status");

-- CreateIndex
CREATE INDEX "consultation_threads_updatedAt_idx" ON "consultation_threads"("updatedAt");

-- CreateIndex
CREATE INDEX "consultation_messages_threadId_createdAt_idx" ON "consultation_messages"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "consultation_messages_senderId_idx" ON "consultation_messages"("senderId");

-- AddForeignKey
ALTER TABLE "consultation_threads" ADD CONSTRAINT "consultation_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_messages" ADD CONSTRAINT "consultation_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "consultation_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_messages" ADD CONSTRAINT "consultation_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;