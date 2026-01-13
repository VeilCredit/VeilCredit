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
} from "lucide-react";

// ---------------- CONFIG ----------------

const BACKEND_URL = "http://localhost:4000";

const LENDING_ENGINE_ADDRESS =
  "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";

const WETH_TOKEN_ID = 0;

// protocol constant
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

  // 🔑 store REAL proof bytes
  const [proofData, setProofData] = useState(null);

  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

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
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Loan request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- UI (UNCHANGED) ----------------

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ChevronRight className="rotate-180 w-4 h-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-4xl font-bold text-white mt-4">
            Request <span className="text-yellow-500">Private Loan</span>
          </h1>
        </div>

        {/* Steps */}
        <div className="flex justify-center gap-16 mb-12">
          {["Loan", "Proof", "Submit"].map((label, i) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center
                ${
                  activeStep > i
                    ? "bg-yellow-500 text-black"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {activeStep > i ? "✓" : i + 1}
              </div>
              <span className="text-sm text-gray-400 mt-2">{label}</span>
            </div>
          ))}
        </div>

        {/* Loan Input */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-8 mb-8">
          <label className="text-white text-lg">Loan Amount (ETH)</label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full mt-3 bg-black border border-white/10 p-3 rounded-lg text-white"
          />
        </div>

        {/* Proof Section */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-xl text-white flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Zero-Knowledge Proof
          </h2>

          <p className="text-gray-400 mt-3">
            Proves your deposit commitment exists and your loan is solvent.
          </p>

          <button
            onClick={handleGenerateProof}
            disabled={isGeneratingProof || proofData !== null}
            className="mt-6 px-6 py-3 rounded-lg bg-yellow-500 text-black font-semibold flex items-center gap-2"
          >
            {isGeneratingProof ? (
              <>
                <RefreshCw className="animate-spin w-4 h-4" />
                Generating…
              </>
            ) : proofData ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Proof Ready
              </>
            ) : (
              "Generate Proof"
            )}
          </button>
        </div>

        {/* Submit */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-8">
          <button
            onClick={handleSubmitLoan}
            disabled={!proofData || isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold rounded-lg flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="animate-spin w-5 h-5" />
                Submitting…
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Submit Loan Request
              </>
            )}
          </button>

          <div className="flex items-start gap-2 text-sm text-gray-400 mt-4">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            You must periodically submit solvency proofs to avoid liquidation.
          </div>
        </div>

        {/* Privacy */}
        <div className="mt-10 text-gray-400 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-yellow-500" />
          Collateral, amount, and identity remain private.
        </div>
      </div>
    </div>
  );
}