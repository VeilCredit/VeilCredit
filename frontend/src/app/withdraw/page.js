'use client'

import { useAccount, useContractWrite } from 'wagmi'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Download, Cpu, Shield, CheckCircle2, AlertCircle,
  Clock, RefreshCw, ChevronRight, ArrowRight,
  Info, FileKey, EyeOff, ExternalLink
} from 'lucide-react'

// Mock contract ABI - Replace with actual Vault ABI
const VAULT_ABI = [
  "function withdrawCollateral(bytes calldata proof, uint256 commitmentId) external",
  "function getWithdrawableCommitments(address user) external view returns (uint256[] memory)"
];

export default function WithdrawPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  
  // Withdrawal state
  const [selectedCommitment, setSelectedCommitment] = useState(null)
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)
  const [proofGenerated, setProofGenerated] = useState(false)
  const [activeStep, setActiveStep] = useState(1) // 1: Select, 2: Generate, 3: Submit
  
  // Mock data - Replace with actual contract calls
  const [withdrawablePositions, setWithdrawablePositions] = useState([
    {
      id: 1,
      commitment: '0x8f3a...c4d2',
      asset: 'ETH',
      amount: '1.5',
      value: '$4,500',
      deposited: '2 days ago',
      repaidLoanId: 'LN-001',
      repaymentTime: '2 hours ago',
      gradient: 'from-[#5C0C0B] via-[#7A2214] to-[#964A16]'
    },
    {
      id: 2,
      commitment: '0x9b2c...e5f3',
      asset: 'USDC',
      amount: '5,000',
      value: '$5,000',
      deposited: '5 days ago',
      repaidLoanId: 'LN-003',
      repaymentTime: '1 day ago',
      gradient: 'from-[#964A16] via-[#B86C1B] to-[#D8933B]'
    }
  ])
  
  // Contract write for withdrawal
  const { write: withdrawCollateral, isLoading: isSubmitting } = useContractWrite({
    address: '0xVAULT_ADDRESS',
    abi: VAULT_ABI,
    functionName: 'withdrawCollateral',
  })
  
  // Step 1: Generate Withdrawal Proof
  const handleGenerateProof = async () => {
    if (!selectedCommitment) {
      alert('Please select a commitment to withdraw')
      return
    }
    
    setIsGeneratingProof(true)
    setActiveStep(2)
    
    // Simulate proof generation via backend
    setTimeout(async () => {
      try {
        // In real app: Call your backend API
        // const response = await fetch('/api/generate-withdrawal-proof', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     commitment: selectedCommitment.commitment,
        //     repaidLoanId: selectedCommitment.repaidLoanId,
        //     userAddress: address
        //   })
        // });
        // const proof = await response.json();
        
        console.log('Withdrawal proof generated via backend API');
        setProofGenerated(true)
        setIsGeneratingProof(false)
        setActiveStep(3)
      } catch (error) {
        console.error('Proof generation failed:', error)
        setIsGeneratingProof(false)
      }
    }, 2000)
  }
  
  // Step 2: Submit Withdrawal
  const handleSubmitWithdrawal = () => {
    if (!proofGenerated) {
      alert('Please generate proof first')
      return
    }
    
    // In real app: withdrawCollateral({ args: [proof, selectedCommitment.id] })
    setTimeout(() => {
      alert(`Withdrawal successful!\n\nCollateral: ${selectedCommitment.amount} ${selectedCommitment.asset}\nValue: ${selectedCommitment.value}\n\nYour funds have been released to your wallet.`)
      
      // Remove from withdrawable positions
      setWithdrawablePositions(prev => 
        prev.filter(pos => pos.id !== selectedCommitment.id)
      )
      
      // Store in localStorage for dashboard to pick up
      localStorage.setItem('recentWithdrawal', JSON.stringify(selectedCommitment))
      
      // Reset
      setSelectedCommitment(null)
      setProofGenerated(false)
      setActiveStep(1)
      
      // Optionally redirect to dashboard
      // router.push('/dashboard')
    }, 1000)
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
              Private <span className="bg-gradient-to-r from-[#B86C1B] to-[#D8933B] bg-clip-text text-transparent">Withdrawal</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Generate a zero-knowledge proof to withdraw your collateral after loan repayment.
            </p>
          </motion.div>
          
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-12"
          >
            {[
              { number: 1, label: 'Select Commitment', active: activeStep >= 1 },
              { number: 2, label: 'Generate Proof', active: activeStep >= 2 },
              { number: 3, label: 'Withdraw', active: activeStep >= 3 }
            ].map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
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
                    <h2 className="text-2xl font-bold text-white mb-2">Withdrawable Collateral</h2>
                    <p className="text-gray-400">Select a commitment to withdraw</p>
                  </div>
                  <Download className="w-8 h-8 text-[#B86C1B]" />
                </div>
                
                {withdrawablePositions.length > 0 ? (
                  <div className="space-y-6">
                    {withdrawablePositions.map((position, idx) => (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => {
                          setSelectedCommitment(position)
                          setActiveStep(1)
                        }}
                        className={`p-6 rounded-xl border cursor-pointer transition-all ${
                          selectedCommitment?.id === position.id 
                            ? 'border-[#B86C1B] bg-gradient-to-r from-[#5C0C0B]/30 to-[#7A2214]/30' 
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${position.gradient}/20`}>
                              <Download className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-bold text-white">{position.asset} Deposit</h3>
                                <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                  Ready to Withdraw
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
                                <div>
                                  <p className="text-gray-400 text-sm">Amount</p>
                                  <p className="text-2xl font-bold text-white">{position.amount}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm">Value</p>
                                  <p className="text-2xl font-bold text-white">{position.value}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm">Repaid Loan</p>
                                  <p className="text-lg font-semibold text-white">{position.repaidLoanId}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <FileKey className="w-4 h-4 text-gray-400" />
                                  <span className="font-mono text-gray-300">{position.commitment}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-400">Deposited: {position.deposited}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400">Repaid: {position.repaymentTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center">
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
                              {selectedCommitment?.id === position.id ? 'Selected' : 'Select'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Withdrawable Collateral</h3>
                    <p className="text-gray-500 mb-6">
                      All collateral has been withdrawn or no loans have been repaid yet.
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
                      <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Proof</h2>
                      <p className="text-gray-400">Generate zero-knowledge proof</p>
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
                          <span>You own a valid deposit commitment in the Merkle tree</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>The loan associated with your commitment has been fully repaid</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>You have not already withdrawn this collateral</span>
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
                              ? 'Generating withdrawal proof via backend...' 
                              : 'Proof required to withdraw collateral'}
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
                <h2 className="text-2xl font-bold text-white mb-8">Withdrawal Summary</h2>
                
                {selectedCommitment ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-[#5C0C0B]/20 to-[#7A2214]/20">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-white mb-2">{selectedCommitment.amount} {selectedCommitment.asset}</div>
                        <div className="text-gray-400">Collateral to Withdraw</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Asset</span>
                          <span className="text-white">{selectedCommitment.asset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Value</span>
                          <span className="text-white">{selectedCommitment.value}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Repaid Loan</span>
                          <span className="text-white">{selectedCommitment.repaidLoanId}</span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="flex justify-between">
                          <span className="text-gray-400">Commitment Hash</span>
                          <span className="text-white font-mono text-sm">{selectedCommitment.commitment}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10">
                      <button
                        onClick={handleSubmitWithdrawal}
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
                            <Download className="w-5 h-5" />
                            {proofGenerated ? 'Withdraw Collateral' : 'Generate Proof First'}
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
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Selection</h3>
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
                  <h3 className="font-semibold text-white">Privacy Guarantee</h3>
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
  )
}