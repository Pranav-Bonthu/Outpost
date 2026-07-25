-- CreateTable
CREATE TABLE "ResumeAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "resumeText" TEXT NOT NULL,
    "jobText" TEXT NOT NULL,
    "jobTitle" TEXT,
    "matchScore" INTEGER NOT NULL,
    "matchingSkills" TEXT NOT NULL,
    "missingSkills" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResumeAnalysis_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
