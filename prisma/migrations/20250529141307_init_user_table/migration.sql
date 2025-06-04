-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
