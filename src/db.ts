import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Client } from 'pg';
export const client = new Client();

export async function setUp() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const fileStr = join(__dirname, 'events.sql');

    console.log({ fileStr });

    const sqlFile = await readFile(join(__dirname, 'events.sql'), { encoding: 'utf8' });

    await client.query(sqlFile);
}
