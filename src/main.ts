import 'dotenv/config';
import assert from 'node:assert';
import { createPublicClient, webSocket, type AbiEvent, type AbiItem } from 'viem';
import { baseSepolia } from 'viem/chains';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setTimeout } from 'node:timers/promises';
import { client } from './db.js';
import format from 'pg-format';
import type { MiniMartEvents } from '../types/events.js';
// import type { MiniMartEvents } from '../types/events.js';
// import type { QueryResult } from 'pg';

const { RPC_URL } = process.env;

assert(typeof RPC_URL === 'string', 'RPC_URL must be set');

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: webSocket(RPC_URL),
});

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const abiPath = join(__dirname, 'abi');

async function main() {
    const batchSize = 5000n;
    const eventBatchSize = 20;
    let startBlock = 27557040n;
    let endblock = startBlock + batchSize;
    let blockHeight = await publicClient.getBlockNumber();

    const eventBatch: MiniMartEvents[] = [];

    try {
        await client.connect();

        const eventSigs: AbiEvent[] = [];

        const content = await readFile(join(abiPath, 'MiniMart.json'), 'utf8');
        const data = JSON.parse(content) as AbiItem[];

        for (const item of data) {
            if (item.type === 'event') {
                eventSigs.push({
                    name: item.name,
                    inputs: item.inputs,
                    type: item.type,
                });
            }
        }

        while (true) {
            blockHeight = await publicClient.getBlockNumber();
            console.log(`current block height: ${blockHeight}`);

            if (startBlock > blockHeight) {
                console.log('all caught up');
                break;
            }

            console.log(`Start block for this run: ${startBlock} / Endblock: ${endblock}\n`);

            const filter = await publicClient.createEventFilter({
                address: '0xD752F23C1C5b82c1b749ff048B7edc0b70AC5C5A',
                events: eventSigs,
                fromBlock: startBlock,
                toBlock: endblock,
            });

            startBlock = endblock + 1n;
            endblock = startBlock + batchSize;

            const logs = await publicClient.getFilterLogs({ filter });
            if (logs.length > 0) {
                const typedLogs = logs as unknown as MiniMartEvents[];

                eventBatch.push(...typedLogs);

                console.log(`Added ${typedLogs.length} new events to the batch.`);
            }
            console.log('CURRENT BATCH SIZE: ', eventBatch.length);
            if (eventBatch.length >= eventBatchSize) {
                console.log(`Writing ${eventBatch.length} events to the database.`);
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
                    ]);

                    const queryText = format(
                        'INSERT INTO events (event_name, args, block_number, transaction_hash) VALUES %L ON CONFLICT (transaction_hash, event_name) DO NOTHING',
                        formattedEvents
                    );

                    await client.query(queryText);
                    await client.query('COMMIT');

                    console.log('Successfully wrote batch to the database.');
                    // Clear the batch after successful insertion
                    eventBatch.length = 0;
                } catch (e) {
                    await client.query('ROLLBACK');
                    console.error('Error writing to the database, rolling back transaction.', e);
                }
            }
            await setTimeout(100);
        }
        while (true) {
            console.log('Getting fresh events\n');

            const newEvtLogs = await publicClient.getLogs({
                address: '0xD752F23C1C5b82c1b749ff048B7edc0b70AC5C5A',
                events: eventSigs,
                fromBlock: blockHeight,
            });

            blockHeight = await publicClient.getBlockNumber();
        }
    } catch (e) {
        console.log(e);
    }
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch(() => {
        throw new Error('Main function failed');
    });
