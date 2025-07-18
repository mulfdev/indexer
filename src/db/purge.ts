import { client } from './db.js';

async function purge() {
    await client.connect();
    await client.query('DROP table events');
}

try {
    await purge();
    console.log('db purged');
    process.exit(0);
} catch (e) {
    console.log(e);
    process.exit(1);
}
