import 'dotenv/config';
import { Pool, type PoolClient } from 'pg';
import type { MiniMartEvents } from '../../types/events.js';
import format from 'pg-format';

export const pool = new Pool();

async function withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

export async function writeBatchToDB(eventBatch: MiniMartEvents[]) {
    await withTransaction(async (client) => {
        const replacer = (_key: string, value: unknown): unknown => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        };

        const formattedEvents = eventBatch.map((event) => [
            event.eventName,
            JSON.stringify(event.args, replacer),
            event.blockNumber.toString(),
            event.transactionHash,
            event.logIndex,
        ]);

        const queryText = format(
            'INSERT INTO events (event_name, args, block_number, transaction_hash, log_index) VALUES %L ON CONFLICT (transaction_hash, log_index) DO NOTHING',
            formattedEvents
        );

        await client.query(queryText);
    });

    console.log(`Successfully wrote ${eventBatch.length} unique events to the database.`);
    eventBatch.length = 0;
}
