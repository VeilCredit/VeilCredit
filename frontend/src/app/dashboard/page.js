"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
} from "lucide-react";

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

          console.log(loan)

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
        { gasLimit: 2_500_0000 }
      );

      await tx.wait();
      alert("✅ Solvency verified on-chain");
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0A0605] to-[#1A0F0B] text-white px-6 py-20">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#B86C1B]" />
          <h1 className="text-3xl font-bold">Solvency Proof</h1>
        </div>

        {/* Loans */}
        <div className="p-6 rounded-xl border border-white/10 bg-black/40">
          <h2 className="text-xl font-semibold mb-4">Active Loans</h2>

          {loadingLoans ? (
            <div className="flex items-center gap-2 text-gray-400">
              <RefreshCw className="animate-spin" />
              Loading loans...
            </div>
          ) : loans.length === 0 ? (
            <div className="flex items-center gap-2 text-gray-400">
              <AlertCircle />
              No active loans
            </div>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => {
                    setSelectedLoan(loan);
                    setProofData(null);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer ${
                    selectedLoan?.id === loan.id
                      ? "border-[#B86C1B] bg-[#B86C1B]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{loan.asset}</span>
                    <span className="text-sm text-gray-400">{loan.id}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Borrowed: {(Number(loan.borrowAmount) / 1e18).toFixed(2)} USDC
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {selectedLoan && (
          <div className="space-y-4">
            <button
              onClick={generateProof}
              disabled={isGenerating || proofData}
              className="w-full py-3 rounded-lg bg-[#5C0C0B] hover:bg-[#7A2214] disabled:opacity-50"
            >
              {isGenerating ? "Generating Proof..." : "Generate Proof"}
            </button>

            {proofData && (
              <button
                onClick={submitProof}
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-[#B86C1B] hover:opacity-90 text-black font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Proof On-Chain"}
              </button>
            )}

            {proofData && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 />
                Proof ready
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}