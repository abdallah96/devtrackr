-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Add userId column to Task table
ALTER TABLE "Task" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;

-- Add userId column to JournalEntry table
ALTER TABLE "JournalEntry" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;

-- Create a default user
INSERT INTO "User" ("email", "password", "name", "createdAt", "updatedAt") 
VALUES ('default@example.com', '$2a$12$defaultpassword', 'Default User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove default values after foreign keys are established
ALTER TABLE "Task" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "JournalEntry" ALTER COLUMN "userId" DROP DEFAULT; 