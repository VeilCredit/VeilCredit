'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard, CheckCircle2, Clock,
  RefreshCw, ChevronRight, ArrowRight,
  Info, Shield, DollarSign, Lock,
  ArrowLeft, EyeOff, Zap, Sparkles,
  FileText, Database, AlertCircle,
  CircleDollarSign, Receipt, Layers,
  ArrowUpRight
} from 'lucide-react'
import { ethers } from 'ethers'

// ================= CONFIG =================
const BACKEND_URL = "http://localhost:4000"
const LENDING_ENGINE_ADDRESS = '0x2B54285c432d48F154EE099B5bE380E873315788'
const USDT_TOKEN_ADDRESS = '0xd64fE23Ec14a27D9B3B2d77aE4F25E48Fab627b7'

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
]

const LENDING_ENGINE_ABI = [
  "function repayLoan(bytes32 commitment_, uint256 amount_, bytes32 nullifierHash_) external returns (uint32)",
  "function getLoanDetails(bytes32 nullifierHash_) external view returns (tuple(uint256 borrowAmount,uint256 tokenId,uint256 minimumCollateralUsed,uint256 startTime,uint256 userBorrowIndex,bool isLiquidated,bool repaid))"
]

// ================= COMPONENT =================
export default function RepayPage() {
  const router = useRouter()
  const [loans, setLoans] = useState([])
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [repayAmount, setRepayAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [loadingLoans, setLoadingLoans] = useState(true)

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    const container = document.getElementById('repay-container')
    if (container) observer.observe(container)

    return () => observer.disconnect()
  }, [])

  // ---------------- LOAD ACTIVE LOANS ----------------
  useEffect(() => {
    async function loadLoans() {
      if (!window.ethereum) {
        setLoadingLoans(false)
        return
      }

      const stored = JSON.parse(
        localStorage.getItem("zkDeposits") || "[]"
      )

      if (!stored.length) {
        setLoans([])
        setLoadingLoans(false)
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const engine = new ethers.Contract(
        LENDING_ENGINE_ADDRESS,
        LENDING_ENGINE_ABI,
        provider
      )

      const active = []

      for (let i = 0; i < stored.length; i++) {
        const d = stored[i]

        try {
          const loan = await engine.getLoanDetails(
            ethers.toBeHex(BigInt(d.nullifier_hash), 32)
          )

          const [
            borrowAmount,
            tokenId,
            minimumCollateralUsed,
            startTime,
            userBorrowIndex,
            isLiquidated,
            repaid,
          ] = loan

          if (repaid || isLiquidated) continue

          active.push({
            id: `LN-${i + 1}`,
            asset: d.asset || "WETH",
            borrowAmount,
            tokenId,
            minimumCollateralUsed,
            startTime: Number(startTime),
            userBorrowIndex,
            isLiquidated,
            repaid,
            status: repaid ? "repaid" : "active",
            repaymentCommitment: d.repayCommitment,
            nullifierHash: d.nullifier_hash,
            commitment: d.commitment,
          })
        } catch (error) {
          console.error(`Error loading loan ${i}:`, error)
        }
      }

      setLoans(active)
      if (active.length > 0) {
        const firstLoan = active[0]
        setSelectedLoan(firstLoan)
        setRepayAmount((Number(firstLoan.borrowAmount) / 1e18).toString())
      }
      setLoadingLoans(false)
    }

    loadLoans()
  }, [])

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan)
    setRepayAmount((Number(loan.borrowAmount) / 1e18).toString())
  }

  // ---------------- REPAY ----------------
  const handleRepay = async () => {
    if (!selectedLoan) return

    try {
      setIsSubmitting(true)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const engine = new ethers.Contract(
        LENDING_ENGINE_ADDRESS,
        LENDING_ENGINE_ABI,
        signer
      )

      const token = new ethers.Contract(USDT_TOKEN_ADDRESS, ERC20_ABI, signer)
      
      // Approve the loan amount
      const approveTx = await token.approve(
        LENDING_ENGINE_ADDRESS,
        selectedLoan.borrowAmount
      )
      await approveTx.wait()

      // Repay the loan
      const tx = await engine.repayLoan(
        selectedLoan.repaymentCommitment,
        selectedLoan.borrowAmount,
        selectedLoan.nullifierHash,
        { gasLimit: 2_000_0000n }
      )

      await tx.wait()

      // ✅ Backend notification for repayment confirmation
      const res = await fetch(`${BACKEND_URL}/repayment-confirmed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitment: selectedLoan.repaymentCommitment
        })
      })

      router.push("/withdraw")
    } catch (err) {
      console.error(err)
      alert("Repayment failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ================= ENHANCED UI =================
  return (
    <div 
      id="repay-container"
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
                  PRIVATE LOAN REPAYMENT
                </span>
                <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  Anonymous Repayment
                </span>
                <span className="block mt-4 bg-gradient-to-r from-[#B86C1B] via-[#D8933B] to-[#F5B85C] bg-clip-text text-transparent">
                  Without Proofs
                </span>
              </h1>

              <div className="h-px max-w-3xl mx-auto mb-8"
                style={{ 
                  background: 'linear-gradient(90deg, transparent, #B86C1B, #D8933B, transparent)',
                  height: '2px'
                }} 
              />

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Repay your loan with a simple transaction{' '}
                <span className="font-semibold text-white">while maintaining complete anonymity</span>
              </p>
            </div>
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
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Active Loans</h2>
                    <p className="text-gray-400 text-sm">Select a loan to repay</p>
                  </div>
                </div>

                {loadingLoans ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="w-12 h-12 text-[#B86C1B] animate-spin mb-4" />
                    <p className="text-gray-400">Loading your loans...</p>
                  </div>
                ) : loans.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 rounded-xl border-2 border-dashed border-white/10 text-center"
                  >
                    <Database className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Loans</h3>
                    <p className="text-gray-400 mb-6">You don't have any active loans requiring repayment</p>
                    <Link 
                      href="/borrow"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #7A2214, #B86C1B)' }}
                    >
                      Create a Loan First
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan, index) => (
                      <motion.div
                        key={loan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSelectLoan(loan)}
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
                              <DollarSign className="w-6 h-6 text-white" />
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
                              <CircleDollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Amount Due</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                              {(Number(loan.borrowAmount) / 1e18).toFixed(2)} USDT
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Status</span>
                            </div>
                            <div className="text-xl font-bold text-green-400">
                              Active
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span>Repayment Commitment Ready</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            <span>Private Transaction</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy Note Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #964A16, #B86C1B)' }}
                  >
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">No Proof Required for Repayment</h3>
                    <p className="text-gray-300 mb-4">
                      Unlike borrowing, loan repayment in VeilCredit does not require a zero-knowledge proof. 
                      This is a simple transaction that maintains your anonymity while settling the loan.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
                        <span className="text-sm text-gray-300">Anyone can repay on your behalf</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
                        <span className="text-sm text-gray-300">No identity disclosure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
                        <span className="text-sm text-gray-300">Simple transaction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
                        <span className="text-sm text-gray-300">Maintains privacy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Repayment Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {/* Repayment Summary Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #B86C1B, #D8933B)' }}
                  >
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Repayment Summary</h2>
                    <p className="text-gray-400 text-sm">Review and submit repayment</p>
                  </div>
                </div>

                {selectedLoan ? (
                  <div className="space-y-6">
                    {/* Loan Details */}
                    <div className="p-6 rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #5C0C0B20, #7A221420)',
                        border: '1px solid #5C0C0B40'
                      }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-4">Selected Loan</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Loan ID</span>
                          <span className="text-white font-medium">{selectedLoan.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Asset</span>
                          <span className="text-white font-medium">{selectedLoan.asset}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Amount Due</span>
                          <span className="text-white font-medium">
                            {(Number(selectedLoan.borrowAmount) / 1e18).toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Created</span>
                          <span className="text-white font-medium">
                            {new Date(selectedLoan.startTime * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-white font-medium">Repayment Amount (USDT)</label>
                      </div>
                      
                      <div className="relative group">
                        <input
                          type="number"
                          value={repayAmount}
                          onChange={(e) => setRepayAmount(e.target.value)}
                          className="w-full p-5 rounded-2xl bg-black/40 border-2 border-white/10 focus:border-[#B86C1B] focus:outline-none text-white text-xl font-medium transition-all duration-300 group-hover:border-white/20"
                          disabled={isSubmitting}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ 
                              background: 'linear-gradient(135deg, #5C0C0B, #7A2214)',
                              color: 'white'
                            }}
                          >
                            <span className="font-medium">USDT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Repay Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRepay}
                      disabled={isSubmitting}
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
                            <span>Processing Repayment...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            <span>Repay Loan</span>
                          </>
                        )}
                      </div>
                    </motion.button>

                    {/* Note */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#B86C1B] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-white mb-1">Important Note</h4>
                          <p className="text-xs text-gray-400">
                            ✅ Backend notification added: After repayment, the system will track your loan status.
                            You'll need to generate a withdrawal proof to reclaim your collateral.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Select a Loan</h3>
                    <p className="text-gray-400 text-sm">
                      Choose a loan from the list to view repayment details
                    </p>
                  </div>
                )}
              </div>

              {/* Next Steps Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #964A16, #B86C1B)' }}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Next Steps</h2>
                    <p className="text-gray-400 text-sm">After repayment process</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { step: 1, title: "Repay Loan", description: "Simple transaction (no proof required)", status: "ready", icon: CreditCard },
                    { step: 2, title: "Generate Withdrawal Proof", description: "ZK proof to reclaim collateral", status: "pending", icon: Shield },
                    { step: 3, title: "Withdraw Collateral", description: "Submit proof to receive funds", status: "pending", icon: ArrowRight },
                  ].map((item) => {
                    const Icon = item.icon
                    const isActive = item.status === "ready"
                    
                    return (
                      <div key={item.step} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive
                            ? 'bg-gradient-to-r from-[#B86C1B] to-[#D8933B]'
                            : 'bg-black/40 border border-white/10'
                        }`}>
                          {isActive ? (
                            <Icon className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-gray-400 font-bold">{item.step}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <Link 
                    href="/withdraw"
                    className="group flex items-center justify-center gap-2 text-[#B86C1B] hover:text-[#D8933B] transition-colors"
                  >
                    <span>Go to Withdrawal Page</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </div>
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
                title: 'No Proof Required',
                description: 'Simple repayment transaction maintains privacy',
                color: '#5C0C0B'
              },
              {
                icon: Shield,
                title: 'Anonymous Repayment',
                description: 'Your identity remains completely hidden',
                color: '#7A2214'
              },
              {
                icon: Lock,
                title: 'Anyone Can Repay',
                description: 'Third parties can repay without revealing owner',
                color: '#964A16'
              },
            ].map((feature, index) => {
              const Icon = feature.icon
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
              )
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
              <Sparkles className="w-4 h-4 text-[#B86C1B]" />
              <span className="text-sm">Repayment is a simple transaction that maintains your privacy</span>
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
                href="/withdraw"
                className="group px-8 py-3 rounded-lg font-medium text-white transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #7A2214, #B86C1B)',
                  boxShadow: '0 10px 30px rgba(122, 34, 20, 0.3)'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Go to Withdrawal
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
