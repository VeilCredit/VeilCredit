'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Download, Zap, ChevronRight,
  Shield, Lock, EyeOff, Cpu,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function DepositPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [selectedAsset, setSelectedAsset] = useState('ETH')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const assets = [
    { symbol: 'ETH', name: 'Ethereum', apy: '3.2%' },
    { symbol: 'wBTC', name: 'Wrapped Bitcoin', apy: '2.8%' },
    { symbol: 'USDC', name: 'USD Coin', apy: '5.1%' }
  ]

  const simulateDeposit = () => {
    setIsLoading(true)
    setStep(2)
    
    // Step 1: Generate commitment
    setTimeout(() => {
      setStep(3)
      // Step 2: Submit to contract
      setTimeout(() => {
        setStep(4)
        // Step 3: Store secrets
        setTimeout(() => {
          setStep(5)
          // Complete
          setTimeout(() => {
            // Save to localStorage so dashboard can pick it up
            const newDeposit = {
              id: Date.now(),
              type: 'Deposit',
              asset: selectedAsset,
              amount: amount,
              value: `$${(parseFloat(amount) * 3000).toFixed(0)}`,
              change: '+0.0%',
              commitment: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
              timestamp: 'Just now',
              gradient: 'from-[#5C0C0B] via-[#7A2214] to-[#964A16]'
            }
            
            localStorage.setItem('recentDeposit', JSON.stringify(newDeposit))
            
            alert(`🎉 Deposit Successful!\n\n${amount} ${selectedAsset} deposited privately\nCommitment: ${newDeposit.commitment}\n\nYour dashboard will now update.`)
            
            router.push('/dashboard')
          }, 1000)
        }, 1500)
      }, 1500)
    }, 1500)
  }

  const steps = [
    { number: 1, title: 'Input Details', description: 'Select asset and amount' },
    { number: 2, title: 'Generate Commitment', description: 'Create zero-knowledge proof' },
    { number: 3, title: 'Submit to Contract', description: 'Interact with Vault contract' },
    { number: 4, title: 'Store Secrets', description: 'Save nullifier locally' },
    { number: 5, title: 'Complete', description: 'Position added to dashboard' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Private <span className="bg-gradient-to-r from-[#B86C1B] to-[#D8933B] bg-clip-text text-transparent">Deposit</span>
          </h1>
          <p className="text-gray-400">Deposit collateral with zero-knowledge commitments</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex flex-col items-center text-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step > s.number ? 'bg-green-500' :
                  step === s.number ? 'bg-gradient-to-r from-[#5C0C0B] to-[#7A2214]' :
                  'bg-white/10'
                }`}>
                  {step > s.number ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="font-semibold">{s.number}</span>
                  )}
                </div>
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-xs text-gray-400">{s.description}</div>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#5C0C0B] to-[#7A2214]"
              initial={{ width: '0%' }}
              animate={{ width: `${(step - 1) * 25}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Deposit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-black/60 to-transparent"
          >
            {step === 1 ? (
              <>
                <h2 className="text-2xl font-bold mb-6">Deposit Details</h2>
                
                {/* Asset Selection */}
                <div className="mb-8">
                  <label className="block text-gray-400 mb-4">Select Asset</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {assets.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => setSelectedAsset(asset.symbol)}
                        className={`p-6 rounded-xl border transition-all text-left ${
                          selectedAsset === asset.symbol
                            ? 'border-[#B86C1B] bg-gradient-to-r from-[#5C0C0B]/20 to-[#7A2214]/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-2xl font-bold mb-2">{asset.symbol}</div>
                        <div className="text-gray-400 mb-3">{asset.name}</div>
                        <div className="text-sm text-green-400">APY: {asset.apy}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-8">
                  <label className="block text-gray-400 mb-4">Amount</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0.00"
                      className="w-full p-6 text-4xl font-bold bg-transparent border-2 border-white/10 rounded-2xl focus:border-[#B86C1B] focus:outline-none"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold">
                      {selectedAsset}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setAmount('0.5')}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                    >
                      0.5 {selectedAsset}
                    </button>
                    <button
                      onClick={() => setAmount('1.0')}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                    >
                      1.0 {selectedAsset}
                    </button>
                    <button
                      onClick={() => setAmount('2.0')}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                    >
                      2.0 {selectedAsset}
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-6 rounded-xl border border-white/10 mb-8">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Estimated Value</span>
                    <span className="text-xl font-bold">
                      ${amount ? (parseFloat(amount) * 3000).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Current Health Factor</span>
                    <span className="text-green-400">2.85 → 2.92</span>
                  </div>
                </div>

                {/* Deposit Button */}
                <button
                  onClick={simulateDeposit}
                  disabled={!amount || isLoading}
                  className="w-full py-4 rounded-xl font-medium text-lg transition-all relative overflow-hidden group disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #5C0C0B 0%, #7A2214 50%, #964A16 100%)',
                    border: '1px solid rgba(122, 34, 20, 0.4)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center gap-3">
                    <Download className="w-5 h-5" />
                    Start Private Deposit
                  </span>
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex p-6 rounded-3xl mb-6 bg-gradient-to-br from-[#5C0C0B]/20 to-[#7A2214]/10 border border-white/10"
                >
                  {step === 2 && <Cpu className="w-12 h-12 text-[#B86C1B] animate-pulse" />}
                  {step === 3 && <Shield className="w-12 h-12 text-[#B86C1B] animate-pulse" />}
                  {step === 4 && <Lock className="w-12 h-12 text-[#B86C1B] animate-pulse" />}
                  {step === 5 && <CheckCircle className="w-12 h-12 text-green-400" />}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">{steps[step - 1].title}</h3>
                <p className="text-gray-400 mb-8">{steps[step - 1].description}</p>
                
                {step === 2 && (
                  <div className="text-left max-w-md mx-auto space-y-4">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-[#B86C1B]" />
                      <span>Calling backend: /api/generate-commitment</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-[#B86C1B]" />
                      <span>Generating zero-knowledge proof...</span>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="text-left max-w-md mx-auto space-y-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#B86C1B]" />
                      <span>Interacting with Vault contract...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#B86C1B]" />
                      <span>Submitting depositWithCommitment()</span>
                    </div>
                  </div>
                )}
                
                {step === 4 && (
                  <div className="text-left max-w-md mx-auto space-y-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-[#B86C1B]" />
                      <span>Storing nullifier & secret in localStorage...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-[#B86C1B]" />
                      <span>Encrypting sensitive data...</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#B86C1B] border-r-transparent"></div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-lg font-semibold mb-4">Privacy Features</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <EyeOff className="w-5 h-5 text-[#B86C1B] mt-0.5" />
                  <div>
                    <div className="font-medium">Hidden Amounts</div>
                    <div className="text-sm text-gray-400">Deposit amounts are never revealed on-chain</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#B86C1B] mt-0.5" />
                  <div>
                    <div className="font-medium">Unlinkable</div>
                    <div className="text-sm text-gray-400">Deposits cannot be linked to withdrawals</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#B86C1B] mt-0.5" />
                  <div>
                    <div className="font-medium">Local Secrets</div>
                    <div className="text-sm text-gray-400">Critical data stored only in your browser</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-lg font-semibold mb-4">Technical Process</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">1. Commitment Generation</div>
                  <div className="text-gray-400">Backend creates Pedersen commitment hash</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1">2. Contract Interaction</div>
                  <div className="text-gray-400">Vault.depositWithCommitment() called</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1">3. Local Storage</div>
                  <div className="text-gray-400">Nullifier & secret saved in IndexedDB</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1">4. Merkle Tree Update</div>
                  <div className="text-gray-400">Commitment added to deposit Merkle tree</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <button 
                onClick={() => alert('Support information:\n\nDocumentation: docs.veilcredit.io\nDiscord: discord.gg/veil\nEmail: support@veilcredit.io')}
                className="w-full py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-center mb-3"
              >
                View Documentation
              </button>
              <button 
                onClick={() => alert('Contact support team')}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}