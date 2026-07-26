-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResumeAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "resumeText" TEXT NOT NULL,
    "jobText" TEXT NOT NULL,
    "jobTitle" TEXT,
    "matchingSkills" TEXT NOT NULL,
    "missingSkills" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResumeAnalysis_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ResumeAnalysis" ("advice", "authorId", "createdAt", "id", "jobText", "jobTitle", "matchingSkills", "missingSkills", "resumeText") SELECT "advice", "authorId", "createdAt", "id", "jobText", "jobTitle", "matchingSkills", "missingSkills", "resumeText" FROM "ResumeAnalysis";
DROP TABLE "ResumeAnalysis";
ALTER TABLE "new_ResumeAnalysis" RENAME TO "ResumeAnalysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
