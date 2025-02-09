-- CreateTable
CREATE TABLE "fetch_history" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,

    CONSTRAINT "fetch_history_pkey" PRIMARY KEY ("id")
);
