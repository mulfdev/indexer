import 'dotenv/config';
import assert from 'node:assert';
import {
    createPublicClient,
    webSocket,
    type AbiEvent,
    type AbiItem,
    type GetFilterLogsReturnType,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setTimeout } from 'node:timers/promises';

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
    const eventBatchSize = 50;
    let startBlock = 27557040n;
    let endblock = startBlock + batchSize;
    let blockHeight = await publicClient.getBlockNumber();

    const eventBatch: GetFilterLogsReturnType = [];

    try {
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

            await setTimeout(250);
            const logs = await publicClient.getFilterLogs({ filter });
            if (logs.length != 0) {
                console.log(logs);
                eventBatch.push(...logs);
            }
        }
        // eventName: 'OrderFulfilled',
        //     args: {
        //       orderId: '0x85267016096b63ddbf4aecc032d1188379a2cc75ab649acbec9e61bea4c023a6',
        //       buyer: '0x193caa0449Ec1135A4c3FACd198da66DE72aC4Ed'
        //     },
        //           blockNumber: 27862181n,
        //        transactionHash
        while (true) {
            console.log('Getting fresh events\n');

            const newEvtLogs = await publicClient.getLogs({
                address: '0xD752F23C1C5b82c1b749ff048B7edc0b70AC5C5A',
                events: eventSigs,
                fromBlock: blockHeight,
            });

            console.log(newEvtLogs);
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
