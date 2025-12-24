// src/components/TransactionList.tsx
import React from 'react';
import Card from './Card';

interface Transaction {
    id: string;
    amount: number;
    fromChain?: string;
    toChain?: string;
    recipient?: string;
    chain?: string;
    status: string;
    timestamp?: string;
}

interface TransactionListProps {
    transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    return (
        <div className="space-y-2">
            {transactions.map((tx) => (
                <Card key={tx.id} className="flex justify-between">
                    <div>
                        {tx.amount} {tx.chain ? 'ZEC' : ''} {tx.fromChain ? `from ${tx.fromChain}` : ''}{' '}
                        {tx.toChain ? `→ ${tx.toChain}` : ''} {tx.recipient ? `to ${tx.recipient}` : ''}
                    </div>
                    <div>{tx.status}</div>
                </Card>
            ))}
        </div>
    );
};

export default TransactionList;