// src/utils/dummyData.ts

export const dummyDeposits = [
    {
        id: '1',
        amount: 100,
        chain: 'Ethereum',
        status: 'Shielded',
        timestamp: '2025-11-18 04:00',
    },
    {
        id: '2',
        amount: 50,
        chain: 'Solana',
        status: 'Completed',
        timestamp: '2025-11-17 16:30',
    },
    {
        id: '3',
        amount: 75,
        chain: 'NEAR',
        status: 'Pending',
        timestamp: '2025-11-18 02:15',
    },
];

export const dummyTransfers = [
    {
        id: '1',
        amount: 100,
        fromChain: 'Ethereum',
        toChain: 'Solana',
        recipient: 'abc123xyz...',
        status: 'Pending',
    },
    {
        id: '2',
        amount: 50,
        fromChain: 'Solana',
        toChain: 'NEAR',
        recipient: 'xyz789abc...',
        status: 'Completed',
    },
    {
        id: '3',
        amount: 25,
        fromChain: 'NEAR',
        toChain: 'Mina',
        recipient: 'mina456...',
        status: 'Pending',
    },
];

export const dummyClaims = [
    {
        id: '1',
        amount: 100,
        fromChain: 'Ethereum',
        toChain: 'Solana',
        recipient: 'abc123xyz...',
        status: 'Pending',
    },
    {
        id: '2',
        amount: 25,
        fromChain: 'NEAR',
        toChain: 'Mina',
        recipient: 'mina456...',
        status: 'Pending',
    },
];