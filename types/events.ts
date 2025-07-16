export interface EIP712DomainChanged {
    eventName: 'EIP712DomainChanged';
    args: null;
    blockNumber: bigint;
    transactionHash: string;
}

export interface OrderFulfilled {
    eventName: 'OrderFulfilled';
    args: {
        orderId: string;
        buyer: string;
    };
    blockNumber: bigint;
    transactionHash: string;
}

export interface OrderListed {
    eventName: 'OrderListed';
    args: {
        orderId: string;
        seller: string;
        nftContract: string;
        tokenId: bigint;
        price: bigint;
    };
    blockNumber: bigint;
    transactionHash: string;
}

export interface OrderRemoved {
    eventName: 'OrderRemoved';
    args: {
        orderId: string;
    };
    blockNumber: bigint;
    transactionHash: string;
}

export interface OwnershipTransferred {
    eventName: 'OwnershipTransferred';
    args: {
        previousOwner: string;
        newOwner: string;
    };
    blockNumber: bigint;
    transactionHash: string;
}

export interface Paused {
    eventName: 'Paused';
    args: {
        account: string;
    };
    blockNumber: bigint;
    transactionHash: string;
}

export interface Unpaused {
    eventName: 'Unpaused';
    args: {
        account: string;
    };
    blockNumber: bigint;
    transactionHash: string;
}

export type MiniMartEvents =
    | EIP712DomainChanged
    | OrderFulfilled
    | OrderListed
    | OrderRemoved
    | OwnershipTransferred
    | Paused
    | Unpaused;
