// src/components/WalletConnect.tsx
import React from 'react';
import Button from './Button';

interface WalletConnectProps {
    connected: boolean;
    onConnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ connected, onConnect }) => {
    return (
        <div className="flex items-center space-x-4">
            <span>{connected ? 'Wallet Connected' : 'Wallet Not Connected'}</span>
            {!connected && <Button onClick={onConnect}>Connect Wallet</Button>}
        </div>
    );
};

export default WalletConnect;