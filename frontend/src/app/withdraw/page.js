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
} from "lucide-react";

// Configuration
const BACKEND_URL = "http://localhost:4000";
const STEALTH_VAULT_ADDRESS = "0x9A676e781A523b5d0C0e43731313A708CB607508";
const LENDING_ENGINE_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";

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

const WETH_TOKEN_ID = 0;

const ASSETS = {
  WETH: {
    symbol: "WETH",
    name: "Wrapped ETH",
    address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
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
                commitment: deposit.commitment.slice(0, 10) + "...",
                asset: deposit.asset,
                amount: ethers.formatUnits(deposit.amount, 18),
                value: `${(
                  parseFloat(ethers.formatUnits(deposit.amount, 18)) * 1000
                ).toFixed(2)}`,
                deposited: new Date(deposit.createdAt).toLocaleDateString(),

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

  function removeDepositFromLocalStorage(commitment) {
    const deposits = JSON.parse(localStorage.getItem("zkDeposits") || "[]");

    const updated = deposits.filter((d) => d.commitment !== commitment);

    localStorage.setItem("zkDeposits", JSON.stringify(updated));
  }

  // Generate Withdrawal Proof
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
      const collateralAmount = BigInt(deposit.amount);

      // Call backend to generate withdrawal proof
      const response = await fetch(`${BACKEND_URL}/generate-repayment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 🔑 MUST MATCH BACKEND NAMES EXACTLY
          nullifier_deposit: deposit.nullifier,
          secret_deposit: deposit.secret,

          withdrawAmount: collateralAmount.toString(), // or partial withdraw later

          recipient: await signer.getAddress(),
          tokenId: WETH_TOKEN_ID,
          collateralAmount: collateralAmount.toString(),
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

  // Submit Withdrawal Transaction
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
        proofData.publicInputs[3]
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
        proofData.publicInputs[3], // nullifierHash
        await signer.getAddress(),
        proofData.publicInputs,
        { gasLimit: 2_500_0000n }
      );

      console.log("Withdrawal transaction submitted:", tx.hash);
      await tx.wait();

      removeDepositFromLocalStorage(selectedCommitment.fullDeposit.commitment);

      // Update UI state
      setWithdrawablePositions((prev) =>
        prev.filter((pos) => pos.id !== selectedCommitment.id)
      );

      setSelectedCommitment(null);
      setProofData(null);
      setActiveStep(1);

      alert(
        `✅ Withdrawal successful!\n\nCollateral: ${selectedCommitment.amount} ${selectedCommitment.asset}\nValue: ${selectedCommitment.value}\n\nYour funds have been released to your wallet.`
      );

      // Remove from withdrawable positions
      setWithdrawablePositions((prev) =>
        prev.filter((pos) => pos.id !== selectedCommitment.id)
      );

      // Reset state
      setSelectedCommitment(null);
      setProofData(null);
      setActiveStep(1);

      // Optionally redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0605] to-[#1A0F0B]" />
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#B86C1B] to-transparent"
            style={{
              top: `${30 + i * 25}%`,
              left: "0",
              right: "0",
              opacity: 0.1 + i * 0.03,
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 25 + i * 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <main className="container mx-auto px-5 md:px-7 py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Dashboard
              </Link>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Private{" "}
              <span className="bg-gradient-to-r from-[#B86C1B] to-[#D8933B] bg-clip-text text-transparent">
                Withdrawal
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Generate a zero-knowledge proof to withdraw your collateral after
              loan repayment.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-12"
          >
            {[
              {
                number: 1,
                label: "Select Commitment",
                active: activeStep >= 1,
              },
              { number: 2, label: "Generate Proof", active: activeStep >= 2 },
              { number: 3, label: "Withdraw", active: activeStep >= 3 },
            ].map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center"
              >
                <div
                  className={`flex flex-col items-center ${
                    idx > 0 ? "ml-16" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-3
                    ${
                      step.active
                        ? "bg-gradient-to-br from-[#5C0C0B] to-[#B86C1B] text-white"
                        : "bg-white/5 text-gray-500"
                    }`}
                  >
                    {step.active ? "✓" : step.number}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step.active ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      step.active
                        ? "bg-gradient-to-r from-[#B86C1B] to-[#D8933B]"
                        : "bg-white/10"
                    }`}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Available Commitments */}
            <div className="lg:col-span-2 space-y-8">
              {/* Withdrawable Positions Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Withdrawable Collateral
                    </h2>
                    <p className="text-gray-400">
                      Select a commitment to withdraw
                    </p>
                  </div>
                  <Download className="w-8 h-8 text-[#B86C1B]" />
                </div>

                {isLoadingPositions ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      Loading Repaid Loans...
                    </h3>
                    <p className="text-gray-500">
                      Querying blockchain for repayment status
                    </p>
                  </div>
                ) : withdrawablePositions.length > 0 ? (
                  <div className="space-y-6">
                    {withdrawablePositions.map((position, idx) => (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => {
                          setSelectedCommitment(position);
                          setProofData(null);
                          setActiveStep(1);
                        }}
                        className={`p-6 rounded-xl border cursor-pointer transition-all ${
                          selectedCommitment?.id === position.id
                            ? "border-[#B86C1B] bg-gradient-to-r from-[#5C0C0B]/30 to-[#7A2214]/30"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`p-3 rounded-xl bg-gradient-to-br ${position.gradient}/20`}
                            >
                              <Download className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-bold text-white">
                                  {position.asset} Deposit
                                </h3>
                                <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                  Ready to Withdraw
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
                                <div>
                                  <p className="text-gray-400 text-sm">
                                    Amount
                                  </p>
                                  <p className="text-2xl font-bold text-white">
                                    {position.amount}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm">Value</p>
                                  <p className="text-2xl font-bold text-white">
                                    {position.value}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm">
                                    Repaid Loan
                                  </p>
                                  <p className="text-lg font-semibold text-white">
                                    {position.repaidLoanId}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <FileKey className="w-4 h-4 text-gray-400" />
                                  <span className="font-mono text-gray-300">
                                    {position.commitment}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-400">
                                    Deposited: {position.deposited}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400">
                                    Repaid: {position.repaymentTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center ml-4">
                            {selectedCommitment?.id === position.id ? (
                              <div className="p-2 rounded-full bg-[#B86C1B]">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                              </div>
                            ) : (
                              <div className="p-2 rounded-full border border-white/20">
                                <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                              </div>
                            )}
                            <span className="text-xs text-gray-400 mt-2">
                              {selectedCommitment?.id === position.id
                                ? "Selected"
                                : "Select"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      No Withdrawable Collateral
                    </h3>
                    <p className="text-gray-500 mb-6">
                      All collateral has been withdrawn or no loans have been
                      repaid yet.
                    </p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 text-[#B86C1B] hover:text-[#D8933B] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Return to Dashboard
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Proof Generation Card */}
              {selectedCommitment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Withdrawal Proof
                      </h2>
                      <p className="text-gray-400">
                        Generate zero-knowledge proof
                      </p>
                    </div>
                    <Cpu className="w-8 h-8 text-[#B86C1B]" />
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-[#5C0C0B]/20 to-[#7A2214]/20">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <EyeOff className="w-5 h-5" />
                        What this proof verifies:
                      </h3>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>
                            You own a valid deposit commitment in the Merkle
                            tree
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>
                            The loan associated with your commitment has been
                            fully repaid
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>
                            You have not already withdrawn this collateral
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          Proof Status
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {proofData
                            ? "Proof generated and ready to submit"
                            : isGeneratingProof
                            ? "Generating withdrawal proof via backend..."
                            : "Proof required to withdraw collateral"}
                        </p>
                      </div>

                      <button
                        onClick={handleGenerateProof}
                        disabled={isGeneratingProof || proofData !== null}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-3
                          ${
                            proofData
                              ? "bg-green-500/20 text-green-400 cursor-default"
                              : isGeneratingProof
                              ? "bg-[#B86C1B]/50 text-white cursor-wait"
                              : "bg-gradient-to-r from-[#5C0C0B] to-[#B86C1B] hover:opacity-90 text-white"
                          }`}
                      >
                        {proofData ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Proof Ready
                          </>
                        ) : isGeneratingProof ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Cpu className="w-5 h-5" />
                            Generate Proof
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column: Summary & Action */}
            <div className="space-y-8">
              {/* Withdrawal Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-8">
                  Withdrawal Summary
                </h2>

                {selectedCommitment ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-[#5C0C0B]/20 to-[#7A2214]/20">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-white mb-2">
                          {selectedCommitment.amount} {selectedCommitment.asset}
                        </div>
                        <div className="text-gray-400">
                          Collateral to Withdraw
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Asset</span>
                          <span className="text-white">
                            {selectedCommitment.asset}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Value</span>
                          <span className="text-white">
                            {selectedCommitment.value}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Repaid Loan</span>
                          <span className="text-white">
                            {selectedCommitment.repaidLoanId}
                          </span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="flex justify-between">
                          <span className="text-gray-400">Commitment Hash</span>
                          <span className="text-white font-mono text-sm">
                            {selectedCommitment.commitment}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <button
                        onClick={handleSubmitWithdrawal}
                        disabled={!proofData || isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
                          ${
                            !proofData
                              ? "bg-white/10 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#5C0C0B] via-[#7A2214] to-[#B86C1B] hover:shadow-lg hover:shadow-[#B86C1B]/30 text-white"
                          }`}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            {proofData
                              ? "Withdraw Collateral"
                              : "Generate Proof First"}
                          </>
                        )}
                      </button>

                      <p className="text-gray-400 text-sm text-center mt-4">
                        Requires zero-knowledge proof for privacy
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      No Selection
                    </h3>
                    <p className="text-gray-500">
                      Select a commitment to view withdrawal details
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Privacy Guarantee Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <EyeOff className="w-5 h-5 text-[#B86C1B]" />
                  <h3 className="font-semibold text-white">
                    Privacy Guarantee
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5 flex-shrink-0" />
                    Withdrawal cannot be linked to original deposit
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5 flex-shrink-0" />
                    No one can trace your collateral movement
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5 flex-shrink-0" />
                    Complete unlinkability between actions
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
