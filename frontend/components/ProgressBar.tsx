// src/components/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
    progress: number; // 0-100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <div className="w-full bg-gray-200 rounded-full h-4">
            <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;