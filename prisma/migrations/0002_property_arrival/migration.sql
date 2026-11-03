-- CreateTable
CREATE TABLE "PropertyArrival" (
    "propertySlug" TEXT NOT NULL,
    "address" TEXT,
    "checkInMethod" TEXT,
    "doorCode" TEXT,
    "wifiName" TEXT,
    "wifiPassword" TEXT,
    "parking" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyArrival_pkey" PRIMARY KEY ("propertySlug")
);

