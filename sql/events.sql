-- Drop indexes if they exist
DROP INDEX IF EXISTS "idx_EIP712DomainChanged_block_number";
DROP INDEX IF EXISTS "idx_EIP712DomainChanged_args";
DROP INDEX IF EXISTS "idx_OrderFulfilled_block_number";
DROP INDEX IF EXISTS "idx_OrderFulfilled_args";
DROP INDEX IF EXISTS "idx_OrderListed_block_number";
DROP INDEX IF EXISTS "idx_OrderListed_args";
DROP INDEX IF EXISTS "idx_OrderRemoved_block_number";
DROP INDEX IF EXISTS "idx_OrderRemoved_args";
DROP INDEX IF EXISTS "idx_OwnershipTransferred_block_number";
DROP INDEX IF EXISTS "idx_OwnershipTransferred_args";
DROP INDEX IF EXISTS "idx_Paused_block_number";
DROP INDEX IF EXISTS "idx_Paused_args";
DROP INDEX IF EXISTS "idx_Unpaused_block_number";
DROP INDEX IF EXISTS "idx_Unpaused_args";

-- Drop tables if they exist
DROP TABLE IF EXISTS "EIP712DomainChanged";
DROP TABLE IF EXISTS "OrderFulfilled";
DROP TABLE IF EXISTS "OrderListed";
DROP TABLE IF EXISTS "OrderRemoved";
DROP TABLE IF EXISTS "OwnershipTransferred";
DROP TABLE IF EXISTS "Paused";
DROP TABLE IF EXISTS "Unpaused";

-- Create tables
CREATE TABLE "EIP712DomainChanged" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    PRIMARY KEY ("transaction_hash")
);

CREATE TABLE "OrderFulfilled" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    PRIMARY KEY ("transaction_hash")
);

CREATE TABLE "OrderListed" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    PRIMARY KEY ("transaction_hash")
);

CREATE TABLE "OrderRemoved" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    PRIMARY KEY ("transaction_hash")
);

CREATE TABLE "OwnershipTransferred" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    PRIMARY KEY ("transaction_hash")
);

CREATE TABLE "Paused" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    PRIMARY KEY ("transaction_hash")
);

CREATE TABLE "Unpaused" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    PRIMARY KEY ("transaction_hash")
);

-- Create indexes
CREATE INDEX "idx_EIP712DomainChanged_block_number" ON "EIP712DomainChanged"("block_number");
CREATE INDEX "idx_EIP712DomainChanged_args" ON "EIP712DomainChanged" USING GIN ("args");

CREATE INDEX "idx_OrderFulfilled_block_number" ON "OrderFulfilled"("block_number");
CREATE INDEX "idx_OrderFulfilled_args" ON "OrderFulfilled" USING GIN ("args");

CREATE INDEX "idx_OrderListed_block_number" ON "OrderListed"("block_number");
CREATE INDEX "idx_OrderListed_args" ON "OrderListed" USING GIN ("args");

CREATE INDEX "idx_OrderRemoved_block_number" ON "OrderRemoved"("block_number");
CREATE INDEX "idx_OrderRemoved_args" ON "OrderRemoved" USING GIN ("args");

CREATE INDEX "idx_OwnershipTransferred_block_number" ON "OwnershipTransferred"("block_number");
CREATE INDEX "idx_OwnershipTransferred_args" ON "OwnershipTransferred" USING GIN ("args");

CREATE INDEX "idx_Paused_block_number" ON "Paused"("block_number");
CREATE INDEX "idx_Paused_args" ON "Paused" USING GIN ("args");

CREATE INDEX "idx_Unpaused_block_number" ON "Unpaused"("block_number");
CREATE INDEX "idx_Unpaused_args" ON "Unpaused" USING GIN ("args");