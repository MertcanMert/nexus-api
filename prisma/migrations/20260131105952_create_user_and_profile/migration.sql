-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'STAFF', 'MODERATOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "ID" TEXT NOT NULL,
    "name" TEXT,
    "lastName" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "userID" TEXT NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userID_key" ON "profiles"("userID");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
