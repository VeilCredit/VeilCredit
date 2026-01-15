'use client'

import { useAccount } from 'wagmi'
import { getPublicClient } from 'wagmi/actions'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { config } from '../../lib/config'

import {
  DollarSign,
  CreditCard,
  Database,
  Shield,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  CONTRACT CONSTANTS (UNCHANGED)                                     */
/* ------------------------------------------------------------------ */

const LENDING_ENGINE_ADDRESS =
  '0x2B54285c432d48F154EE099B5bE380E873315788'

const LENDING_ENGINE_ABI = [
  {
    name: 'getTotalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getTotalBorrow',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getTotalReserves',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getTotalDepositAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
]

const TOKENS = {
  WETH: {
    address: '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44',
    decimals: 18,
  },
  USDT: {
    address: '0x09635F643e140090A9A8Dcd712eD6285858ceBef',
    decimals: 18,
  },
}

/* ------------------------------------------------------------------ */

export default function MonitorPage() {
  const { isConnected } = useAccount()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState({
    tvl: '$0',
    totalSupply: '$0',
    totalBorrow: '$0',
    totalReserves: '$0',
  })

  /* ------------------------------------------------------------------ */
  /*  REAL ON-CHAIN FETCH (ANVIL FORCED)                                 */
  /* ------------------------------------------------------------------ */

  const fetchRealData = async () => {
    try {
      setIsRefreshing(true)

      // 🔥 EXACT SAME RPC AS `cast`
      const publicClient = getPublicClient(config, {
        chainId: 31337,
      })

      const [
        totalSupply,
        totalBorrow,
        totalReserves,
        wethDeposits,
        usdtDeposits,
      ] = await Promise.all([
        publicClient.readContract({
          address: LENDING_ENGINE_ADDRESS,
          abi: LENDING_ENGINE_ABI,
          functionName: 'getTotalSupply',
        }),
        publicClient.readContract({
          address: LENDING_ENGINE_ADDRESS,
          abi: LENDING_ENGINE_ABI,
          functionName: 'getTotalBorrow',
        }),
        publicClient.readContract({
          address: LENDING_ENGINE_ADDRESS,
          abi: LENDING_ENGINE_ABI,
          functionName: 'getTotalReserves',
        }),
        publicClient.readContract({
          address: LENDING_ENGINE_ADDRESS,
          abi: LENDING_ENGINE_ABI,
          functionName: 'getTotalDepositAmount',
          args: [TOKENS.WETH.address],
        }),
        publicClient.readContract({
          address: LENDING_ENGINE_ADDRESS,
          abi: LENDING_ENGINE_ABI,
          functionName: 'getTotalDepositAmount',
          args: [TOKENS.USDT.address],
        }),
      ])

      const supply = Number(formatUnits(totalSupply, 18))
      const borrow = Number(formatUnits(totalBorrow, 18))
      const reserves = Number(formatUnits(totalReserves, 18))

      const tvl = supply - borrow + reserves

      setStats({
        tvl: `$${tvl.toLocaleString()}`,
        totalSupply: `$${supply.toLocaleString()}`,
        totalBorrow: `$${borrow.toLocaleString()}`,
        totalReserves: `$${reserves.toLocaleString()}`,
      })

      console.log('✅ ON-CHAIN DATA', {
        totalSupply,
        totalBorrow,
        totalReserves,
        wethDeposits,
        usdtDeposits,
      })
    } catch (err) {
      console.error('❌ fetchRealData failed', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (isConnected) fetchRealData()
  }, [isConnected])

  /* ------------------------------------------------------------------ */

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Wallet not connected</h1>
          <Link href="/dashboard" className="underline">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          'linear-gradient(135deg, #0A0A0A 0%, #0A0605 50%, #1A0F0B 100%)',
      }}
    >
      <div className="container mx-auto px-6 py-16">
        <div className="mb-10 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-5xl font-bold mb-2">
            Protocol Monitor
          </h1>
          <p className="text-gray-400">
            Live on-chain data 
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'TVL', value: stats.tvl, icon: DollarSign },
            { label: 'Total Supply', value: stats.totalSupply, icon: Database },
            { label: 'Total Borrow', value: stats.totalBorrow, icon: CreditCard },
            { label: 'Reserves', value: stats.totalReserves, icon: Shield },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={i}
                className="p-6 rounded-xl bg-black/40 border border-white/10"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{stat.label}</span>
                  <Icon className="w-4 h-4 text-[#B86C1B]" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-green-400 mt-1">LIVE</div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <button
            onClick={fetchRealData}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5C0C0B] to-[#7A2214]"
          >
            <RefreshCw
              className={`inline w-4 h-4 mr-2 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
