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
