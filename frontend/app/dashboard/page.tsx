// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useConnection } from 'wagmi';

type SnackbarType = 'success' | 'error' | 'info';

export default function DashboardPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [zusdBalance, setZusdBalance] = useState(0);
    const [vaultBalance, setVaultBalance] = useState<{ [key: string]: number }>({});
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

    const { address } = useConnection();
    const userAddress = address;

    const transactions = [
        { id: 1, type: 'Deposit', amount: '0.5 ETH', status: 'Completed', date: '2024-01-15' },
        { id: 2, type: 'Transfer', amount: '0.2 ETH', status: 'Completed', date: '2024-01-14' },
        { id: 3, type: 'Withdrawal', amount: '0.1 ETH', status: 'Pending', date: '2024-01-13' },
    ];

    // Mock prices for calculations
    const prices: { [key: string]: number } = {
        ETH: 2000,
        USDC: 1,
        USDT: 1,
        DAI: 1,
    };

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

    // Fetch ZUSD Balance
    useEffect(() => {
        if (!userAddress) return;

        const fetchZUSDBalance = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/zusdx/balance/${userAddress}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const data = await response.json();

                if (response.ok) {
                    setZusdBalance(data.zusdxBalance || 0);
                } else {
                    console.error("Error fetching ZUSD balance:", data.error);
                    showSnackbar(data.error || "Failed to fetch ZUSD balance", "error");
                }
            } catch (err) {
                console.error("Backend connection failed:", err);
                showSnackbar("Failed to connect to backend", "error");
            }
        };

        fetchZUSDBalance();
    }, [userAddress]);

    // Fetch Vault Balance
    useEffect(() => {
        if (!userAddress) return;

        const fetchVaultBalance = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:4000/api/vaults/balance/${userAddress}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const data = await response.json();

                if (response.ok) {
                    // Convert array format to object format
                    // Backend returns: { balances: [{ asset: "ETH", balance: 100 }] }
                    // We need: { ETH: 100, USDC: 50 }
                    const balanceObj: { [key: string]: number } = {};
                    data.balances.forEach((item: { asset: string; balance: number }) => {
                        balanceObj[item.asset] = item.balance;
                    });
                    setVaultBalance(balanceObj);
                } else {
                    console.error("Error fetching vault balance:", data.error);
                    showSnackbar(data.error || "Failed to fetch vault balance", "error");
                }
            } catch (err) {
                console.error("Backend connection failed:", err);
                showSnackbar("Failed to connect to backend", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVaultBalance();
    }, [userAddress]);

    // Calculate total vault value in USD
    const calculateTotalVaultValue = () => {
        let total = 0;
        Object.keys(vaultBalance).forEach(token => {
            const balance = vaultBalance[token] || 0;
            const price = prices[token] || 0;
            total += balance * price;
        });
        return total.toFixed(2);
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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mb-8"></div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                            Dashboard
                        </h1>
                        <p className="text-xl text-gray-400">
                            Monitor your shielded assets and transaction history
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {/* Total Balance Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-semibold">Total Minted ZUSD</h3>
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">
                                {isLoading ? (
                                    <span className="animate-pulse">Loading...</span>
                                ) : (
                                    `$${zusdBalance.toFixed(2)}`
                                )}
                            </div>
                            <div className="text-sm text-green-400 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                +0.0% (24h)
                            </div>
                        </div>

                        {/* Total Deposits */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-semibold">Total Vault Value</h3>
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">
                                {isLoading ? (
                                    <span className="animate-pulse">Loading...</span>
                                ) : (
                                    `$${calculateTotalVaultValue()}`
                                )}
                            </div>
                            <div className="text-sm text-gray-400">
                                {Object.keys(vaultBalance).length} assets
                            </div>
                        </div>

                        {/* Total Transfers */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-semibold">Total Transfers</h3>
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">0</div>
                            <div className="text-sm text-gray-400">0.00 ETH sent</div>
                        </div>

                        {/* Total Withdrawals */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-semibold">Withdrawals</h3>
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">0</div>
                            <div className="text-sm text-gray-400">0.00 ETH claimed</div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Portfolio Breakdown */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-white text-xl font-bold">Shielded Assets</h2>
                                <div className="flex gap-2">
                                    {['24h', '7d', '30d', '1y'].map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setSelectedPeriod(period)}
                                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${selectedPeriod === period
                                                ? 'bg-cyan-400 text-black'
                                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Asset List */}
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-400">Loading assets...</div>
                            ) : (
                                <div className="space-y-3">
                                    {['ETH', 'USDC', 'USDT', 'DAI'].map((token, index) => {
                                        const balance = vaultBalance[token] || 0;
                                        const value = balance * (prices[token] || 0);
                                        return (
                                            <div key={token} className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-cyan-400/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center text-black font-bold">
                                                        {token.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-semibold">{token}</div>
                                                        <div className="text-gray-400 text-sm">{balance.toFixed(6)} {token}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white font-semibold">${value.toFixed(2)}</div>
                                                    <div className={`text-sm ${index % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {index % 2 === 0 ? '+0.0%' : '-0.0%'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <h2 className="text-white text-xl font-bold mb-6">Quick Actions</h2>
                                <div className="space-y-3">
                                    <Link
                                        href="/deposit"
                                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-black font-bold">Deposit</div>
                                            <div className="text-black/70 text-sm">Add funds to shield</div>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/transfer"
                                        className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Transfer</div>
                                            <div className="text-gray-400 text-sm">Send privately</div>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/claim"
                                        className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Withdraw</div>
                                            <div className="text-gray-400 text-sm">Claim your funds</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Privacy Score */}
                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <h2 className="text-white text-xl font-bold mb-4">Privacy Score</h2>
                                <div className="relative pt-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Anonymity Set</span>
                                        <span className="text-cyan-400 font-semibold">100%</span>
                                    </div>
                                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-800">
                                        <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cyan-400 to-emerald-400 w-full"></div>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm mt-4">
                                    Your transactions are completely private and untraceable
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vault Deposits */}
                    <div className="mt-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white text-xl font-bold">Vault Deposits</h2>
                            <div className="flex gap-2">
                                {['24h', '7d', '30d', '1y'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${selectedPeriod === period
                                            ? 'bg-cyan-400 text-black'
                                            : 'bg-gray-800 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Asset List */}
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-400">Loading vault deposits...</div>
                        ) : (
                            <div className="space-y-4">
                                {['ETH', 'USDC', 'USDT', 'ZEC'].map((token, index) => {
                                    const balance = vaultBalance[token] || 0;
                                    const value = balance * (prices[token] || 0);
                                    return (
                                        <div key={token} className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-cyan-400/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center text-black font-bold">
                                                    {token.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-white font-semibold">{token}</div>
                                                    <div className="text-gray-400 text-sm">{balance.toFixed(6)} {token}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-semibold">${value.toFixed(2)}</div>
                                                <div className={`text-sm ${index % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {index % 2 === 0 ? '+0.0%' : '-0.0%'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-white text-xl font-bold mb-6">Recent Transactions</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left text-gray-400 font-semibold py-3 px-4">Type</th>
                                        <th className="text-left text-gray-400 font-semibold py-3 px-4">Amount</th>
                                        <th className="text-left text-gray-400 font-semibold py-3 px-4">Status</th>
                                        <th className="text-left text-gray-400 font-semibold py-3 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <span className="text-white font-semibold">{tx.type}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-white">{tx.amount}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tx.status === 'Completed'
                                                    ? 'bg-green-400/20 text-green-400'
                                                    : 'bg-yellow-400/20 text-yellow-400'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-gray-400">{tx.date}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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