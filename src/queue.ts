import type { MiniMartEvents } from '../types/events.js';
import { writeBatchToDB } from './db/db.js';
import { setTimeout } from 'timers/promises';

let locked = false;
export const queue: MiniMartEvents[] = [];
const deadletterQueue: MiniMartEvents[] = [];

export function enque(newItems: MiniMartEvents[]) {
    queue.push(...newItems);
    void processQueue();
}

export async function processQueue() {
    let retries = 3;
    let success = false;

    if (locked) return;

    if (queue.length === 0) return;

    locked = true;

    const itemsToProcess: MiniMartEvents[] = [];

    if (queue.length > 20) {
        itemsToProcess.push(...queue.splice(0, 20));
    } else {
        itemsToProcess.push(...queue);
        queue.length = 0;
    }

    try {
        while (retries > 0 && !success) {
            try {
                await writeBatchToDB(itemsToProcess);
                success = true;
            } catch (e) {
                retries--;
                console.log(e);
                await setTimeout(125);
            }
        }

        if (!success) {
            deadletterQueue.push(...itemsToProcess);
        }
    } finally {
        locked = false;
    }

    void processQueue();
}
