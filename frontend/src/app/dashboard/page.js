'use client'

import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CustomConnectButton from '@/components/CustomConnectButton'
import { 
  Shield, TrendingUp, TrendingDown, EyeOff, Lock,
  Download, Upload, CreditCard, Zap, DollarSign,
  BarChart3, PieChart, Activity, RefreshCw, ChevronRight,
  Cpu, Users, Sparkles, AlertCircle, CheckCircle2,
  ArrowRight, X, Menu, Globe, Database, Network,
  BarChart, KeyRound, Clock, ExternalLink,
  Plus, Minus, Settings, Filter, Search,
  Info
} from 'lucide-react'
import Link from 'next/link'

export default function CinematicDashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Manage all dashboard data in state
  const [dashboardData, setDashboardData] = useState({
    healthFactor: 2.85,
    totalCollateral: '$8,450',
    activeLoans: '$2,000',
    privacyScore: 100,
    totalEarnings: '$245',
    positions: [
      { 
        id: 1, type: 'Deposit', asset: 'ETH', amount: '1.5', value: '$4,500', 
        change: '+0.2%', commitment: '0x8f3a...c4d2', timestamp: '2 days ago',
        gradient: 'from-[#5C0C0B] via-[#7A2214] to-[#964A16]',
        status: 'active', canWithdraw: false
      },
      { 
        id: 2, type: 'Loan', asset: 'USDC', amount: '2,000', value: '$2,000', 
        change: '0.0%', commitment: '0x5e9b...f8a1', timestamp: '1 day ago',
        gradient: 'from-[#964A16] via-[#B86C1B] to-[#D8933B]',
        status: 'active', canWithdraw: false
      }
    ],
    recentActivity: [
      { action: 'ZK Proof Generated', time: '2 hours ago', status: 'Verified', type: 'success' },
      { action: 'Collateral Added', time: '1 day ago', status: 'Complete', type: 'success' },
      { action: 'Loan Request', time: '3 days ago', status: 'Active', type: 'pending' }
    ],
    proofDeadlines: [
      { loanId: 'LN-001', dueIn: '2 days 5 hrs', asset: 'USDC', amount: '2,000', status: 'pending' },
      { loanId: 'LN-002', dueIn: '5 days 12 hrs', asset: 'ETH', amount: '1.0', status: 'pending' }
    ],
    hasWithdrawableCollateral: false
  });

  // Function to add a new deposit (called from deposit page)
  const addNewDeposit = (newDeposit) => {
    setDashboardData(prev => ({
      ...prev,
      positions: [...prev.positions, newDeposit],
      totalCollateral: `$${parseInt(prev.totalCollateral.replace('$', '').replace(',', '')) + parseInt(newDeposit.value.replace('$', '').replace(',', ''))}`
    }))
  }

  // Function to refresh all data
  const refreshData = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setDashboardData(prev => ({
        ...prev,
        healthFactor: 2.85 + (Math.random() * 0.1 - 0.05),
        positions: prev.positions.map(pos => ({
          ...pos,
          change: `${(Math.random() * 0.4 - 0.2).toFixed(1)}%`
        }))
      }))
      setIsRefreshing(false)
    }, 1000)
  }

  // Handle position actions
  const handleViewProof = (position) => {
    alert(`Zero-Knowledge Proof Details:\n\nAsset: ${position.asset}\nAmount: ${position.amount}\nValue: ${position.value}\nCommitment Hash: ${position.commitment}\nTimestamp: ${position.timestamp}\n\nThis proof verifies your position without revealing any sensitive data.`)
  }

  const handleRepayLoan = (position) => {
    if (confirm(`Initiate repayment for ${position.amount} ${position.asset}?\n\nREAL FLOW:\n1. Simple transaction (no proof needed)\n2. After repayment, generate withdrawal proof\n3. Withdraw collateral`)) {
      // In real app: Call contract repay function
      alert(`In real app: Call contract to repay ${position.amount} ${position.asset}`);
      
      // Update position status
      setDashboardData(prev => ({
        ...prev,
        positions: prev.positions.map(p => 
          p.id === position.id 
            ? { ...p, status: 'repaid', canWithdraw: true } 
            : p
        ),
        hasWithdrawableCollateral: true
      }));
    }
  };
  
  // ADD new function for withdrawal proof:
  const handleGenerateWithdrawalProof = (position) => {
    alert(`Generating withdrawal proof for ${position.asset} position.\n\nREAL FLOW:\n1. Call backend /generate-withdrawal-proof\n2. Submit proof to Vault contract\n3. Release collateral`);
    router.push('/withdraw'); // You'll create this later
  };

  // Auto-refresh simulation
  useEffect(() => {
    if (!isConnected) return
    const interval = setInterval(refreshData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [isConnected])

  // Check for new deposits, repayments, and withdrawals in localStorage
useEffect(() => {
    if (isConnected) {
      // Check for new deposits
      const recentDeposit = localStorage.getItem('recentDeposit')
      if (recentDeposit) {
        const deposit = JSON.parse(recentDeposit)
        addNewDeposit(deposit)
        localStorage.removeItem('recentDeposit')
      }
      
      // NEW: Check for recent repayments
      const recentRepayment = localStorage.getItem('recentRepayment')
      if (recentRepayment) {
        const repayment = JSON.parse(recentRepayment)
        // Update loan status in dashboard (loan ID 2 is your USDC loan)
        setDashboardData(prev => ({
          ...prev,
          positions: prev.positions.map(pos => 
            pos.id === 2 // This should match your loan ID - in real app, use proper mapping
              ? { ...pos, status: 'repaid', canWithdraw: true }
              : pos
          ),
          hasWithdrawableCollateral: true
        }))
        localStorage.removeItem('recentRepayment')
      }
      
      // NEW: Check for recent withdrawals
      const recentWithdrawal = localStorage.getItem('recentWithdrawal')
      if (recentWithdrawal) {
        const withdrawal = JSON.parse(recentWithdrawal)
        // Remove deposit position from dashboard (deposit ID 1 is your ETH deposit)
        setDashboardData(prev => ({
          ...prev,
          positions: prev.positions.filter(pos => pos.id !== 1), // Remove the deposit
          totalCollateral: '$4,450' // Update total collateral value
        }))
        localStorage.removeItem('recentWithdrawal')
      }
    }
  }, [isConnected])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  }

  // ===== DISCONNECTED STATE =====
  if (!isConnected) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0605] to-[#1A0F0B]" />
        
        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="max-w-2xl w-full text-center"
          >
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-flex p-6 rounded-3xl mb-8 bg-gradient-to-br from-[#5C0C0B]/20 to-[#7A2214]/10 border border-white/10"
            >
              <Shield className="w-16 h-16 text-[#B86C1B]" />
            </motion.div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block text-white">Private</span>
              <span className="block mt-2 bg-gradient-to-r from-[#B86C1B] via-[#D8933B] to-[#B86C1B] bg-clip-text text-transparent">
                Finance Hub
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-300 mb-12 max-w-xl mx-auto leading-relaxed">
              Connect your wallet to access your private lending dashboard
            </p>

            {/* Connect Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block"
            >
              <CustomConnectButton />
            </motion.div>

            {/* Features */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
            >
              {[
                {
                  title: 'Private Deposits',
                  desc: 'Hidden collateral with zero-knowledge commitments',
                  icon: Download,
                  color: 'from-[#5C0C0B] to-[#7A2214]'
                },
                {
                  title: 'Anonymous Loans',
                  desc: 'Borrow against hidden collateral without revealing details',
                  icon: Upload,
                  color: 'from-[#7A2214] to-[#964A16]'
                },
                {
                  title: 'Secure Withdrawals',
                  desc: 'Withdraw funds while maintaining complete privacy',
                  icon: CreditCard,
                  color: 'from-[#964A16] to-[#B86C1B]'
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-white/10 bg-black/20 group hover:border-white/20 transition-all">
                  <div className={`inline-flex p-3 rounded-lg mb-4 bg-gradient-to-br ${feature.color}/20`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ===== CONNECTED STATE =====
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0605] to-[#1A0F0B]" />
        
        {/* Animated lines */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#B86C1B] to-transparent"
            style={{
              top: `${20 + i * 30}%`,
              left: '0',
              right: '0',
              opacity: 0.1 + i * 0.05
            }}
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <main className="container mx-auto px-5 md:px-7 py-24">
          {/* Stats Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Private <span className="bg-gradient-to-r from-[#B86C1B] to-[#D8933B] bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <div className="flex items-center gap-4 mt-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Connected • {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
                <EyeOff className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Health Factor Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative p-6 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#5C0C0B]/30 to-[#7A2214]/30">
                      <Shield className="w-5 h-5 text-[#B86C1B]" />
                    </div>
                    <span className="text-sm text-gray-400">Health Factor</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-3">
                  {dashboardData.healthFactor.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dashboardData.healthFactor / 3) * 100}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-green-400">Safe</span>
                </div>
                <div className="text-xs text-gray-500">No liquidation risk detected</div>
              </div>
            </motion.div>

            {/* Total Collateral Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative p-6 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#964A16]/30 to-[#B86C1B]/30">
                      <DollarSign className="w-5 h-5 text-[#B86C1B]" />
                    </div>
                    <span className="text-sm text-gray-400">Total Collateral</span>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#B86C1B]" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{dashboardData.totalCollateral}</div>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.3% this month</span>
                </div>
              </div>
            </motion.div>

            {/* Active Loans Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative p-6 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#7A2214]/30 to-[#964A16]/30">
                      <CreditCard className="w-5 h-5 text-[#B86C1B]" />
                    </div>
                    <span className="text-sm text-gray-400">Active Loans</span>
                  </div>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{dashboardData.activeLoans}</div>
                <div className="text-sm text-gray-500">2 loans • Stable position</div>
              </div>
            </motion.div>

            {/* Privacy Score Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative p-6 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#B86C1B]/30 to-[#D8933B]/30">
                      <EyeOff className="w-5 h-5 text-[#B86C1B]" />
                    </div>
                    <span className="text-sm text-gray-400">Privacy Score</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{dashboardData.privacyScore}%</div>
                <div className="text-sm text-green-400">Maximum privacy achieved</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Positions & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Positions Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Active Positions</h2>
                  <p className="text-gray-400">Your private lending positions</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => alert('Filter options:\n\n• By Asset\n• By Type\n• By Date\n• By Status')}
                    className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-sm"
                  >
                    <Filter className="w-4 h-4 inline mr-2" />
                    Filter
                  </button>
                  <Link
                    href="/deposit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#5C0C0B] to-[#7A2214] hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    + New Position
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                {dashboardData.positions.map((position, idx) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ y: -2 }}
                    className="group p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${position.gradient}/20`}>
                          {position.type === 'Deposit' ? (
                            <Download className="w-6 h-6 text-green-400" />
                          ) : (
                            <Upload className="w-6 h-6 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-white">{position.type}</span>
                            <span className="px-2 py-1 rounded text-xs bg-white/5 text-gray-300">
                              {position.asset}
                            </span>
                            <span className={`text-sm flex items-center gap-1 ${
                              parseFloat(position.change) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {parseFloat(position.change) >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {position.change}
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">
                            {position.amount} <span className="text-gray-400 text-lg">({position.value})</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-mono">{position.commitment}</span>
                            <span>•</span>
                            <span>{position.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleViewProof(position)}
                          className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-sm"
                        >
                          View ZK Proof
                        </button>
                        {position.type === 'Loan' && (
                          <>
                            {position.status === 'repaid' || position.canWithdraw ? (
                              <button
                                onClick={() => handleGenerateWithdrawalProof(position)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#B86C1B] to-[#D8933B] hover:opacity-90 transition-opacity text-sm font-medium"
                              >
                                Withdraw
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRepayLoan(position)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#5C0C0B] to-[#7A2214] hover:opacity-90 transition-opacity text-sm font-medium"
                              >
                                Repay
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Quick Actions & Activity */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
              {/* Quick Actions */}
              <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent">
                <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Deposit Collateral', icon: Download, href: '/deposit', color: 'from-green-500/20 to-emerald-500/20' },
                    { label: 'Request Loan', icon: Upload, href: '/borrow', color: 'from-blue-500/20 to-cyan-500/20' },
                    { label: 'Generate Withdrawal Proof', icon: CreditCard, href: '/withdraw', color: 'from-[#964A16]/20 to-[#B86C1B]/20' },
                    { label: 'Submit Solvency Proof', icon: Cpu, href: '#', onClick: () => router.push('/borrow?action=proof'), color: 'from-purple-500/20 to-pink-500/20' }
                  ].map((action, idx) => (
                    <motion.div
                      key={action.label}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {action.href === '#' ? (
                        <button
                          onClick={action.onClick}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                              <action.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{action.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                        </button>
                      ) : (
                        <Link
                          href={action.href}
                          className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                              <action.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{action.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Proof Deadlines Section */}
              <div className="p-6 rounded-2xl border border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Proof Deadlines
                </h3>
                <p className="text-sm text-yellow-300/80 mb-4">
                  Submit solvency proofs to avoid liquidation
                </p>
                <div className="space-y-3">
                  {dashboardData.proofDeadlines.map((deadline, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/30">
                      <div>
                        <div className="font-medium text-white">{deadline.loanId}</div>
                        <div className="text-xs text-gray-400">{deadline.amount} {deadline.asset}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${deadline.dueIn.includes('day') ? 'text-yellow-400' : 'text-red-400'}`}>
                          {deadline.dueIn}
                        </div>
                        <button 
                          onClick={() => router.push('/borrow?action=proof')}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Submit Proof →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{activity.action}</div>
                        <div className="text-sm text-gray-500">{activity.time}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        activity.type === 'success' 
                          ? 'bg-green-500/20 text-green-400' 
                          : activity.type === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                  <button 
                    onClick={() => alert('View full activity log')}
                    className="w-full text-center py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    View All Activity →
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 rounded-2xl border border-white/10 bg-black/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Network Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-400">Live</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">Mantle Network</div>
              <div className="text-sm text-gray-500 mt-2">Optimistic rollup with low fees</div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-black/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Proofs Generated</span>
                <Cpu className="w-4 h-4 text-[#B86C1B]" />
              </div>
              <div className="text-2xl font-bold text-white">14</div>
              <div className="text-sm text-gray-500 mt-2">Last: 2 hours ago</div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-black/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Security Level</span>
                <Shield className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">Maximum</div>
              <div className="text-sm text-gray-500 mt-2">256-bit encryption active</div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}