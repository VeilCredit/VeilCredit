'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ethers } from 'ethers'
import { motion } from 'framer-motion'
import {
  Cpu, Upload, CheckCircle2, RefreshCw,
  ChevronRight, AlertCircle, EyeOff
} from 'lucide-react'

// CONFIG 

const LENDING_ENGINE_ADDRESS = '0xc5a5C42992dECbae36851359345FE25997F5C42d'

const LENDING_ENGINE_ABI = [
  'function requestLoan(uint256 amount, bytes calldata proof) external'
]

// COMPONENT

export default function BorrowPage() {
  const router = useRouter()

  const [loanAmount, setLoanAmount] = useState('1')
  const [commitment, setCommitment] = useState(null)
  const [proof, setProof] = useState(null)

  const [isGeneratingProof, setIsGeneratingProof] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  // LOAD COMMITMENT
 
  useEffect(() => {
    const storedCommitment = localStorage.getItem('commitment')

    if (!storedCommitment) {
      router.push('/deposit')
      return
    }

    setCommitment(storedCommitment)
  }, [router])

  // GENERATE BORROW PROOF 

  const handleGenerateProof = async () => {
    if (!commitment) return

    try {
      setIsGeneratingProof(true)
      setActiveStep(2)

      const res = await fetch('/api/borrow/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitment,                         
          borrowAmount: ethers.parseEther(loanAmount).toString(),
          tokenId: 0                        
        })
      })

      if (!res.ok) {
        throw new Error('Backend proof generation failed')
      }

      const data = await res.json()

      if (!data.proof) {
        throw new Error('Invalid proof returned')
      }

      setProof(data.proof)
      setActiveStep(3)
    } catch (err) {
      console.error(err)
      alert('Proof generation failed')
    } finally {
      setIsGeneratingProof(false)
    }
  }
  
  // SUBMIT LOAN TX
  
  const handleSubmitLoan = async () => {
    if (!proof) return

    try {
      setIsSubmitting(true)

      if (!window.ethereum) {
        throw new Error('Wallet not found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const lendingEngine = new ethers.Contract(
        LENDING_ENGINE_ADDRESS,
        LENDING_ENGINE_ABI,
        signer
      )

      const tx = await lendingEngine.requestLoan(
        ethers.parseEther(loanAmount),
        proof
      )

      await tx.wait()

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Loan request failed')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // UI 
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 container mx-auto px-6 py-20">

        {/* Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ChevronRight className="rotate-180 w-4 h-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-4xl font-bold text-white mt-4">
            Request <span className="text-yellow-500">Private Loan</span>
          </h1>
        </div>

        {/* Steps */}
        <div className="flex justify-center gap-16 mb-12">
          {['Loan', 'Proof', 'Submit'].map((label, i) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center
                ${activeStep > i ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}
              >
                {activeStep > i ? '✓' : i + 1}
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
            disabled={isGeneratingProof || proof}
            className="mt-6 px-6 py-3 rounded-lg bg-yellow-500 text-black font-semibold flex items-center gap-2"
          >
            {isGeneratingProof ? (
              <>
                <RefreshCw className="animate-spin w-4 h-4" />
                Generating…
              </>
            ) : proof ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Proof Ready
              </>
            ) : (
              'Generate Proof'
            )}
          </button>
        </div>

        {/* Submit */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-8">
          <button
            onClick={handleSubmitLoan}
            disabled={!proof || isSubmitting}
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
  )
}
