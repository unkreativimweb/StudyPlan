-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "velocityFactorS" REAL NOT NULL DEFAULT 1.0,
    "velocityFactorM" REAL NOT NULL DEFAULT 1.0,
    "velocityFactorL" REAL NOT NULL DEFAULT 1.0,
    "velocityFactorXL" REAL NOT NULL DEFAULT 1.0
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isSichtung" BOOLEAN NOT NULL DEFAULT false,
    "expectedDurationMinutes" REAL,
    "actualDurationMinutes" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Topic_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "durationMinutes" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionTrack_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FixedBlocker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "specificDate" DATETIME,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "defaultDurationS" REAL NOT NULL DEFAULT 30,
    "defaultDurationM" REAL NOT NULL DEFAULT 60,
    "defaultDurationL" REAL NOT NULL DEFAULT 120,
    "defaultDurationXL" REAL NOT NULL DEFAULT 240,
    "dailyBufferMinutes" REAL NOT NULL DEFAULT 60
);
