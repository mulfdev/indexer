interface EventBase {
    blockNumber: bigint;
    transactionHash: string;
}

export interface EIP712DomainChanged extends EventBase {
    eventName: 'EIP712DomainChanged';
    args: null;
}

export interface OrderFulfilled extends EventBase {
    eventName: 'OrderFulfilled';
    args: {
        orderId: string;
        buyer: string;
    };
}

export interface OrderListed extends EventBase {
    eventName: 'OrderListed';
    args: {
        orderId: string;
        seller: string;
        nftContract: string;
        tokenId: bigint;
        price: bigint;
    };
}

export interface OrderRemoved extends EventBase {
    eventName: 'OrderRemoved';
    args: {
        orderId: string;
    };
}

export interface OwnershipTransferred extends EventBase {
    eventName: 'OwnershipTransferred';
    args: {
        previousOwner: string;
        newOwner: string;
    };
}

export interface Paused extends EventBase {
    eventName: 'Paused';
    args: {
        account: string;
    };
}

export interface Unpaused extends EventBase {
    eventName: 'Unpaused';
    args: {
        account: string;
    };
}

export type MiniMartEvents =
    | EIP712DomainChanged
    | OrderFulfilled
    | OrderListed
    | OrderRemoved
    | OwnershipTransferred
    | Paused
    | Unpaused;

