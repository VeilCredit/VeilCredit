"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Shield,
  Lock,
  Cpu,
  CheckCircle,
  EyeOff,
  Database,
  Zap,
  Sparkles,
  FileText,
  Layers,
  Key,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  CircleDollarSign
} from "lucide-react";
import Link from "next/link";
import { ethers } from "ethers";

/* ==================== CONFIG ==================== */
const BACKEND_URL = "http://localhost:4000";
const ZK_BACKEND_URL = "http://localhost:4000/generate-commitment";
const STEALTH_VAULT_ADDRESS = "0x0EcA16d5136DfEc7bC059Bf2e69dD88828BeCE7F";

const ASSETS = {
  WETH: {
    symbol: "WETH",
    name: "Wrapped ETH",
    tokenId: 0,
    address: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
    apy: "3.2%",
    color: "#B86C1B"
  },
};

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
];

const STEALTH_VAULT_ABI = [
  "function deposit(address token, uint256 amount, bytes32 commitment) external",
  "function s_commitments(bytes32) view returns (bool)",
];

/* ==================== COMPONENT ==================== */
export default function DepositPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("WETH");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const STEPS = [
    {
      id: 1,
      title: "Input Details",
      icon: Database,
      description: "Select asset and enter amount"
    },
    {
      id: 2,
      title: "Generate Commitment",
      icon: Cpu,
      description: "Create zero-knowledge commitment"
    },
    {
      id: 3,
      title: "Store Secrets",
      icon: Shield,
      description: "Securely store private data locally"
    },
    {
      id: 4,
      title: "Submit Transaction",
      icon: Lock,
      description: "Send to blockchain"
    },
    {
      id: 5,
      title: "Complete",
      icon: CheckCircle,
      description: "Deposit successful"
    },
  ];

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

    const container = document.getElementById('deposit-container');
    if (container) observer.observe(container);

    return () => observer.disconnect();
  }, []);

  /* ==================== HELPERS ==================== */
  async function fetchCommitment(amount, tokenId) {
    const res = await fetch(ZK_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, tokenId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "ZK backend error");
    }

    return res.json(); // { payload, zkParams }
  }

  function storeSecretsLocally(data) {
    const existing = JSON.parse(localStorage.getItem("zkDeposits") || "[]");
    existing.push({ ...data, createdAt: Date.now() });
    localStorage.setItem("zkDeposits", JSON.stringify(existing));
  }

  /* ==================== MAIN FLOW ==================== */
  const handleDeposit = async () => {
    try {
      if (!window.ethereum) throw new Error("Wallet not found");

      setIsLoading(true);
      setCurrentStepIndex(1);

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const asset = ASSETS[selectedAsset];
      const token = new ethers.Contract(asset.address, ERC20_ABI, signer);

      const decimals = await token.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      /* ---------- 1. Generate commitment OFF-CHAIN ---------- */
      const { payload, zkParams } = await fetchCommitment(
        parsedAmount.toString(),
        asset.tokenId
      );

      setCurrentStepIndex(2);

      // Decode ONLY what the contract needs
      const abi = ethers.AbiCoder.defaultAbiCoder();
      const [commitment, loanCommitment, repayCommitment] = abi.decode(
        ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
        payload
      );

      /* ---------- 2. Store secrets locally (CANONICAL ONLY) ---------- */
      storeSecretsLocally({
        commitment: zkParams.commitment,
        loanCommitment: loanCommitment,
        repayCommitment: repayCommitment,
        nullifier: zkParams.nullifier,
        secret: zkParams.secret,
        nullifier_hash: zkParams.nullifier_hash,
        asset: asset.symbol,
        amount: zkParams.amount,
        tokenId: zkParams.tokenId,
      });

      setCurrentStepIndex(3);

      /* ---------- 3. On-chain deposit ---------- */
      const vault = new ethers.Contract(
        STEALTH_VAULT_ADDRESS,
        STEALTH_VAULT_ABI,
        signer
      );

      const userAddress = await signer.getAddress();
      const balance = await token.balanceOf(userAddress);

      if (balance < parsedAmount) {
        throw new Error("Insufficient token balance");
      }

      const exists = await vault.s_commitments(commitment);
      if (exists) {
        throw new Error("Commitment already exists");
      }

      const approveTx = await token.approve(
        STEALTH_VAULT_ADDRESS,
        parsedAmount
      );
      await approveTx.wait();

      const depositTx = await vault.deposit(
        asset.address,
        parsedAmount,
        commitment,
        {
          gasLimit: 2_500_0000n,
        }
      );

      await depositTx.wait();

      // ✅ Notify backend about deposit confirmation
      const res = await fetch(`${BACKEND_URL}/deposit-confirmed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitment: commitment
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error("Failed to insert commitment");

      setCurrentStepIndex(4);

      // Wait a moment before redirecting
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Deposit error:", err);
      alert(err.message || "Deposit failed");
      setCurrentStepIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  /* ==================== ENHANCED UI ==================== */
  return (
    <div 
      id="deposit-container"
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
        <div className="max-w-5xl mx-auto">
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
                  PRIVATE COLLATERAL DEPOSIT
                </span>
                <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  Zero-Knowledge
                </span>
                <span className="block mt-4 bg-gradient-to-r from-[#B86C1B] via-[#D8933B] to-[#F5B85C] bg-clip-text text-transparent">
                  Collateral Deposit
                </span>
              </h1>

              <div className="h-px max-w-3xl mx-auto mb-8"
                style={{ 
                  background: 'linear-gradient(90deg, transparent, #B86C1B, #D8933B, transparent)',
                  height: '2px'
                }} 
              />

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Deposit collateral while keeping{' '}
                <span className="font-semibold text-white">amounts and ownership completely hidden</span>{' '}
                using zero-knowledge cryptography
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
                  width: `${currentStepIndex * 25}%`,
                  background: 'linear-gradient(90deg, #5C0C0B, #7A2214, #B86C1B)'
                }}
              />

              {STEPS.map((stepItem, index) => {
                const isCompleted = currentStepIndex > index;
                const isActive = currentStepIndex === index;
                const Icon = stepItem.icon;

                return (
                  <div key={stepItem.id} className="flex flex-col items-center relative z-10">
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
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </motion.div>
                    <span className={`text-sm font-medium mt-3 text-center ${
                      isCompleted || isActive ? 'text-white' : 'text-gray-500'
                    }`}>
                      {stepItem.title}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      {stepItem.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Asset Selection & Amount */}
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
                    <CircleDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Deposit Details</h2>
                    <p className="text-gray-400 text-sm">Select asset and enter amount</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {currentStepIndex === 0 && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      {/* Asset Selection */}
                      <div className="space-y-4">
                        <label className="text-white text-lg font-medium">Select Asset</label>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.values(ASSETS).map((asset) => (
                            <motion.button
                              key={asset.symbol}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedAsset(asset.symbol)}
                              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                selectedAsset === asset.symbol
                                  ? 'border-[#B86C1B] bg-gradient-to-r from-[#B86C1B]/10 to-transparent'
                                  : 'border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                  style={{ background: 'rgba(184, 108, 27, 0.2)' }}
                                >
                                  <DollarSign className="w-5 h-5 text-[#B86C1B]" />
                                </div>
                                <div className="text-left">
                                  <div className="text-xl font-semibold text-white">{asset.symbol}</div>
                                  <div className="text-sm text-gray-400">{asset.name}</div>
                                </div>
                                <div className="ml-auto">
                                  <div className="px-3 py-1 rounded-full text-xs font-medium"
                                    style={{ 
                                      background: '#B86C1B20',
                                      color: '#D8933B',
                                      border: '1px solid #B86C1B40'
                                    }}
                                  >
                                    {asset.apy} APY
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-white text-lg font-medium">Amount</label>
                        </div>
                        
                        <div className="relative group">
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
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
                              <span className="font-medium">{ASSETS[selectedAsset]?.symbol}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount Presets */}
                        <div className="grid grid-cols-3 gap-3">
                          {["0.1", "0.5", "1", "2", "5", "10"].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => setAmount(preset)}
                              className={`py-3 rounded-xl text-center transition-all ${
                                amount === preset
                                  ? 'bg-gradient-to-r from-[#B86C1B] to-[#D8933B] text-white font-semibold'
                                  : 'bg-black/40 border border-white/10 text-gray-300 hover:border-white/20'
                              }`}
                            >
                              {preset} {ASSETS[selectedAsset]?.symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Processing Steps */}
                  {currentStepIndex > 0 && currentStepIndex < 4 && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                      {STEPS.slice(1, 4).map((stepItem, index) => {
                        const isProcessing = currentStepIndex === index + 1;
                        const isCompleted = currentStepIndex > index + 1;
                        const Icon = stepItem.icon;

                        return (
                          <div
                            key={stepItem.id}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                              isProcessing
                                ? 'border-[#B86C1B] bg-gradient-to-r from-[#B86C1B]/10 to-transparent'
                                : isCompleted
                                ? 'border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent'
                                : 'border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                  : isProcessing
                                  ? 'bg-gradient-to-r from-[#B86C1B] to-[#D8933B] animate-pulse'
                                  : 'bg-black/40 border border-white/10'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-6 h-6 text-white" />
                                ) : (
                                  <Icon className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">{stepItem.title}</h3>
                                <p className="text-gray-400 text-sm">{stepItem.description}</p>
                              </div>
                              {isProcessing && (
                                <RefreshCw className="w-5 h-5 text-[#B86C1B] animate-spin" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Success State */}
                  {currentStepIndex === 4 && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30">
                        <CheckCircle className="w-12 h-12 text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Deposit Successful!</h3>
                      <p className="text-gray-300 max-w-md mx-auto">
                        ✅ Your collateral has been deposited privately. 
                        ✅ Backend has been notified about your commitment.
                      </p>
                      <div className="mt-8 p-4 rounded-xl bg-black/40 border border-white/10 max-w-md mx-auto">
                        <div className="flex items-center gap-2 mb-2">
                          <EyeOff className="w-4 h-4 text-[#B86C1B]" />
                          <span className="text-sm text-gray-400">Your deposit amount is hidden</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#B86C1B]" />
                          <span className="text-sm text-gray-400">Backend notification sent successfully</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right Column - Actions & Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {/* Action Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #964A16, #B86C1B)' }}
                  >
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Deposit Action</h2>
                    <p className="text-gray-400 text-sm">Initiate private deposit</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">
                  Deposit your collateral to create a private commitment that hides 
                  the actual amount and ownership on-chain using zero-knowledge proofs.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeposit}
                  disabled={isLoading || !amount}
                  className="group relative w-full py-4 rounded-xl font-semibold text-white transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: 'linear-gradient(135deg, #5C0C0B, #7A2214)',
                    boxShadow: '0 10px 30px rgba(92, 12, 11, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Start Private Deposit</span>
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Wallet Warning */}
                <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#B86C1B] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Wallet Required</h4>
                      <p className="text-xs text-gray-400">
                        Make sure you have MetaMask installed and are connected to the correct network.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Backend Notification */}
                <div className="mt-4 p-4 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">Backend will be notified after successful deposit</span>
                  </div>
                </div>
              </div>

              {/* Privacy Info Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #B86C1B, #D8933B)' }}
                  >
                    <EyeOff className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Privacy Guarantees</h2>
                    <p className="text-gray-400 text-sm">What stays hidden</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Shield, text: "Collateral amount remains private" },
                    { icon: Key, text: "Your identity is anonymous" },
                    { icon: FileText, text: "Transaction unlinkable from identity" },
                    { icon: Layers, text: "No on-chain balance disclosure" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(184, 108, 27, 0.2)' }}
                      >
                        <item.icon className="w-4 h-4 text-[#B86C1B]" />
                      </div>
                      <span className="text-sm text-gray-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 text-gray-400 mb-4">
              <Sparkles className="w-4 h-4 text-[#B86C1B]" />
              <span className="text-sm">After deposit, you can request a private loan against your hidden collateral</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link 
                href="/dashboard"
                className="group px-8 py-3 rounded-lg font-medium border transition-colors border-white/20 hover:border-white/40 text-white hover:bg-white/5"
              >
                <span className="flex items-center justify-center gap-2">
                  Back to Dashboard
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </Link>
              <Link 
                href="/borrow"
                className="group px-8 py-3 rounded-lg font-medium text-white transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #7A2214, #B86C1B)',
                  boxShadow: '0 10px 30px rgba(122, 34, 20, 0.3)'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Request Private Loan
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
