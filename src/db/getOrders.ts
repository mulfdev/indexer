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
        -- This is the magic:
        -- 1. Group all events by their orderId.
        -- 2. Sort the events within each group from newest to oldest by block number.
        -- 3. Assign a row number, with '1' being the absolute latest event.
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
    -- We only want the single latest event for each order
    rn = 1
    -- And from that set of latest events, we only want the ones that are listings
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
