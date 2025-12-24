// src/components/ChainSelector.tsx
import React from 'react';

interface ChainSelectorProps {
    value: string;
    onChange: (value: string) => void;
    chains: string[];
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ value, onChange, chains }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        >
            {chains.map((chain) => (
                <option key={chain} value={chain}>
                    {chain}
                </option>
            ))}
        </select>
    );
};

export default ChainSelector;