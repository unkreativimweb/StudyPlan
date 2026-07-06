-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "color" TEXT,
    "sichtungsphaseCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "velocityFactorS" REAL NOT NULL DEFAULT 1.0,
    "velocityFactorM" REAL NOT NULL DEFAULT 1.0,
    "velocityFactorL" REAL NOT NULL DEFAULT 1.0,
    "velocityFactorXL" REAL NOT NULL DEFAULT 1.0
);
INSERT INTO "new_Exam" ("color", "createdAt", "deadline", "id", "name", "updatedAt", "velocityFactorL", "velocityFactorM", "velocityFactorS", "velocityFactorXL") SELECT "color", "createdAt", "deadline", "id", "name", "updatedAt", "velocityFactorL", "velocityFactorM", "velocityFactorS", "velocityFactorXL" FROM "Exam";
DROP TABLE "Exam";
ALTER TABLE "new_Exam" RENAME TO "Exam";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
