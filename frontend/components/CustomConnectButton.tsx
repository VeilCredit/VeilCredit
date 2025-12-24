"use client";

import { useState, useRef, useEffect } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useConnection, useDisconnect } from "wagmi";

export default function CustomConnectButton() {
    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useConnection();
    const { disconnect } = useDisconnect();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isConnected) {
        return (
            <button
                onClick={() => openConnectModal?.()}
                className="px-6 py-2 border border-gray-700 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
                Connect
            </button>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Connected Button */}
            <button
                onClick={() => setOpen(!open)}
                className="px-6 py-2 border border-gray-700 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div className="absolute right-0 mt-2 w-40 bg-[#111] border border-gray-700 rounded-lg shadow-lg p-2">
                    <button
                        onClick={() => {
                            disconnect();
                            setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded-md"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}