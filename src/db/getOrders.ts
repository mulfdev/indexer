import { client } from './db.js';

async function getOrders() {
    await client.connect();

    const orders = await client.query(`
    WITH latest_events AS (
        SELECT
            event_name,
            args,
            block_number,
            transaction_hash,
            ROW_NUMBER() OVER (
                PARTITION BY (args ->> 'orderId')
                ORDER BY
                    CAST(block_number AS BIGINT) DESC
            ) AS rn
        FROM
            events
        WHERE
            event_name IN ('OrderListed', 'OrderFulfilled', 'OrderRemoved')
    )
    SELECT
        event_name,
        args,
        block_number,
        transaction_hash
    FROM
        latest_events
    WHERE
        rn = 1
        AND event_name = 'OrderListed';
`);
    console.log(orders.rows);
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
