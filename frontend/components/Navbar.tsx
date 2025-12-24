// components/Navbar.tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import CustomConnectButton from './CustomConnectButton';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg"></div>
                        <span className="text-white text-2xl font-bold">ZBridgeX</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                            Why ZBridgeX?
                        </Link>
                        <Link href="/deposit" className="text-gray-300 hover:text-white transition-colors">
                            Deposit
                        </Link>
                       
                        <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                    </div>

                    {/* Duplicate Template Button */}
                    <button className="hidden md:block px-6 py-2  text-white rounded-lg hover:bg-gray-900 transition-colors">
                        <CustomConnectButton />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;