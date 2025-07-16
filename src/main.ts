import 'dotenv/config';
import assert from 'node:assert';
import { createPublicClient, webSocket, type AbiEvent, type AbiItem } from 'viem';
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
    let startBlock = 27557040n;
    let endblock = startBlock + batchSize;
    let blockHeight = await publicClient.getBlockNumber();

    try {
        const abis = await readdir(abiPath);

        const eventSigs: AbiEvent[] = [];

        for (const abi of abis) {
            const content = await readFile(join(abiPath, abi), 'utf8');
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
                logs.forEach((log) => {
                    console.log(log.eventName);
                    console.log(log.args);
                });
            }
        }

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
