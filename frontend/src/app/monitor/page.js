'use client'

import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Activity, AlertTriangle, Shield, Eye, Zap,
  TrendingDown, TrendingUp, Users, Clock, Filter,
  RefreshCw, ChevronRight, BarChart3, DollarSign,
  Network, Cpu, Database, ExternalLink, Search,
  CheckCircle2, XCircle, AlertCircle, Skull,
  Download, Upload, CreditCard, ArrowRight,
  Info, Settings, Bell, Menu, X
} from 'lucide-react'

export default function MonitorPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'at-risk', 'healthy'
  const [searchTerm, setSearchTerm] = useState('')
  
  // Mock data - In real app, this would come from backend/contracts
  const [monitorData, setMonitorData] = useState({
    systemHealth: {
      tvl: '$12.5M',
      totalLoans: '$4.2M',
      activePositions: 342,
      averageHealthFactor: 2.4,
      liquidationsToday: 3
    },
    positions: [
      {
        id: 'POS-001',
        commitment: '0x8f3a...c4d2',
        healthFactor: 0.89,
        collateral: '3.2 ETH',
        loan: '2,800 USDC',
        lastProof: '2 hours ago',
        nextProofDue: '5 days',
        status: 'at-risk',
        owner: '0x7a3b...9d1e',
        gradient: 'from-red-500/20 to-orange-500/20'
      },
      {
        id: 'POS-002',
        commitment: '0x5e9b...f8a1',
        healthFactor: 1.45,
        collateral: '2.5 ETH',
        loan: '1,500 USDC',
        lastProof: '1 day ago',
        nextProofDue: '6 days',
        status: 'warning',
        owner: '0x4c2d...8f3a',
        gradient: 'from-yellow-500/20 to-amber-500/20'
      },
      {
        id: 'POS-003',
        commitment: '0x3a7b...d9e2',
        healthFactor: 2.85,
        collateral: '5.0 ETH',
        loan: '2,200 USDC',
        lastProof: '3 hours ago',
        nextProofDue: '7 days',
        status: 'healthy',
        owner: '0x9e1f...2c4d',
        gradient: 'from-green-500/20 to-emerald-500/20'
      },
      {
        id: 'POS-004',
        commitment: '0x2b8c...f7e9',
        healthFactor: 0.75,
        collateral: '1.8 ETH',
        loan: '1,700 USDC',
        lastProof: '3 days ago',
        nextProofDue: 'OVERDUE',
        status: 'critical',
        owner: '0x6d3a...9b2c',
        gradient: 'from-red-900/20 to-rose-700/20'
      },
      {
        id: 'POS-005',
        commitment: '0x9d2e...5a8b',
        healthFactor: 1.95,
        collateral: '4.2 ETH',
        loan: '2,500 USDC',
        lastProof: '12 hours ago',
        nextProofDue: '4 days',
        status: 'healthy',
        owner: '0x3e4f...7d1a',
        gradient: 'from-green-500/20 to-emerald-500/20'
      }
    ],
    recentLiquidations: [
      {
        id: 'LIQ-001',
        positionId: 'POS-008',
        liquidatedAt: '2 hours ago',
        collateralSeized: '1.2 ETH',
        loanCovered: '1,000 USDC',
        liquidator: '0x8a2b...3d4e'
      },
      {
        id: 'LIQ-002',
        positionId: 'POS-012',
        liquidatedAt: '5 hours ago',
        collateralSeized: '0.8 ETH',
        loanCovered: '750 USDC',
        liquidator: '0x5c3d...9e1f'
      }
    ]
  })
  
  const refreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setMonitorData(prev => ({
        ...prev,
        systemHealth: {
          ...prev.systemHealth,
          liquidationsToday: prev.systemHealth.liquidationsToday + 1
        }
      }))
      setIsRefreshing(false)
    }, 1500)
  }
  
  const handleLiquidate = (position) => {
    if (confirm(`Initiate liquidation for position ${position.id}?\n\nHealth Factor: ${position.healthFactor}\nCollateral: ${position.collateral}\nLoan: ${position.loan}\n\nThis action cannot be undone.`)) {
      alert(`Liquidation triggered for ${position.id}\n\nIn real app:\n1. Call Chainlink Keepers\n2. Liquidate minimum required collateral\n3. Update position status`)
      
      // Update position status
      setMonitorData(prev => ({
        ...prev,
        positions: prev.positions.filter(p => p.id !== position.id),
        recentLiquidations: [{
          id: `LIQ-00${prev.recentLiquidations.length + 1}`,
          positionId: position.id,
          liquidatedAt: 'Just now',
          collateralSeized: position.collateral.split(' ')[0] + ' ETH',
          loanCovered: position.loan.split(' ')[0] + ' USDC',
          liquidator: address || '0x...'
        }, ...prev.recentLiquidations],
        systemHealth: {
          ...prev.systemHealth,
          liquidationsToday: prev.systemHealth.liquidationsToday + 1
        }
      }))
    }
  }
  
  const filteredPositions = monitorData.positions.filter(position => {
    // Filter by status
    if (filter === 'at-risk' && position.status !== 'at-risk' && position.status !== 'critical') return false
    if (filter === 'healthy' && position.status !== 'healthy') return false
    
    // Filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        position.id.toLowerCase().includes(searchLower) ||
        position.commitment.toLowerCase().includes(searchLower) ||
        position.owner.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'at-risk': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }
  
  const getHealthFactorColor = (healthFactor) => {
    if (healthFactor < 1.0) return 'text-red-400'
    if (healthFactor < 1.5) return 'text-orange-400'
    if (healthFactor < 2.0) return 'text-yellow-400'
    return 'text-green-400'
  }
  
  // Redirect if not connected (optional for monitor page)
  useEffect(() => {
    if (!isConnected) {
      // router.push('/dashboard')
      // Or show a message
    }
  }, [isConnected, router])
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
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
              opacity: 0.05 + i * 0.02
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 30 + i * 10,
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
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  System <span className="bg-gradient-to-r from-[#B86C1B] to-[#D8933B] bg-clip-text text-transparent">Monitor</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Monitor protocol health, at-risk positions, and trigger liquidations.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshData}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm">Refresh</span>
                </button>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#B86C1B] w-64"
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* System Health Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          >
            {/* TVL Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Total Value Locked</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{monitorData.systemHealth.tvl}</div>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+5.2% this week</span>
              </div>
            </div>
            
            {/* Active Positions Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Active Positions</span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{monitorData.systemHealth.activePositions}</div>
              <div className="text-sm text-gray-500">
                {filteredPositions.filter(p => p.status === 'critical').length} critical
              </div>
            </div>
            
            {/* Average Health Factor Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Avg Health Factor</span>
                <Activity className="w-5 h-5 text-[#B86C1B]" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{monitorData.systemHealth.averageHealthFactor}</div>
              <div className="text-sm text-gray-500">
                <span className="text-green-400">Safe</span> overall
              </div>
            </div>
            
            {/* Total Loans Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Total Loans</span>
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{monitorData.systemHealth.totalLoans}</div>
              <div className="text-sm text-gray-500">
                Active loan volume
              </div>
            </div>
            
            {/* Liquidations Today Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Liquidations Today</span>
                <Skull className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{monitorData.systemHealth.liquidationsToday}</div>
              <div className="text-sm text-gray-500">
                Triggered by keepers
              </div>
            </div>
          </motion.div>
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-[#5C0C0B] to-[#7A2214] text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              All Positions
            </button>
            <button
              onClick={() => setFilter('at-risk')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'at-risk' 
                  ? 'bg-gradient-to-r from-red-900/30 to-rose-700/30 text-red-400 border border-red-500/20' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              At Risk ({monitorData.positions.filter(p => p.status === 'at-risk' || p.status === 'critical').length})
            </button>
            <button
              onClick={() => setFilter('healthy')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'healthy' 
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-700/30 text-green-400 border border-green-500/20' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Healthy ({monitorData.positions.filter(p => p.status === 'healthy').length})
            </button>
          </div>
          
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Positions List */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Active Positions</h2>
                  <div className="text-gray-400">
                    {filteredPositions.length} of {monitorData.positions.length} positions
                  </div>
                </div>
                
                {filteredPositions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPositions.map((position, idx) => (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-6 rounded-xl border transition-all ${
                          position.status === 'critical' 
                            ? 'border-red-500/30 bg-gradient-to-r from-red-900/10 to-rose-800/10' 
                            : position.status === 'at-risk'
                            ? 'border-orange-500/30 bg-gradient-to-r from-orange-900/10 to-amber-800/10'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-xl font-bold text-white">{position.id}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(position.status)} bg-white/5`}>
                                {position.status.toUpperCase()}
                              </span>
                              <span className={`text-lg font-bold ${getHealthFactorColor(position.healthFactor)}`}>
                                HF: {position.healthFactor}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-gray-400 text-sm">Collateral</p>
                                <p className="text-lg font-semibold text-white">{position.collateral}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Loan</p>
                                <p className="text-lg font-semibold text-white">{position.loan}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Last Proof</p>
                                <p className="text-lg font-semibold text-white">{position.lastProof}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Next Proof</p>
                                <p className={`text-lg font-semibold ${
                                  position.nextProofDue === 'OVERDUE' ? 'text-red-400' : 'text-white'
                                }`}>
                                  {position.nextProofDue}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-gray-300">{position.commitment}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400">Owner:</span>
                                <span className="font-mono text-gray-300">{position.owner}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            {position.status === 'critical' || position.status === 'at-risk' ? (
                              <button
                                onClick={() => handleLiquidate(position)}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-700 to-red-900 hover:opacity-90 transition-opacity text-white font-medium flex items-center justify-center gap-2"
                              >
                                <Skull className="w-4 h-4" />
                                Liquidate
                              </button>
                            ) : (
                              <button
                                onClick={() => alert(`Position ${position.id} is healthy.\nHealth Factor: ${position.healthFactor}`)}
                                className="px-6 py-3 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors font-medium"
                              >
                                Healthy
                              </button>
                            )}
                            
                            <button
                              onClick={() => alert(`View detailed analytics for ${position.id}`)}
                              className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-sm"
                            >
                              View Analytics
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Positions Found</h3>
                    <p className="text-gray-500">
                      {filter === 'all' 
                        ? 'No positions in the system' 
                        : `No ${filter} positions found`}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Right Column: Recent Liquidations & Stats */}
            <div className="space-y-8">
              {/* Recent Liquidations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-900/10 to-transparent"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Skull className="w-6 h-6 text-red-400" />
                  Recent Liquidations
                </h2>
                
                <div className="space-y-4">
                  {monitorData.recentLiquidations.map((liquidation, idx) => (
                    <div key={liquidation.id} className="p-4 rounded-xl bg-black/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-white">{liquidation.id}</span>
                        <span className="text-sm text-gray-400">{liquidation.liquidatedAt}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Position:</span>
                          <span className="text-white">{liquidation.positionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Collateral Seized:</span>
                          <span className="text-red-300">{liquidation.collateralSeized}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Loan Covered:</span>
                          <span className="text-green-300">{liquidation.loanCovered}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Liquidator:</span>
                          <span className="font-mono text-sm text-gray-300">{liquidation.liquidator}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {/* Chainlink Keepers Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent"
              >
                <h3 className="text-lg font-semibold text-white mb-6">Automation Status</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <Zap className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Chainlink Keepers</p>
                        <p className="text-sm text-gray-400">Automated liquidation</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Check Interval</p>
                        <p className="text-sm text-gray-400">Every 15 minutes</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">24/7</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Cpu className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Proof Monitoring</p>
                        <p className="text-sm text-gray-400">Solvency verification</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">Real-time</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Liquidations are automated. Manual triggers are for emergencies only.
                  </div>
                </div>
              </motion.div>
              
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-transparent"
              >
                <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => alert('Generating system health report...')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Generate Report</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => alert('Viewing all critical positions...')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="font-medium">View Critical Only</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => alert('Exporting position data...')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                        <Download className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Export Data</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}