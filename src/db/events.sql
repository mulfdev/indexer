DROP INDEX IF EXISTS "idx_events_block_number";
DROP INDEX IF EXISTS "idx_events_args";
DROP INDEX IF EXISTS "idx_events_event_name";
DROP TABLE IF EXISTS "events";

-- Create table with the correct primary key
CREATE TABLE "events" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "log_index" INTEGER NOT NULL, -- Add log_index
    PRIMARY KEY ("transaction_hash", "log_index") -- The only truly unique key
);

-- Recreate indexes
CREATE INDEX "idx_events_block_number" ON "events"("block_number");
CREATE INDEX "idx_events_args" ON "events" USING GIN ("args");
CREATE INDEX "idx_events_event_name" ON "events"("event_name");
