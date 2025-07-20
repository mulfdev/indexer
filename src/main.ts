import 'dotenv/config';
import assert from 'node:assert';
import { createPublicClient, http, type AbiItem, type AbiEvent } from 'viem';
import { baseSepolia } from 'viem/chains';

import { client } from './db/db.js';
import type { MiniMartEvents } from '../types/events.js';
import { minimartAbi } from './abi/MiniMart.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { enque } from './queue.js';

const { RPC_URL } = process.env;

assert(typeof RPC_URL === 'string', 'RPC_URL must be set');

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
});

const CONTRACT_ADDRESS = '0xD752F23C1C5b82c1b749ff048B7edc0b70AC5C5A';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const abiPath = join(__dirname, 'abi');

interface MaxBlockResult {
    rows: { max: string | null }[];
}

async function main() {
    const batchSize = 480n;
    let startBlock = 27557040n;
    let blockHeight = await publicClient.getBlockNumber();

    console.log('indexer running\n');
    try {
        await client.connect();
        const lastBlockSaved = (await client.query(
            'SELECT MAX(block_number) from events'
        )) as MaxBlockResult;
        const maxValue = lastBlockSaved.rows[0]?.max;

        let blockNumber: bigint | null = null;
        if (maxValue !== null && maxValue !== undefined) {
            blockNumber = BigInt(maxValue);
        }

        console.log(blockNumber);

        if (blockNumber !== null) {
            startBlock = blockNumber;
            console.log('prior indexing found, starting from block: ', startBlock);
        }

        while (true) {
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

            const filter = await publicClient.createContractEventFilter({
                abi: minimartAbi,
                address: '0xD752F23C1C5b82c1b749ff048B7edc0b70AC5C5A',
                fromBlock: startBlock,
                toBlock: toBlock,
            });

            const logs = (await publicClient.getFilterLogs({ filter })) as MiniMartEvents[];

            if (logs.length > 0) {
                enque(logs);
            }

            startBlock = toBlock + 1n;
            blockHeight = await publicClient.getBlockNumber();
        }

        console.log('Loop finished. Writing final batch...');

        try {
            console.log('we here now, live sync started \n');

            const eventSigs: AbiEvent[] = [];
            const content = await readFile(join(abiPath, 'MiniMart.json'), 'utf8');
            const data = JSON.parse(content) as AbiItem[];
            for (const item of data) {
                if (item.type === 'event') {
                    eventSigs.push(item);
                }
            }

            const unwatch = publicClient.watchEvent({
                address: CONTRACT_ADDRESS,
                events: eventSigs,
                fromBlock: blockHeight,
                onLogs: (logs) => {
                    const formattedLogs = logs as unknown as MiniMartEvents[];
                    enque(formattedLogs);
                },
            });

            process.on('SIGINT', () => {
                unwatch();
                console.log('Shutting down watcher...');
                process.exit(0);
            });
        } catch (e) {
            console.log(e);
        }
    } catch (e) {
        console.error('A critical error occurred in main:', e);
    }
}

void main();
