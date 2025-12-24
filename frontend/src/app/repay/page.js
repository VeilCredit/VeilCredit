'use client'

import { useAccount, useContractWrite } from 'wagmi'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CreditCard, DollarSign, CheckCircle2, AlertCircle,
  Clock, TrendingDown, RefreshCw, ChevronRight,
  ArrowRight, Info, Shield, ExternalLink
} from 'lucide-react'

// Mock contract ABI - Replace with actual Lending Engine ABI
const LENDING_ENGINE_ABI = [
  "function repayLoan(uint256 loanId) external payable",
  "function getLoanDetails(uint256 loanId) external view returns (uint256 amount, uint256 interest, bool isRepaid)"
];

export default function RepayPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  
  // Repayment state
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [repayAmount, setRepayAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Mock data - Replace with actual contract calls
  const [loans, setLoans] = useState([
    {
      id: 'LN-001',
      asset: 'USDC',
      borrowedAmount: '2,000',
      totalDue: '2,100',
      interest: '100',
      dueDate: '2024-03-15',
      healthFactor: 1.8,
      commitment: '0x5e9b...f8a1',
      status: 'active'
    },
    {
      id: 'LN-002',
      asset: 'ETH',
      borrowedAmount: '1.0',
      totalDue: '1.05',
      interest: '0.05',
      dueDate: '2024-03-20',
      healthFactor: 2.1,
      commitment: '0x3a7b...d9e2',
      status: 'active'
    }
  ])
  
  // Contract write for repayment
  const { write: repayLoan, isLoading: isSubmitting } = useContractWrite({
    address: '0xLENDING_ENGINE_ADDRESS',
    abi: LENDING_ENGINE_ABI,
    functionName: 'repayLoan',
  })
  
  // Select a loan
  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan)
    setRepayAmount(loan.totalDue)
  }
  
  // Handle repayment
  const handleRepay = async () => {
    if (!selectedLoan) {
      alert('Please select a loan to repay')
      return
    }
    
    setIsProcessing(true)
    
    // In real app: repayLoan({ args: [selectedLoan.id] })
    // Simulate transaction
    setTimeout(() => {
      alert(`Repayment successful!\n\nLoan: ${selectedLoan.id}\nAmount: ${repayAmount} ${selectedLoan.asset}\n\nNo proof required for repayment. You can now generate a withdrawal proof.`)
      
      // Update loan status
      setLoans(prev => prev.map(loan => 
        loan.id === selectedLoan.id 
          ? { ...loan, status: 'repaid' } 
          : loan
      ))
      
      // Store in localStorage for dashboard to pick up
      localStorage.setItem('recentRepayment', JSON.stringify({
        ...selectedLoan,
        status: 'repaid',
        repaymentTime: new Date().toISOString()
      }))
      
      setIsProcessing(false)
      setSelectedLoan(null)
      setRepayAmount('')
      
      // Redirect to withdrawal page
      router.push('/withdraw')
    }, 2000)
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
              Loan <span className="bg-gradient-to-r from-[#B86C1B] to-[#D8933B] bg-clip-text text-transparent">Repayment</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Repay your loan with a simple transaction. No proof required.
            </p>
          </motion.div>
          
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Loan Selection */}
            <div className="lg:col-span-2">
              {/* Active Loans Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm mb-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Active Loans</h2>
                    <p className="text-gray-400">Select a loan to repay</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-[#B86C1B]" />
                </div>
                
                <div className="space-y-6">
                  {loans.map((loan, idx) => (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectLoan(loan)}
                      className={`p-6 rounded-xl border cursor-pointer transition-all ${
                        selectedLoan?.id === loan.id 
                          ? 'border-[#B86C1B] bg-gradient-to-r from-[#5C0C0B]/30 to-[#7A2214]/30' 
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-white">{loan.id}</h3>
                            <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300">
                              {loan.asset}
                            </span>
                            {loan.status === 'repaid' && (
                              <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                Repaid
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-gray-400 text-sm">Borrowed</p>
                              <p className="text-lg font-semibold text-white">{loan.borrowedAmount} {loan.asset}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Total Due</p>
                              <p className="text-lg font-semibold text-white">{loan.totalDue} {loan.asset}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Interest</p>
                              <p className="text-lg font-semibold text-yellow-400">{loan.interest} {loan.asset}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Due Date</p>
                              <p className="text-lg font-semibold text-white">{loan.dueDate}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-400" />
                              <span className="text-gray-400">Health Factor:</span>
                              <span className="text-white font-medium">{loan.healthFactor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-400">Next Proof:</span>
                              <span className="text-white font-medium">7 days</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          {selectedLoan?.id === loan.id ? (
                            <div className="p-2 rounded-full bg-[#B86C1B]">
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-full border border-white/20">
                              <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                            </div>
                          )}
                          <span className="text-xs text-gray-400 mt-2">
                            {selectedLoan?.id === loan.id ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Important Note Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent"
              >
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Proof Required</h3>
                    <p className="text-gray-300">
                      Unlike borrowing, loan repayment in VeilCredit does not require a zero-knowledge proof. 
                      This is a simple transaction that anyone can make on your behalf without revealing your identity.
                    </p>
                    <p className="text-gray-400 text-sm mt-3">
                      After repayment, you'll need to generate a withdrawal proof to reclaim your collateral.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right Column: Repayment Summary */}
            <div className="space-y-8">
              {/* Repayment Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <h2 className="text-2xl font-bold text-white mb-8">Repayment Summary</h2>
                
                {selectedLoan ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-[#5C0C0B]/20 to-[#7A2214]/20">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-white mb-2">{repayAmount} {selectedLoan.asset}</div>
                        <div className="text-gray-400">Total Amount Due</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Principal</span>
                          <span className="text-white">{selectedLoan.borrowedAmount} {selectedLoan.asset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Interest</span>
                          <span className="text-yellow-400">{selectedLoan.interest} {selectedLoan.asset}</span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="flex justify-between text-lg font-semibold">
                          <span className="text-white">Total</span>
                          <span className="text-white">{selectedLoan.totalDue} {selectedLoan.asset}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Loan ID</span>
                        <span className="text-white font-mono">{selectedLoan.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Commitment Hash</span>
                        <span className="text-white font-mono">{selectedLoan.commitment}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Due Date</span>
                        <span className="text-white">{selectedLoan.dueDate}</span>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10">
                      <button
                        onClick={handleRepay}
                        disabled={isProcessing || isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
                          ${isProcessing || isSubmitting
                            ? 'bg-[#B86C1B]/50 text-white cursor-wait'
                            : 'bg-gradient-to-r from-[#5C0C0B] via-[#7A2214] to-[#B86C1B] hover:shadow-lg hover:shadow-[#B86C1B]/30 text-white'
                          }`}
                      >
                        {isProcessing || isSubmitting ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Repay Loan
                          </>
                        )}
                      </button>
                      
                      <p className="text-gray-400 text-sm text-center mt-4">
                        This will initiate a simple transaction. No proof generation required.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Loan Selected</h3>
                    <p className="text-gray-500">
                      Select a loan from the list to view repayment details
                    </p>
                  </div>
                )}
              </motion.div>
              
              {/* Next Steps Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#5C0C0B] to-[#7A2214] flex items-center justify-center">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Repay Loan</p>
                      <p className="text-sm text-gray-400">Simple transaction (no proof)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-gray-400 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Generate Withdrawal Proof</p>
                      <p className="text-sm text-gray-500">ZK proof to reclaim collateral</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-gray-400 font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Withdraw Collateral</p>
                      <p className="text-sm text-gray-500">Submit proof to receive funds</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <Link 
                    href="/withdraw"
                    className="flex items-center justify-center gap-2 text-[#B86C1B] hover:text-[#D8933B] transition-colors"
                  >
                    <span>Go to Withdrawal Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}