import { pool } from './db.js';

async function getOrders() {
    // For optimal performance, consider creating this index in your database:
    // CREATE INDEX idx_events_args_orderId_block_number ON events ((args ->> 'orderId'), block_number DESC);
    const client = await pool.connect();
    let orders;
    try {
        orders = await client.query(`
    SELECT DISTINCT ON (args ->> 'orderId')
        event_name,
        args,
        block_number,
        transaction_hash
    FROM
        events
    WHERE
        event_name IN ('OrderListed', 'OrderFulfilled', 'OrderRemoved')
    ORDER BY
        args ->> 'orderId', block_number DESC;
`);
    } finally {
        client.release();
    }
    const listedOrders = orders.rows.filter((order) => order.event_name === 'OrderListed');
    console.log(listedOrders.length, 'events total');
    await pool.end();
}

getOrders()
    .then((data) => {
        console.log(data);
        process.exit(0);
    })
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
