"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Shield,
  Lock,
  Cpu,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { ethers } from "ethers";

/* ==================== CONFIG ==================== */

// Backend ZK service
const ZK_BACKEND_URL = "http://localhost:4000/generate-commitment";

// Vault contract
const STEALTH_VAULT_ADDRESS = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";

// Supported assets
const ASSETS = {
  WETH: {
    symbol: "WETH",
    name: "Wrapped ETH",
    tokenId: 0,
    address: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
    apy: "3.2%",
  },
};

// ERC20 ABI
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
];

// Vault ABI
const STEALTH_VAULT_ABI = [
  "function deposit(address token, uint256 amount, bytes32 commitment) external",
  "function s_commitments(bytes32) view returns (bool)",
];

const STEPS = [
  "Input Details",
  "Generate Commitment",
  "Store Secrets",
  "Submit Transaction",
  "Complete",
];

/* ==================== COMPONENT ==================== */

export default function DepositPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("WETH");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

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
      setStep(2);

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

      setStep(3);

      // Decode ONLY what the contract needs
      const abi = ethers.AbiCoder.defaultAbiCoder();
      const [commitment,loanCommitment,repayCommitment] = abi.decode(
        ["bytes32", "bytes32", "bytes32","bytes32","bytes32"],
        payload
      );

      /* ---------- 2. Store secrets locally (CANONICAL ONLY) ---------- */
      storeSecretsLocally({
        commitment: zkParams.commitment,          // decimal string
        loanCommitment: loanCommitment,
        repayCommitment:repayCommitment,
        nullifier: zkParams.nullifier,            // decimal string
        secret: zkParams.secret,                  // decimal string
        nullifier_hash: zkParams.nullifier_hash,  // decimal string
        asset: asset.symbol,
        amount: zkParams.amount,
        tokenId: zkParams.tokenId,
      });

      setStep(4);

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

      setStep(5);
      alert("✅ Private deposit successful");
      router.push("/dashboard");
    } catch (err) {
      console.error("Deposit error:", err);
      alert(err.message || "Deposit failed");
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  /* ==================== UI ==================== */

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/dashboard"
          className="text-gray-400 flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold mb-8">
          Private <span className="text-amber-400">Deposit</span>
        </h1>

        {/* Stepper */}
        <div className="mb-10 flex justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  step > i + 1
                    ? "bg-green-500"
                    : step === i + 1
                    ? "bg-amber-600"
                    : "bg-gray-700"
                }`}
              >
                {step > i + 1 ? <CheckCircle size={18} /> : i + 1}
              </div>
              <span className="text-xs mt-2 text-gray-400">{s}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-black/40 p-8 rounded-xl border border-white/10">
            <label className="block mb-4 text-gray-400">Asset</label>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.values(ASSETS).map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => setSelectedAsset(a.symbol)}
                  className={`p-4 rounded-xl border ${
                    selectedAsset === a.symbol
                      ? "border-amber-500"
                      : "border-white/10"
                  }`}
                >
                  <div className="font-bold">{a.symbol}</div>
                  <div className="text-xs text-gray-400">{a.apy} APY</div>
                </button>
              ))}
            </div>

            <input
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="Amount"
              className="w-full p-4 bg-transparent border border-white/10 rounded-xl mb-6 text-xl"
            />

            <button
              disabled={!amount || isLoading}
              onClick={handleDeposit}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl font-semibold"
            >
              <Download className="inline mr-2" />
              Start Private Deposit
            </button>
          </div>
        )}

        {step > 1 && (
          <div className="flex flex-col items-center py-20">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mb-6"
            >
              {step === 2 && <Cpu size={48} />}
              {step === 3 && <Shield size={48} />}
              {step === 4 && <Lock size={48} />}
              {step === 5 && <CheckCircle size={48} />}
            </motion.div>

            <p className="text-gray-400">{STEPS[step - 1]}</p>
          </div>
        )}
      </div>
    </div>
  );
}