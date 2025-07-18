import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { client } from './db.js';

async function setUp() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const fileStr = join(__dirname, 'events.sql');

    console.log({ fileStr });

    const sqlFile = await readFile(join(__dirname, 'events.sql'), { encoding: 'utf8' });

    await client.connect();
    await client.query(sqlFile);
}

try {
    await setUp();
    console.log('db setup');
    process.exit(0);
} catch (e) {
    console.log(e);
    process.exit(1);
}
