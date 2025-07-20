import 'dotenv/config';
import { Client } from 'pg';
import type { MiniMartEvents } from '../../types/events.js';
import format from 'pg-format';

export const client = new Client();

export async function writeBatchToDB(eventBatch: MiniMartEvents[]) {
    try {
        await client.query('BEGIN');

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

        await client.query('COMMIT');

        console.log(`Successfully wrote ${eventBatch.length} unique events to the database.`);

        eventBatch.length = 0;
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error writing to the database, rolling back transaction.', e);
        throw e;
    }
}
