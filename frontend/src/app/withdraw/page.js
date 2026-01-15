"use client";

import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import {
  Download,
  Cpu,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  Info,
  FileKey,
  EyeOff,
  ExternalLink,
  Database,
  Lock,
  Zap,
  Sparkles,
  CircleDollarSign,
  ArrowLeft,
  Layers,
  ArrowUpRight,
  FileText,
  Key
} from "lucide-react";

// Configuration
const BACKEND_URL = "http://localhost:4000";
const STEALTH_VAULT_ADDRESS = "0x0EcA16d5136DfEc7bC059Bf2e69dD88828BeCE7F";
const LENDING_ENGINE_ADDRESS = "0x2B54285c432d48F154EE099B5bE380E873315788";

const STEALTH_VAULT_ABI = [
  `function withdraw(
    address token,
    uint256 amount,
    bytes proof,
    bytes32 root1,
    bytes32 root2,
    bytes32 root3,
    bytes32 nullifierHash,
    address withdrawAddress,
    bytes32[] publicInputs
  ) external`,
  "function isKnownRoot(bytes32) view returns (bool)",
  "function s_nullifierHashes(bytes32) view returns (bool)",
];

const LENDING_ENGINE_ABI = [
  "function isKnownRoot(bytes32) view returns (bool)",
  "function isKnownRootLoanTree(bytes32) view returns (bool)",
  "function getLoanDetails(bytes32 nullifierHash_) external view returns (tuple(uint256 borrowAmount,uint256 tokenId,uint256 minimumCollateralUsed,uint256 startTime,uint256 userBorrowIndex,bool isLiquidated,bool repaid))",
];

const ASSETS = {
  WETH: {
    symbol: "WETH",
    name: "Wrapped ETH",
    address: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
  },
};

export default function WithdrawPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [selectedCommitment, setSelectedCommitment] = useState(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofData, setProofData] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [withdrawablePositions, setWithdrawablePositions] = useState([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
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

    const container = document.getElementById('withdraw-container');
    if (container) observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  // Fetch repaid loans from blockchain
  useEffect(() => {
    const fetchRepaidLoans = async () => {
      try {
        setIsLoadingPositions(true);

        // Get all deposits from localStorage
        const deposits = JSON.parse(localStorage.getItem("zkDeposits") || "[]");

        if (deposits.length === 0) {
          setWithdrawablePositions([]);
          setIsLoadingPositions(false);
          return;
        }

        if (!window.ethereum) {
          setWithdrawablePositions([]);
          setIsLoadingPositions(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        const engine = new ethers.Contract(
          LENDING_ENGINE_ADDRESS,
          LENDING_ENGINE_ABI,
          provider
        );

        const vault = new ethers.Contract(
          STEALTH_VAULT_ADDRESS,
          STEALTH_VAULT_ABI,
          provider
        );

        // Check each deposit for repaid loans
        const repaidLoans = [];

        for (const deposit of deposits) {
          try {
            const loan = await engine.getLoanDetails(
              ethers.toBeHex(BigInt(deposit.nullifier_hash), 32)
            );

            console.log("loan struct:", loan);

            const isLiquidated = loan[5];
            const isRepaid = loan[6];

            const alreadyWithdrawn = await vault.s_nullifierHashes(
              ethers.toBeHex(BigInt(deposit.nullifier_hash), 32)
            );

            if (isRepaid && !isLiquidated && !alreadyWithdrawn) {
              repaidLoans.push({
                id: deposit.commitment,
                commitment: deposit.commitment,
                commitmentShort: deposit.commitment.slice(0, 10) + "...",
                asset: deposit.asset,
                amount: deposit.amount,
                formattedAmount: ethers.formatUnits(deposit.amount, 18),
                value: `${(parseFloat(ethers.formatUnits(deposit.amount, 18)) * 1000).toFixed(2)}`,
                deposited: new Date(deposit.createdAt || Date.now()).toLocaleDateString(),
                fullDeposit: deposit,
                loanData: {
                  borrowAmount: loan[0],
                  tokenId: loan[1],
                  minimumCollateralUsed: loan[2],
                  startTime: loan[3],
                  userBorrowIndex: loan[4],
                },
              });
            }
          } catch (err) {
            console.error("Error checking repayment:", err);
          }
        }

        setWithdrawablePositions(repaidLoans);
      } catch (error) {
        console.error("Error fetching repaid loans:", error);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    if (isConnected) {
      fetchRepaidLoans();
    }
  }, [isConnected]);

  // ✅ Function to remove deposit from localStorage (from first version)
  function removeDepositFromLocalStorage(commitment) {
    const deposits = JSON.parse(localStorage.getItem("zkDeposits") || "[]");
    const updated = deposits.filter((d) => d.commitment !== commitment);
    localStorage.setItem("zkDeposits", JSON.stringify(updated));
  }

  // ✅ Generate Withdrawal Proof with updated parameters
  const handleGenerateProof = async () => {
    if (!selectedCommitment) {
      alert("Please select a commitment to withdraw");
      return;
    }

    try {
      setIsGeneratingProof(true);
      setActiveStep(2);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const deposit = selectedCommitment.fullDeposit;

      // ✅ Using the correct parameter names from first version
      const response = await fetch(`${BACKEND_URL}/generate-repayment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 🔑 Using the exact parameter names from first version
          nullifier_deposit: deposit.nullifier,
          secret_deposit: deposit.secret,
          withdrawAmount: deposit.amount,
          recipient: await signer.getAddress(),
          tokenId: deposit.tokenId || 0,
          collateralAmount: deposit.amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Proof generation failed");
      }

      const { proof, publicInputs } = await response.json();

      // Rehydrate proof bytes
      const proofBytes = Uint8Array.from(Object.values(proof));

      console.log("Withdrawal proof generated");
      console.log("Proof bytes length:", proofBytes.length);
      console.log("Public inputs:", publicInputs);

      setProofData({ proofBytes, publicInputs });
      setIsGeneratingProof(false);
      setActiveStep(3);
    } catch (error) {
      console.error("Proof generation error:", error);
      alert(`Proof generation failed: ${error.message}`);
      setIsGeneratingProof(false);
      setActiveStep(1);
    }
  };

  // ✅ Submit Withdrawal Transaction with localStorage cleanup
  const handleSubmitWithdrawal = async () => {
    if (!proofData) {
      alert("Please generate proof first");
      return;
    }

    try {
      setIsSubmitting(true);

      if (!window.ethereum) throw new Error("Wallet not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const vault = new ethers.Contract(
        STEALTH_VAULT_ADDRESS,
        STEALTH_VAULT_ABI,
        signer
      );

      const deposit = selectedCommitment.fullDeposit;
      const asset = ASSETS[deposit.asset];

      // Verify roots are known before submitting
      const engine = new ethers.Contract(
        LENDING_ENGINE_ADDRESS,
        LENDING_ENGINE_ABI,
        provider
      );

      const root1Known = await vault.isKnownRoot(proofData.publicInputs[0]);
      const root2Known = await engine.isKnownRootLoanTree(
        proofData.publicInputs[1]
      );
      const root3Known = await engine.isKnownRoot(proofData.publicInputs[2]);

      if (!root1Known || !root2Known || !root3Known) {
        throw new Error(
          "One or more merkle roots are not recognized by the contracts"
        );
      }

      // Check if already withdrawn
      const alreadyWithdrawn = await vault.s_nullifierHashes(
              ethers.toBeHex(BigInt(deposit.nullifier_hash), 32)
            );
      if (alreadyWithdrawn) {
        throw new Error("This commitment has already been withdrawn");
      }

      // Submit withdrawal transaction
      const tx = await vault.withdraw(
        asset.address,
        deposit.amount,
        proofData.proofBytes,
        proofData.publicInputs[2], // root1 (repayment merkle tree)
        proofData.publicInputs[0], // root2 (deposit merkle tree)
        proofData.publicInputs[1], // root3 (loan merkle tree)
        deposit.nullifier_hash, // nullifierHash
        await signer.getAddress(),
        proofData.publicInputs,
        { gasLimit: 2_500_0000n }
      );

      console.log("Withdrawal transaction submitted:", tx.hash);
      await tx.wait();

      // ✅ Remove deposit from localStorage after successful withdrawal
      removeDepositFromLocalStorage(selectedCommitment.fullDeposit.commitment);

      // Update UI state
      setWithdrawablePositions((prev) =>
        prev.filter((pos) => pos.id !== selectedCommitment.id)
      );

      alert(
        `✅ Withdrawal successful!\n\nCollateral: ${selectedCommitment.formattedAmount} ${selectedCommitment.asset}\nValue: ${selectedCommitment.value}\n\nYour funds have been released to your wallet.`
      );

      // Reset state
      setSelectedCommitment(null);
      setProofData(null);
      setActiveStep(1);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= ENHANCED UI =================
  return (
    <div 
      id="withdraw-container"
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
                  PRIVATE WITHDRAWAL
                </span>
                <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  Reclaim Hidden
                </span>
                <span className="block mt-4 bg-gradient-to-r from-[#B86C1B] via-[#D8933B] to-[#F5B85C] bg-clip-text text-transparent">
                  Collateral
                </span>
              </h1>

              <div className="h-px max-w-3xl mx-auto mb-8"
                style={{ 
                  background: 'linear-gradient(90deg, transparent, #B86C1B, #D8933B, transparent)',
                  height: '2px'
                }} 
              />

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Generate zero-knowledge proofs to withdraw your collateral{' '}
                <span className="font-semibold text-white">while maintaining complete anonymity</span>
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

              {[
                { number: 1, label: "Select Commitment", icon: Database },
                { number: 2, label: "Generate ZK Proof", icon: Cpu },
                { number: 3, label: "Withdraw", icon: Download },
              ].map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = activeStep > stepNumber;
                const isActive = activeStep === stepNumber;
                const Icon = step.icon;

                return (
                  <div key={step.number} className="flex flex-col items-center relative z-10">
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
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </motion.div>
                    <span className={`text-sm font-medium mt-3 text-center ${
                      isCompleted || isActive ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Commitment Selection & Proof */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Withdrawable Positions Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #5C0C0B, #7A2214)' }}
                  >
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Withdrawable Collateral</h2>
                    <p className="text-gray-400 text-sm">Select a repaid loan commitment to withdraw collateral</p>
                  </div>
                </div>

                {isLoadingPositions ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="w-12 h-12 text-[#B86C1B] animate-spin mb-4" />
                    <p className="text-gray-400">Checking repaid loans...</p>
                  </div>
                ) : withdrawablePositions.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 rounded-xl border-2 border-dashed border-white/10 text-center"
                  >
                    <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Withdrawable Collateral</h3>
                    <p className="text-gray-400 mb-4">
                      All collateral has been withdrawn or no loans have been fully repaid yet.
                    </p>
                    <Link 
                      href="/repay"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #7A2214, #B86C1B)' }}
                    >
                      Repay a Loan First
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {withdrawablePositions.map((position, index) => (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          setSelectedCommitment(position);
                          setProofData(null);
                          setActiveStep(1);
                        }}
                        className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedCommitment?.id === position.id
                            ? 'border-[#B86C1B] bg-gradient-to-r from-[#B86C1B]/10 to-transparent'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              selectedCommitment?.id === position.id
                                ? 'bg-gradient-to-br from-[#B86C1B] to-[#D8933B]'
                                : 'bg-gradient-to-br from-black/60 to-black/30 border border-white/10'
                            }`}>
                              <CircleDollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white">{position.asset} Collateral</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{ 
                                    background: '#B86C1B20',
                                    color: '#D8933B',
                                    border: '1px solid #B86C1B40'
                                  }}
                                >
                                  Repaid
                                </span>
                                <span className="text-sm text-gray-400">
                                  Deposited: {position.deposited}
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedCommitment?.id === position.id && (
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
                              <CircleDollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Amount</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                              {position.formattedAmount} {position.asset}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <FileKey className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Commitment</span>
                            </div>
                            <div className="text-sm text-gray-300 font-mono truncate">
                              {position.commitmentShort}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Loan Fully Repaid</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            <span>Private Withdrawal</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Proof Generation Card */}
              {selectedCommitment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #964A16, #B86C1B)' }}
                    >
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Zero-Knowledge Proof</h2>
                      <p className="text-gray-400 text-sm">Generate cryptographic proof for withdrawal</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* What the proof verifies */}
                    <div className="p-6 rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #5C0C0B20, #7A221420)',
                        border: '1px solid #5C0C0B40'
                      }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        What this proof verifies:
                      </h3>
                      <div className="space-y-3">
                        {[
                          "You own a valid deposit commitment in the Merkle tree",
                          "The loan associated with your commitment has been fully repaid",
                          "You have not already withdrawn this collateral",
                          "All operations remain unlinkable and private"
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#B86C1B] mt-2" />
                            <span className="text-gray-300 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Proof Status & Action */}
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white mb-1">Proof Status</h4>
                          <p className="text-gray-400 text-sm">
                            {proofData
                              ? "Proof generated and ready to submit"
                              : isGeneratingProof
                              ? "Generating ZK proof via backend..."
                              : "Proof required to withdraw collateral"
                            }
                          </p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleGenerateProof}
                          disabled={isGeneratingProof || proofData !== null}
                          className="group relative px-8 py-3 rounded-xl font-semibold text-white transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            background: 'linear-gradient(135deg, #5C0C0B, #7A2214)',
                            boxShadow: '0 10px 30px rgba(92, 12, 11, 0.3)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <div className="relative flex items-center justify-center gap-3">
                            {proofData ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Proof Ready</span>
                              </>
                            ) : isGeneratingProof ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Generating...</span>
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
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right Column - Actions & Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {/* Withdrawal Summary Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #B86C1B, #D8933B)' }}
                  >
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Withdrawal Summary</h2>
                    <p className="text-gray-400 text-sm">Review and execute withdrawal</p>
                  </div>
                </div>

                {selectedCommitment ? (
                  <div className="space-y-6">
                    {/* Selected Commitment Details */}
                    <div className="p-6 rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #5C0C0B20, #7A221420)',
                        border: '1px solid #5C0C0B40'
                      }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-4">Selected Collateral</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Asset</span>
                          <span className="text-white font-medium">{selectedCommitment.asset}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Amount</span>
                          <span className="text-white font-medium">
                            {selectedCommitment.formattedAmount} {selectedCommitment.asset}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Value</span>
                          <span className="text-white font-medium">
                            ${selectedCommitment.value}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Deposited</span>
                          <span className="text-white font-medium">
                            {selectedCommitment.deposited}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Withdraw Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitWithdrawal}
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
                            <Download className="w-5 h-5" />
                            <span>{proofData ? "Withdraw Collateral" : "Generate Proof First"}</span>
                          </>
                        )}
                      </div>
                    </motion.button>

                    {/* Status Indicator */}
                    {proofData && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium text-green-400">Proof Ready</span>
                        </div>
                        <p className="text-xs text-gray-300">
                          Zero-knowledge proof has been generated and is ready for submission.
                        </p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Selection</h3>
                    <p className="text-gray-400 text-sm">
                      Select a commitment to view withdrawal details
                    </p>
                  </div>
                )}
              </div>

              {/* Privacy Guarantee Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #964A16, #B86C1B)' }}
                  >
                    <EyeOff className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Privacy Guarantees</h2>
                    <p className="text-gray-400 text-sm">Your anonymity is preserved</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Layers, text: "Withdrawal cannot be linked to original deposit" },
                    { icon: FileText, text: "No one can trace your collateral movement" },
                    { icon: Key, text: "Complete unlinkability between all operations" },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(184, 108, 27, 0.2)' }}
                        >
                          <Icon className="w-4 h-4 text-[#B86C1B]" />
                        </div>
                        <span className="text-sm text-gray-300">{item.text}</span>
                      </div>
                    );
                  })}
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
              <span className="text-sm">After withdrawal, all operations remain completely unlinkable</span>
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
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
