import 'dotenv/config';
import assert from 'node:assert';
import { createPublicClient, decodeEventLog, http, type AbiEvent, type AbiItem } from 'viem';
import { baseSepolia } from 'viem/chains';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { client } from './db/db.js';
import format from 'pg-format';
import type { MiniMartEvents } from '../types/events.js';
// import type { MiniMartEvents } from '../types/events.js';
// import type { QueryResult } from 'pg';

const { RPC_URL } = process.env;

assert(typeof RPC_URL === 'string', 'RPC_URL must be set');

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
});

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const abiPath = join(__dirname, 'abi');

export async function writeBatchToDB(eventBatch: MiniMartEvents[]) {
    // If there's nothing to do, exit immediately.
    if (eventBatch.length === 0) {
        return;
    }

    try {
        // Step 2: Perform the database write within a single atomic transaction.
        await client.query('BEGIN');

        // This replacer is necessary to handle JavaScript's native bigint type.
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

async function main() {
    const batchSize = 400n;
    const eventBatchSize = 20;
    let startBlock = 27557040n;
    let blockHeight = await publicClient.getBlockNumber();

    const eventBatch: MiniMartEvents[] = [];

    try {
        await client.connect();

        const eventSigs: AbiEvent[] = [];
        const content = await readFile(join(abiPath, 'MiniMart.json'), 'utf8');
        const data = JSON.parse(content) as AbiItem[];
        for (const item of data) {
            if (item.type === 'event') {
                eventSigs.push(item);
            }
        }

        while (true) {
            blockHeight = await publicClient.getBlockNumber();
            if (startBlock > blockHeight) {
                console.log('All caught up');
                break;
            }
            let toBlock = startBlock + batchSize - 1n;
            if (toBlock > blockHeight) toBlock = blockHeight;
            if (toBlock < startBlock) {
                startBlock = toBlock + 1n;
                continue;
            }

            console.log(`[ATTEMPT] Fetching ALL logs from ${startBlock} to ${toBlock}.`);

            const rawLogs = await publicClient.getLogs({
                address: '0xD752F23C1C5b82c1b749ff048B7edc0b70AC5C5A',
                fromBlock: startBlock,
                toBlock: toBlock,
            });

            if (rawLogs.length > 0) {
                console.log(`[RESULT] Fetched ${rawLogs.length} raw logs for this range.`);

                const typedLogs = rawLogs
                    .map((log) => {
                        const { eventName, args } = decodeEventLog({
                            abi: eventSigs,
                            data: log.data,
                            topics: log.topics,
                        });
                        return { ...log, eventName, args };
                    })
                    .filter((log) => log.eventName) as MiniMartEvents[]; // Filter out any logs that don't match our ABI

                eventBatch.push(...typedLogs);
            } else {
                console.log(`[RESULT] Fetched 0 logs for this range.`);
            }

            if (eventBatch.length >= eventBatchSize) {
                await writeBatchToDB(eventBatch);
            }

            startBlock = toBlock + 1n;
        }

        console.log('Loop finished. Writing final batch...');
        await writeBatchToDB(eventBatch);
    } catch (e) {
        console.error('A critical error occurred in main:', e);
    } finally {
        await client.end();
    }
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch(() => {
        throw new Error('Main function failed');
    });
