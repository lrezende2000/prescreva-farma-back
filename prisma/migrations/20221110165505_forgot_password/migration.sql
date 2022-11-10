-- CreateTable
CREATE TABLE "forgot_password_tokens" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "forgot_password_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_blacklist" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tokens_blacklist_token_idx" ON "tokens_blacklist"("token");
