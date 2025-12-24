// app/about/page.tsx
import Navbar from '@/components/Navbar';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-24 px-6 pb-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-8"></div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            About Our Protocol
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
                            Building the future of private, secure, and trustless cross-chain transactions using zero-knowledge proofs
                        </p>
                    </div>

                    {/* Mission Statement */}
                    <div className="mb-16 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 md:p-12 shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
                        <p className="text-gray-300 text-lg leading-relaxed mb-4">
                            We believe that financial privacy is a fundamental right. Our zero-knowledge proof-based bridge enables users to transfer assets across blockchains while maintaining complete anonymity and security.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            By leveraging cutting-edge cryptographic techniques, we're creating a trustless infrastructure where users maintain full control of their assets without compromising on privacy.
                        </p>
                    </div>

                    {/* How It Works */}
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">How It Works</h2>
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 shadow-xl">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-black font-bold text-2xl">1</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-xl font-bold mb-3">Shielded Deposits</h3>
                                        <p className="text-gray-400 leading-relaxed">
                                            When you deposit tokens, they're added to a shielded pool using zero-knowledge commitments. Your deposit is cryptographically sealed, making it impossible to trace the origin of funds once they enter the pool.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 shadow-xl">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-black font-bold text-2xl">2</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-xl font-bold mb-3">Private Transfers</h3>
                                        <p className="text-gray-400 leading-relaxed">
                                            Transfer funds within the shielded pool without revealing sender, recipient, or amount information. Each transaction generates a zero-knowledge proof that validates the transfer without exposing transaction details.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 shadow-xl">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-black font-bold text-2xl">3</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-xl font-bold mb-3">Secure Withdrawals</h3>
                                        <p className="text-gray-400 leading-relaxed">
                                            When ready to withdraw, generate a proof of ownership without revealing which deposit you're claiming. The protocol verifies your proof and releases funds to your specified address, maintaining privacy throughout.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Key Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-lg font-bold mb-2">Zero-Knowledge Proofs</h3>
                                <p className="text-gray-400 text-sm">
                                    Advanced cryptography ensures complete privacy without compromising security or verifiability
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-lg font-bold mb-2">Cross-Chain Bridge</h3>
                                <p className="text-gray-400 text-sm">
                                    Seamlessly transfer assets across different blockchains while maintaining privacy
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-lg font-bold mb-2">Non-Custodial</h3>
                                <p className="text-gray-400 text-sm">
                                    You maintain complete control of your assets at all times through smart contracts
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-lg font-bold mb-2">Optimized Fees</h3>
                                <p className="text-gray-400 text-sm">
                                    Efficient proof generation and verification keeps transaction costs minimal
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-lg font-bold mb-2">Decentralized</h3>
                                <p className="text-gray-400 text-sm">
                                    No central authority or trusted third parties required for operation
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-xl">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-lg font-bold mb-2">Open Source</h3>
                                <p className="text-gray-400 text-sm">
                                    Fully auditable smart contracts and transparent protocol design
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Technology Stack */}
                    <div className="mb-16 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 md:p-12 shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">Technology Stack</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                            {['zk-SNARKs', 'Solidity', 'Circom', 'IPFS', 'Merkle Trees', 'EVM', 'Web3', 'TypeScript'].map((tech) => (
                                <div key={tech} className="bg-black/50 rounded-lg p-4 border border-gray-800 text-center">
                                    <span className="text-cyan-400 font-semibold">{tech}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="mb-16 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 border border-cyan-400/20 rounded-2xl p-8 md:p-12">
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-4">Security First</h2>
                                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                                    Our protocol has been audited by leading security firms and uses battle-tested cryptographic primitives. We maintain a bug bounty program and work with the security research community to ensure the highest standards of safety.
                                </p>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    All smart contracts are open source and have undergone extensive testing on testnets before mainnet deployment.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Join thousands of users who trust our protocol for private transactions
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/deposit"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold text-lg rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all"
                            >
                                Start Using Protocol
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                            <a
                                href="https://docs.example.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-lg hover:bg-gray-700 transition-all"
                            >
                                Read Documentation
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}