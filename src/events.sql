-- Drop indexes if they exist
DROP INDEX IF EXISTS "idx_events_block_number";
DROP INDEX IF EXISTS "idx_events_args";
DROP INDEX IF EXISTS "idx_events_event_name";

-- Drop table if it exists
DROP TABLE IF EXISTS "events";

-- Create table
CREATE TABLE "events" (
    "event_name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "block_number" BIGINT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    PRIMARY KEY ("transaction_hash", "event_name")
);

-- Create indexes
CREATE INDEX "idx_events_block_number" ON "events"("block_number");
CREATE INDEX "idx_events_args" ON "events" USING GIN ("args");
CREATE INDEX "idx_events_event_name" ON "events"("event_name");
