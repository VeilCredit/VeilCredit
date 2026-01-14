'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  Lock,
  Key,
  BarChart,
  ArrowRight,
  Sparkles,
  Clock,
  DollarSign,
  EyeOff,
  ShieldCheck,
  Zap,
  Database,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Cpu,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

// ================= CONFIG =================
const BACKEND_URL = "http://localhost:4000";
const LENDING_ENGINE_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";

const LENDING_ENGINE_ABI = [
  "function verifyCollateralHealth(bytes proof, bytes32[] publicInputs) external",
  "function getCurrentEpoch() view returns (uint256)",
  "function getCurrentSnapShot() view returns (tuple(bytes32 commitment,uint256 updatedAt,uint64 roundId,uint256 price))",
  "function getLoanDetails(bytes32 nullifierHash) view returns (tuple(uint256 borrowAmount,uint256 tokenId,uint256 minimumCollateralUsed,uint256 startTime,uint256 userBorrowIndex,bool isLiquidated,bool repaid))",
];

// ================= COMPONENT =================
export default function SolvencyPage() {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [proofData, setProofData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const container = document.getElementById('solvency-container');
    if (container) observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // ================= LOAD ACTIVE LOANS =================
  useEffect(() => {
    async function loadLoans() {
      if (!window.ethereum) return;

      const stored = JSON.parse(
        localStorage.getItem("zkDeposits") || "[]"
      );

      if (!stored.length) {
        setLoans([]);
        setLoadingLoans(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const engine = new ethers.Contract(
        LENDING_ENGINE_ADDRESS,
        LENDING_ENGINE_ABI,
        provider
      );

      const active = [];

      for (let i = 0; i < stored.length; i++) {
        const d = stored[i];

        try {
          const loan = await engine.getLoanDetails(
            ethers.toBeHex(BigInt(d.nullifier_hash), 32)
          );

          const [
            borrowAmount,
            ,
            ,
            startTime,
            ,
            isLiquidated,
            repaid,
          ] = loan;

          if (repaid || isLiquidated) continue;
          if(borrowAmount == 0) continue
          active.push({
            id: `LN-${i + 1}`,
            asset: d.asset || "ETH",
            amount: d.amount,
            borrowAmount: borrowAmount.toString(),
            startTime: Number(startTime),

            // ZK fields
            commitment: d.commitment,
            nullifier: d.nullifier,
            nullifierHash: d.nullifier_hash,
            secret: d.secret,
          });
        } catch (e) {
          console.error("Loan load failed:", e);
        }
      }

      setLoans(active);
      setSelectedLoan(active[0] || null);
      setLoadingLoans(false);
    }

    loadLoans();
  }, []);

  // ================= GENERATE PROOF =================
  const generateProof = async () => {
    if (!selectedLoan) return;

    try {
      setIsGenerating(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const engine = new ethers.Contract(
        LENDING_ENGINE_ADDRESS,
        LENDING_ENGINE_ABI,
        provider
      );

      const epoch = await engine.getCurrentEpoch();
      const snapshot = await engine.getCurrentSnapShot();

      const res = await fetch(
        `${BACKEND_URL}/generate-periodic-proof-of-solvancy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nullifier: selectedLoan.nullifier,
            secret: selectedLoan.secret,
            borrowAmount: selectedLoan.borrowAmount,
            assetPrice: snapshot.price.toString(),
            liquidationThreshold:"80",
            tokenId:0,
            collateralAmount: selectedLoan.amount,
            epochCommitment: snapshot.commitment,
            epoch: epoch.toString(),
            roundId: snapshot.roundId.toString(),
            price: snapshot.price.toString(),
            leaves: [selectedLoan.commitment],
          }),
        }
      );

      if (!res.ok) throw new Error("Proof generation failed");

      const { proof, publicInputs } = await res.json();
      const proofBytes = Uint8Array.from(Object.values(proof));

      setProofData({
        proofBytes,
        publicInputs,
      });
    } catch (e) {
      alert(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ================= SUBMIT PROOF =================
  const submitProof = async () => {
    if (!proofData) return;

    try {
      setIsSubmitting(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const engine = new ethers.Contract(
        LENDING_ENGINE_ADDRESS,
        LENDING_ENGINE_ABI,
        signer
      );

      const tx = await engine.verifyCollateralHealth(
        proofData.proofBytes,
        proofData.publicInputs,
        { gasLimit: 2_500_000 }
      );

      await tx.wait();
      alert("✅ Solvency verified on-chain");
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= ENHANCED UI =================
  return (
    <div 
      id="solvency-container"
      className="relative min-h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A0A0A 0%, #0A0605 50%, #1A0F0B 100%)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#5C0C0B]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#B86C1B]/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/50 border border-white/10 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#964A16]" />
              <span className="text-sm font-medium text-white tracking-wider">
                PERIODIC SOLVENCY CHECK
              </span>
              <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                Zero-Knowledge
              </span>
              <span className="block mt-4 bg-gradient-to-r from-[#B86C1B] via-[#D8933B] to-[#F5B85C] bg-clip-text text-transparent">
                Solvency Proofs
              </span>
            </h1>

            <div className="h-px max-w-3xl mx-auto mb-8"
              style={{ 
                background: 'linear-gradient(90deg, transparent, #B86C1B, #D8933B, transparent)',
                height: '2px'
              }} 
            />

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Prove your loan's health without revealing{' '}
              <span className="font-semibold text-white">collateral amounts or positions</span>
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Loan Selection */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #5C0C0B, #7A2214)' }}
                  >
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Active Loans</h2>
                    <p className="text-gray-400 text-sm">Select a loan to generate solvency proof</p>
                  </div>
                </div>

                {loadingLoans ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="w-12 h-12 text-[#B86C1B] animate-spin mb-4" />
                    <p className="text-gray-400">Loading your private loans...</p>
                  </div>
                ) : loans.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 rounded-xl border-2 border-dashed border-white/10 text-center"
                  >
                    <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Loans</h3>
                    <p className="text-gray-400 mb-6">You don't have any active loans requiring solvency proofs</p>
                    <a 
                      href="/borrow"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #7A2214, #B86C1B)' }}
                    >
                      Create Your First Loan
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan, index) => (
                      <motion.div
                        key={loan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          setSelectedLoan(loan);
                          setProofData(null);
                        }}
                        className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedLoan?.id === loan.id
                            ? 'border-[#B86C1B] bg-gradient-to-r from-[#B86C1B]/10 to-transparent'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              selectedLoan?.id === loan.id
                                ? 'bg-gradient-to-br from-[#B86C1B] to-[#D8933B]'
                                : 'bg-gradient-to-br from-black/60 to-black/30 border border-white/10'
                            }`}>
                              <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white">{loan.asset} Loan</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{ 
                                    background: '#B86C1B20',
                                    color: '#D8933B',
                                    border: '1px solid #B86C1B40'
                                  }}
                                >
                                  {loan.id}
                                </span>
                                <span className="text-sm text-gray-400">
                                  Started {new Date(loan.startTime * 1000).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedLoan?.id === loan.id && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                              style={{ 
                                background: 'linear-gradient(135deg, #5C0C0B, #7A2214)',
                                color: 'white'
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Selected</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Collateral</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                              {Number(loan.amount).toFixed(4)} {loan.asset}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Borrowed</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                              {(Number(loan.borrowAmount) / 1e18).toFixed(2)} USDC
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            <span>Private Position</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>ZK Protected</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Proof Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #964A16, #B86C1B)' }}
                  >
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Proof Generation</h2>
                    <p className="text-gray-400 text-sm">Generate and submit ZK proofs</p>
                  </div>
                </div>

                {selectedLoan ? (
                  <div className="space-y-6">
                    {/* Selected Loan Info */}
                    <div className="p-6 rounded-xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #5C0C0B20, #7A221420)',
                        border: '1px solid #5C0C0B40'
                      }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-4">Selected Loan</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Asset</span>
                          <span className="text-white font-medium">{selectedLoan.asset}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Loan ID</span>
                          <span className="text-white font-medium">{selectedLoan.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Borrow Amount</span>
                          <span className="text-white font-medium">
                            {(Number(selectedLoan.borrowAmount) / 1e18).toFixed(2)} USDC
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Proof Status */}
                    {proofData && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 rounded-xl border-2 border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">Proof Ready</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                          ZK proof has been generated and is ready for on-chain submission.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <FileText className="w-4 h-4" />
                          <span>Proof size: {proofData.proofBytes.length} bytes</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateProof}
                        disabled={isGenerating || proofData}
                        className="group relative w-full py-4 rounded-xl font-semibold text-white transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          background: 'linear-gradient(135deg, #5C0C0B, #7A2214)',
                          boxShadow: '0 10px 30px rgba(92, 12, 11, 0.3)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="relative flex items-center justify-center gap-3">
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              <span>Generating ZK Proof...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              <span>Generate Solvency Proof</span>
                            </>
                          )}
                        </div>
                      </motion.button>

                      {proofData && (
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={submitProof}
                          disabled={isSubmitting}
                          className="group relative w-full py-4 rounded-xl font-semibold text-white transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            background: 'linear-gradient(135deg, #B86C1B, #D8933B)',
                            boxShadow: '0 10px 30px rgba(184, 108, 27, 0.3)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <div className="relative flex items-center justify-center gap-3">
                            {isSubmitting ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Submitting to Blockchain...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5" />
                                <span>Submit Proof On-Chain</span>
                              </>
                            )}
                          </div>
                        </motion.button>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-[#B86C1B]" />
                        <span className="text-sm font-medium text-white">How it works</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5" />
                          <span>Generate ZK proof without revealing collateral amount</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5" />
                          <span>Proof verifies your loan meets solvency requirements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5" />
                          <span>Submit proof to blockchain for verification</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Key className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Select a Loan</h3>
                    <p className="text-gray-400 text-sm">
                      Choose a loan from the list to generate solvency proof
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Stats Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
          >
            {[
              { 
                value: loans.length.toString(), 
                label: 'Active Loans', 
                icon: Layers,
                color: '#5C0C0B'
              },
              { 
                value: selectedLoan ? '1' : '0', 
                label: 'Selected', 
                icon: CheckCircle2,
                color: '#7A2214'
              },
              { 
                value: proofData ? 'Ready' : 'Pending', 
                label: 'Proof Status', 
                icon: FileText,
                color: '#964A16'
              },
              { 
                value: '100%', 
                label: 'Privacy', 
                icon: EyeOff,
                color: '#B86C1B'
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-gradient-to-b from-black/40 to-black/20 border border-white/10 group hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ background: `${stat.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-12 pt-12 border-t border-white/10"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/deposit"
                className="group px-8 py-3 rounded-lg font-medium text-white transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #7A2214, #B86C1B)',
                  boxShadow: '0 10px 30px rgba(122, 34, 20, 0.3)'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Make New Deposit
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </a>
              <a 
                href="/borrow"
                className="group px-8 py-3 rounded-lg font-medium border transition-colors border-white/20 hover:border-white/40 text-white hover:bg-white/5"
              >
                <span className="flex items-center justify-center gap-2">
                  Create New Loan
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
