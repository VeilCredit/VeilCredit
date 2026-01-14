"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import {
  Cpu,
  Upload,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  EyeOff,
  Shield,
  Key,
  DollarSign,
  Lock,
  ArrowLeft,
  Zap,
  Sparkles,
  FileText,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

// ---------------- CONFIG ----------------
const BACKEND_URL = "http://localhost:4000";
const LENDING_ENGINE_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
const WETH_TOKEN_ID = 0;
const MINIMUM_COLLATERIZATION_RATIO = "132";

const LENDING_ENGINE_ABI = [
  "function getCurrentEpoch() view returns (uint256)",
  "function getCurrentSnapShot() view returns (tuple(bytes32 commitment,uint256 updatedAt,uint64 roundId,uint256 price))",
  `function borrowLoan(
      bytes proof,
      bytes32 root1,
      bytes32 nullifierHash,
      uint256 borrowAmount,
      uint256 assetPrice,
      uint256 tokenId,
      address recipient,
      bytes32[] publicInputs,
      bytes32 commitment
  ) external`,
];

// ---------------- COMPONENT ----------------
export default function BorrowPage() {
  const router = useRouter();

  const [loanAmount, setLoanAmount] = useState("1");
  const [deposit, setDeposit] = useState(null);
  const [proofData, setProofData] = useState(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
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

    const container = document.getElementById('borrow-container');
    if (container) observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // ---------------- LOAD DEPOSIT ----------------
  useEffect(() => {
    const deposits = JSON.parse(localStorage.getItem("zkDeposits") || "[]");
    if (!deposits.length) {
      router.push("/deposit");
      return;
    }
    setDeposit(deposits[deposits.length - 1]);
  }, [router]);

  // ---------------- GENERATE BORROW PROOF ----------------
  const handleGenerateProof = async () => {
    if (!deposit) return;

    try {
      setIsGeneratingProof(true);
      setActiveStep(2);

      if (!window.ethereum) throw new Error("Wallet not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const engine = new ethers.Contract(
        LENDING_ENGINE_ADDRESS,
        LENDING_ENGINE_ABI,
        provider
      );

      // 🔑 ON-CHAIN SOURCE OF TRUTH
      const currentEpoch = await engine.getCurrentEpoch();
      const snapshot = await engine.getCurrentSnapShot();

      const borrowAmount = ethers.parseEther(loanAmount);
      const collateralAmount = BigInt(deposit.amount);

      const res = await fetch(`${BACKEND_URL}/generate-borrow-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nullifier: deposit.nullifier,
          secret: deposit.secret,

          borrowAmount: borrowAmount.toString(),
          collateralAmount: collateralAmount.toString(),

          assetPrice: snapshot.price.toString(),
          tokenId: WETH_TOKEN_ID,
          recipient: await signer.getAddress(),

          minCollateralRatio: MINIMUM_COLLATERIZATION_RATIO,
          actualCollateralRatio: "150",

          epochCommitment: snapshot.commitment,
          epoch: currentEpoch.toString(),
          roundId: snapshot.roundId.toString(),
          price: snapshot.price.toString(),

          leaves: [deposit.commitment],
        }),
      });

      if (!res.ok) throw new Error("Backend proof generation failed");

      const { proof, publicInputs } = await res.json();

      // 🔑 CRITICAL FIX: rehydrate proof bytes
      const proofBytes = Uint8Array.from(Object.values(proof));

      console.log("proof is Uint8Array:", proofBytes instanceof Uint8Array);
      console.log("proof length:", proofBytes.length);
      console.log("publicInputs:", publicInputs);

      setProofData({ proofBytes, publicInputs });
      setActiveStep(3);
    } catch (err) {
      console.error(err);
      alert("Proof generation failed");
    } finally {
      setIsGeneratingProof(false);
    }
  };

  // ---------------- SUBMIT BORROW TX ----------------
  const handleSubmitLoan = async () => {
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

      const tx = await engine.borrowLoan(
        proofData.proofBytes,          // ✅ REAL BYTES
        proofData.publicInputs[0],     // root1
        proofData.publicInputs[1],     // nullifierHash
        ethers.parseEther(loanAmount),
        proofData.publicInputs[2],     // assetPrice
        WETH_TOKEN_ID,
        await signer.getAddress(),
        proofData.publicInputs,
        deposit.loanCommitment,
        { gasLimit: 2_500_0000n }
      );

      await tx.wait();

      // Notify backend about loan confirmation
      const res = await fetch(`${BACKEND_URL}/loan-confirmed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitment: deposit.loanCommitment
        })
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Loan request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- ENHANCED UI ----------------
  return (
    <div 
      id="borrow-container"
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
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/50 border border-white/10 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#964A16]" />
                <span className="text-sm font-medium text-white tracking-wider">
                  PRIVATE LOAN REQUEST
                </span>
                <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  Anonymous Borrowing
                </span>
                <span className="block mt-4 bg-gradient-to-r from-[#B86C1B] via-[#D8933B] to-[#F5B85C] bg-clip-text text-transparent">
                  Against Hidden Collateral
                </span>
              </h1>

              <div className="h-px max-w-3xl mx-auto mb-8"
                style={{ 
                  background: 'linear-gradient(90deg, transparent, #B86C1B, #D8933B, transparent)',
                  height: '2px'
                }} 
              />

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Borrow funds while keeping your{' '}
                <span className="font-semibold text-white">collateral amount and identity completely private</span>
              </p>
            </div>
          </motion.div>

          {/* Progress Steps */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center relative">
              {/* Connecting line */}
              <div className="absolute top-6 left-12 right-12 h-1 bg-white/10 rounded-full" />
              <div 
                className="absolute top-6 left-12 h-1 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(activeStep - 1) * 50}%`,
                  background: 'linear-gradient(90deg, #5C0C0B, #7A2214, #B86C1B)'
                }}
              />

              {["Configure Loan", "Generate ZK Proof", "Submit Request"].map((label, index) => {
                const stepNumber = index + 1;
                const isCompleted = activeStep > stepNumber;
                const isActive = activeStep === stepNumber;

                return (
                  <div key={label} className="flex flex-col items-center relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                        isCompleted || isActive 
                          ? 'border-[#B86C1B]' 
                          : 'border-white/20'
                      }`}
                      style={{
                        background: isCompleted 
                          ? 'linear-gradient(135deg, #B86C1B, #D8933B)'
                          : isActive
                            ? 'linear-gradient(135deg, #7A2214, #964A16)'
                            : 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <span className={`text-lg font-bold ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}>
                          {stepNumber}
                        </span>
                      )}
                    </motion.div>
                    <span className={`text-sm font-medium mt-3 ${
                      isCompleted || isActive ? 'text-white' : 'text-gray-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Loan Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #5C0C0B, #7A2214)' }}
                  >
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Loan Configuration</h2>
                    <p className="text-gray-400 text-sm">Set your loan amount based on hidden collateral</p>
                  </div>
                </div>

                {/* Loan Input */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white text-lg font-medium">Loan Amount (ETH)</label>
                      <span className="text-sm text-gray-400">Max: Based on hidden collateral</span>
                    </div>
                    
                    <div className="relative group">
                      <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        className="w-full p-5 rounded-2xl bg-black/40 border-2 border-white/10 focus:border-[#B86C1B] focus:outline-none text-white text-xl font-medium transition-all duration-300 group-hover:border-white/20"
                        placeholder="0.00"
                        step="0.1"
                        min="0"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                          style={{ 
                            background: 'linear-gradient(135deg, #5C0C0B, #7A2214)',
                            color: 'white'
                          }}
                        >
                          <span className="font-medium">ETH</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount Presets */}
                    <div className="grid grid-cols-3 gap-3">
                      {["0.5", "1", "2", "3", "5", "10"].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setLoanAmount(amount)}
                          className={`py-3 rounded-xl text-center transition-all ${
                            loanAmount === amount
                              ? 'bg-gradient-to-r from-[#B86C1B] to-[#D8933B] text-white font-semibold'
                              : 'bg-black/40 border border-white/10 text-gray-300 hover:border-white/20'
                          }`}
                        >
                          {amount} ETH
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Collateral Info */}
                  {deposit && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #5C0C0B20, #7A221420)',
                        border: '1px solid #5C0C0B40'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-5 h-5 text-[#B86C1B]" />
                        <h3 className="text-lg font-semibold text-white">Hidden Collateral</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Available Collateral</span>
                          <span className="text-white font-medium">
                            {Number(deposit.amount).toFixed(4)} ETH
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Maximum Loan Ratio</span>
                          <span className="text-white font-medium">132%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Your Ratio</span>
                          <span className="text-green-400 font-medium">150%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Proof & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {/* Proof Generation Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #964A16, #B86C1B)' }}
                  >
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Zero-Knowledge Proof</h2>
                    <p className="text-gray-400 text-sm">Generate cryptographic proof</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">
                  Generates a ZK proof that verifies your hidden collateral is sufficient 
                  for the requested loan amount, without revealing the actual amounts.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateProof}
                  disabled={isGeneratingProof || proofData !== null}
                  className="group relative w-full py-4 rounded-xl font-semibold text-white transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: 'linear-gradient(135deg, #5C0C0B, #7A2214)',
                    boxShadow: '0 10px 30px rgba(92, 12, 11, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="relative flex items-center justify-center gap-3">
                    {isGeneratingProof ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Generating ZK Proof...</span>
                      </>
                    ) : proofData ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Proof Ready</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Generate Proof</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Submit Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #B86C1B, #D8933B)' }}
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Submit Loan Request</h2>
                    <p className="text-gray-400 text-sm">Finalize anonymous borrowing</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitLoan}
                  disabled={!proofData || isSubmitting}
                  className="group relative w-full py-4 rounded-xl font-bold text-white transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Submit Loan Request</span>
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Warning Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#B86C1B] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Periodic Solvency Proofs Required</h4>
                      <p className="text-xs text-gray-400">
                        You must periodically submit solvency proofs to verify loan health 
                        and avoid liquidation.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Privacy Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {[
              {
                icon: EyeOff,
                title: 'Hidden Collateral',
                description: 'Collateral amount remains completely hidden',
                color: '#5C0C0B'
              },
              {
                icon: Shield,
                title: 'Private Identity',
                description: 'Your identity and positions remain anonymous',
                color: '#7A2214'
              },
              {
                icon: Key,
                title: 'ZK Guaranteed',
                description: 'Zero-knowledge proofs ensure privacy',
                color: '#964A16'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-gradient-to-b from-black/40 to-black/20 border border-white/10 group hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ background: `${feature.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.description}</p>
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
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 text-gray-400 mb-4">
              <EyeOff className="w-4 h-4 text-[#B86C1B]" />
              <span className="text-sm">All operations remain unlinkable on-chain</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <a 
                href="/dashboard"
                className="group px-8 py-3 rounded-lg font-medium border transition-colors border-white/20 hover:border-white/40 text-white hover:bg-white/5"
              >
                <span className="flex items-center justify-center gap-2">
                  Back to Dashboard
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </a>
              <a 
                href="/deposit"
                className="group px-8 py-3 rounded-lg font-medium text-white transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #7A2214, #B86C1B)',
                  boxShadow: '0 10px 30px rgba(122, 34, 20, 0.3)'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Make Another Deposit
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
