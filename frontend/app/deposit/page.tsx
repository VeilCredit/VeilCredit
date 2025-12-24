// app/deposit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

type SnackbarType = 'success' | 'error' | 'info';

export default function DepositPage() {
    const [amount, setAmount] = useState('');
    const [token, setToken] = useState('ETH');
    const [isLoading, setIsLoading] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{
        message: string;
        type: SnackbarType;
        show: boolean;
    }>({
        message: '',
        type: 'info',
        show: false
    });

    // Auto-dismiss snackbar after 3 seconds
    useEffect(() => {
        if (snackbar.show) {
            const timer = setTimeout(() => {
                setSnackbar(prev => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.show]);

    const showSnackbar = (message: string, type: SnackbarType) => {
        setSnackbar({ message, type, show: true });
    };

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            showSnackbar('Please enter a valid amount', 'error');
            return;
        }

        setIsLoading(true);
        // Simulate deposit processing
        setTimeout(() => {
            setIsLoading(false);
            showSnackbar(`Successfully deposited ${amount} ${token}`, 'success');
            setAmount('');
        }, 1500);
    };

    const getSnackbarStyles = () => {
        const baseStyles = "fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl transition-all duration-300 ease-in-out flex items-center gap-3 min-w-[300px] max-w-md z-50";

        if (!snackbar.show) {
            return `${baseStyles} opacity-0 translate-y-4 pointer-events-none`;
        }

        const typeStyles = {
            success: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
            error: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
            info: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
        };

        return `${baseStyles} ${typeStyles[snackbar.type]} opacity-100 translate-y-0`;
    };

    const getSnackbarIcon = () => {
        switch (snackbar.type) {
            case 'success':
                return (
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <main className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-24 px-6 pb-12">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-8"></div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                            Deposit Tokens
                        </h1>
                        <p className="text-xl text-gray-400">
                            Deposit your tokens safely
                        </p>
                    </div>

                    {/* Deposit Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 shadow-xl">
                        <form onSubmit={handleDeposit}>

                            {/* Token Selection */}
                            <div className="mb-6">
                                <label className="block text-gray-400 text-sm font-semibold mb-3">
                                    Select Token
                                </label>
                                <select
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                                >
                                    <option value="ETH">ETH</option>
                                    <option value="BTC">BTC</option>
                                    <option value="USDC">USDC</option>
                                    <option value="USDT">USDT</option>
                                    <option value="DAI">DAI</option>
                                </select>
                            </div>

                            {/* Amount Input */}
                            <div className="mb-6">
                                <label className="block text-gray-400 text-sm font-semibold mb-3">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-cyan-400 transition-colors"
                                    required
                                />
                            </div>

                            {/* Deposit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !amount}
                                className="w-full py-4 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold text-lg rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    "Deposit"
                                )}
                            </button>

                        </form>
                    </div>
                </div>
            </div>

            {/* Snackbar Notification */}
            <div className={getSnackbarStyles()}>
                {getSnackbarIcon()}
                <span className="font-semibold text-sm">{snackbar.message}</span>
            </div>
        </main>
    );
}