'use client'

import { useAccount, useContractWrite } from 'wagmi'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, TrendingUp, EyeOff, Upload, 
  CreditCard, Zap, DollarSign, Calculator, Cpu,
  BarChart3, Clock, AlertCircle, CheckCircle2,
  ChevronRight, RefreshCw, ExternalLink,
  Info, FileKey, Sparkles
} from 'lucide-react'

// Mock contract ABI - Replace with actual Lending Engine ABI
const LENDING_ENGINE_ABI = [
  "function requestLoan(uint256 amount, bytes calldata proof) external",
  "function submitSolvencyProof(bytes calldata proof) external"
];

export default function BorrowPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  
  // Loan state
  const [loanAmount, setLoanAmount] = useState('1.5')
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)
  const [proofGenerated, setProofGenerated] = useState(false)
  const [activeStep, setActiveStep] = useState(1) // 1: Input, 2: Proof, 3: Submit
  
  // Mock data
  const [borrowData, setBorrowData] = useState({
    availableCollateral: '3.2 ETH',
    collateralValue: '$8,450',
    maxBorrow: '2.4 ETH', // 75% LTV
    healthFactor: 2.85,
    interestRate: '5.2% APR',
    loanTerm: '30 days',
    proofDeadline: '7 days'
  })
  
  // Contract write for loan request - Updated without usePrepareContractWrite
  const { write: requestLoan, isLoading: isSubmitting } = useContractWrite({
    address: '0xLENDING_ENGINE_ADDRESS',
    abi: LENDING_ENGINE_ABI,
    functionName: 'requestLoan',
    args: [loanAmount, '0xPROOF_PLACEHOLDER'],
  })
  
  // Step 1: Generate Proof
  const handleGenerateProof = async () => {
    setIsGeneratingProof(true)
    setActiveStep(2)
    
    // Simulate proof generation via backend
    setTimeout(async () => {
      try {
        console.log('Proof generated via backend API');
        setProofGenerated(true)
        setIsGeneratingProof(false)
        setActiveStep(3)
      } catch (error) {
        console.error('Proof generation failed:', error)
        setIsGeneratingProof(false)
      }
    }, 2000)
  }
  
  // Step 2: Submit Loan Request
  const handleSubmitLoan = () => {
    if (!proofGenerated) {
      alert('Please generate proof first')
      return
    }
    
    // In real app: requestLoan();
    // For now, simulate success
    setTimeout(() => {
      alert(`Loan request submitted!\n\nAmount: ${loanAmount} ETH\nStatus: Processing\n\nFunds will arrive in your wallet shortly.`)
      
      // Update dashboard state
      const newLoan = {
        id: Date.now(),
        type: 'Loan',
        asset: 'ETH',
        amount: loanAmount,
        value: `$${(parseFloat(loanAmount) * 2500).toFixed(0)}`,
        change: '0.0%',
        commitment: `0x${Math.random().toString(16).slice(2, 10)}...`,
        timestamp: 'Just now',
        gradient: 'from-[#964A16] via-[#B86C1B] to-[#D8933B]',
        status: 'active'
      }
      
      localStorage.setItem('recentLoan', JSON.stringify(newLoan))
      router.push('/dashboard')
    }, 1000)
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }
  
  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background matching dashboard */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0605] to-[#1A0F0B]" />
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#B86C1B] to-transparent"
            style={{
              top: `${30 + i * 25}%`,
              left: '0',
              right: '0',
              opacity: 0.1 + i * 0.03
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 25 + i * 8,
              repeat: Infinity,
              ease: "linear"
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
              Request <span className="bg-gradient-to-r from-[#B86C1B] to-[#D8933B] bg-clip-text text-transparent">Private Loan</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Borrow against your hidden collateral. Your loan amount and collateral remain private using zero-knowledge proofs.
            </p>
          </motion.div>
          
          {/* Progress Steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center mb-12"
          >
            {[
              { number: 1, label: 'Loan Details', active: activeStep >= 1 },
              { number: 2, label: 'Generate Proof', active: activeStep >= 2 },
              { number: 3, label: 'Submit Request', active: activeStep >= 3 }
            ].map((step, idx) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="flex items-center"
              >
                <div className={`flex flex-col items-center ${idx > 0 ? 'ml-16' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-3
                    ${step.active 
                      ? 'bg-gradient-to-br from-[#5C0C0B] to-[#B86C1B] text-white' 
                      : 'bg-white/5 text-gray-500'
                    }`}>
                    {step.active ? '✓' : step.number}
                  </div>
                  <span className={`text-sm font-medium ${step.active ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`w-16 h-0.5 mx-4 ${step.active ? 'bg-gradient-to-r from-[#B86C1B] to-[#D8933B]' : 'bg-white/10'}`} />
                )}
              </motion.div>
            ))}
          </motion.div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Loan Details & Proof */}
            <div className="lg:col-span-2 space-y-8">
              {/* Loan Calculator Card */}
              <motion.div
                variants={itemVariants}
                className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Loan Calculator</h2>
                    <p className="text-gray-400">Based on your hidden collateral</p>
                  </div>
                  <Calculator className="w-8 h-8 text-[#B86C1B]" />
                </div>
                
                <div className="space-y-8">
                  {/* Amount Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-lg font-medium text-white">Loan Amount</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          min="0"
                          max={borrowData.maxBorrow.split(' ')[0]}
                          step="0.1"
                          className="w-32 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-right text-white"
                        />
                        <span className="text-white">ETH</span>
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max={borrowData.maxBorrow.split(' ')[0]}
                      step="0.1"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#B86C1B] [&::-webkit-slider-thumb]:to-[#D8933B]"
                    />
                    
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>0 ETH</span>
                      <span className="text-white font-medium">Max: {borrowData.maxBorrow}</span>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="text-gray-400 text-sm mb-1">Available Collateral</div>
                      <div className="text-2xl font-bold text-white">{borrowData.availableCollateral}</div>
                      <div className="text-gray-500 text-sm">{borrowData.collateralValue}</div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="text-gray-400 text-sm mb-1">Health Factor</div>
                      <div className="text-2xl font-bold text-white flex items-center gap-2">
                        {borrowData.healthFactor}
                        <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                          Safe
                        </div>
                      </div>
                      <div className="text-gray-500 text-sm">After loan: {(borrowData.healthFactor * 0.7).toFixed(2)}</div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="text-gray-400 text-sm mb-1">Interest Rate</div>
                      <div className="text-2xl font-bold text-white">{borrowData.interestRate}</div>
                      <div className="text-gray-500 text-sm">Fixed rate</div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="text-gray-400 text-sm mb-1">Proof Deadline</div>
                      <div className="text-2xl font-bold text-white">{borrowData.proofDeadline}</div>
                      <div className="text-gray-500 text-sm">First solvency proof due</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Proof Generation Card */}
              <motion.div
                variants={itemVariants}
                className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Zero-Knowledge Proof</h2>
                    <p className="text-gray-400">Prove solvency without revealing collateral</p>
                  </div>
                  <Cpu className="w-8 h-8 text-[#B86C1B]" />
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-gradient-to-r from-[#5C0C0B]/20 to-[#7A2214]/20">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FileKey className="w-5 h-5" />
                      What this proof verifies:
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>You own a valid deposit commitment in the Merkle tree</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Your hidden collateral satisfies the protocol's solvency requirements</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>The requested loan amount is within allowable limits</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white mb-1">Proof Status</h4>
                      <p className="text-gray-400 text-sm">
                        {proofGenerated 
                          ? 'Proof generated and ready to submit' 
                          : isGeneratingProof 
                            ? 'Generating proof via backend...' 
                            : 'Proof required for loan approval'}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleGenerateProof}
                      disabled={isGeneratingProof || proofGenerated}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-3
                        ${proofGenerated 
                          ? 'bg-green-500/20 text-green-400 cursor-default'
                          : isGeneratingProof
                            ? 'bg-[#B86C1B]/50 text-white cursor-wait'
                            : 'bg-gradient-to-r from-[#5C0C0B] to-[#B86C1B] hover:opacity-90 text-white'
                        }`}
                    >
                      {proofGenerated ? (
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
                  
                  <div className="text-sm text-gray-500">
                    <Info className="w-4 h-4 inline mr-2" />
                    Proof generation happens via VeilCredit backend API. Your secrets never leave your device.
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right Column: Summary & Action */}
            <div className="space-y-8">
              {/* Loan Summary Card */}
              <motion.div
                variants={itemVariants}
                className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-8">Loan Summary</h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Loan Amount</span>
                    <span className="text-2xl font-bold text-white">{loanAmount} ETH</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Estimated Value</span>
                    <span className="text-xl font-semibold text-white">
                      ${(parseFloat(loanAmount) * 2500).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="h-px bg-white/10" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Interest Rate</span>
                      <span className="text-white">{borrowData.interestRate}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Loan Term</span>
                      <span className="text-white">{borrowData.loanTerm}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Proof Interval</span>
                      <span className="text-white">Every 7 days</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Liquidation Threshold</span>
                      <span className="text-red-400">Health Factor {'<'} 1.0</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-white/10" />
                  
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#5C0C0B]/20 to-[#7A2214]/20">
                    <div className="text-gray-400 text-sm mb-2">After this loan:</div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">New Health Factor</span>
                      <span className="text-xl font-bold text-yellow-400">
                        {(borrowData.healthFactor * 0.7).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Action Card */}
              <motion.div
                variants={itemVariants}
                className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-8">Ready to Proceed</h2>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-gradient-to-r from-[#5C0C0B]/30 to-[#7A2214]/30">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      Important Reminder
                    </h3>
                    <p className="text-gray-300 text-sm">
                      You <span className="text-yellow-400 font-semibold">must submit periodic solvency proofs</span> every {borrowData.proofDeadline} to maintain your loan position and avoid liquidation.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSubmitLoan}
                    disabled={!proofGenerated || isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
                      ${!proofGenerated 
                        ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#5C0C0B] via-[#7A2214] to-[#B86C1B] hover:shadow-lg hover:shadow-[#B86C1B]/30 text-white'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        {proofGenerated ? 'Submit Loan Request' : 'Generate Proof First'}
                      </>
                    )}
                  </button>
                  
                  <div className="text-center">
                    <Link 
                      href="/dashboard" 
                      className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Return to Dashboard
                    </Link>
                  </div>
                </div>
              </motion.div>
              
              {/* Privacy Guarantee Card */}
              <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <EyeOff className="w-5 h-5 text-[#B86C1B]" />
                  <h3 className="font-semibold text-white">Privacy Guarantee</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5 flex-shrink-0" />
                    Your collateral amount remains hidden
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5 flex-shrink-0" />
                    Loan cannot be linked to your identity
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B86C1B] mt-1.5 flex-shrink-0" />
                    Repayments are unlinkable to borrows
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}