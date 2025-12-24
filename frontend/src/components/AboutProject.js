'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  Shield, Lock, EyeOff, Zap, 
  ArrowRight, CheckCircle, ChevronRight, 
  Sparkles, X, Info,
  CreditCard, Users, BarChart, KeyRound,
  Brain, Network, ShieldCheck,
  Cpu, Code, Database, Server,
  TrendingUp, Globe, Cpu as Circuit,
  ArrowUpRight
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function EnhancedAboutProject() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const [showDetail, setShowDetail] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const containerRef = useRef(null)

  // Cards data with professional, dull gradient combinations
  const cards = [
    {
      id: 1,
      title: 'Private Deposits',
      icon: Lock,
      description: 'Deposit collateral with zero-knowledge proofs',
      gradient: 'linear-gradient(135deg, #5C0C0B, #7A2214)',
      borderGradient: 'linear-gradient(135deg, #5C0C0B, #952A18)',
      details: [
        'Hidden collateral amounts on-chain',
        'Commitment-based deposit system',
        'Zero-knowledge proof generation',
        'No transaction linkage'
      ],
      stats: '100% Private'
    },
    {
      id: 2,
      title: 'Anonymous Borrowing',
      icon: KeyRound,
      description: 'Borrow against hidden collateral',
      gradient: 'linear-gradient(135deg, #7A2214, #964A16)',
      borderGradient: 'linear-gradient(135deg, #7A2214, #B85A1A)',
      details: [
        'Solvency proofs without disclosure',
        'Private loan issuance',
        'Hidden borrowing positions',
        'Collateral ratio privacy'
      ],
      stats: 'Untraceable'
    },
    {
      id: 3,
      title: 'Periodic Solvency',
      icon: BarChart,
      description: 'Prove solvency without revealing balances',
      gradient: 'linear-gradient(135deg, #964A16, #B86C1B)',
      borderGradient: 'linear-gradient(135deg, #964A16, #D88C27)',
      details: [
        'Regular ZK proof submissions',
        'Automated solvency checks',
        'No balance disclosure required',
        'Privacy-preserving verification'
      ],
      stats: 'ZK Verified'
    },
    {
      id: 4,
      title: 'Private Repayment',
      icon: CreditCard,
      description: 'Repay loans while maintaining anonymity',
      gradient: 'linear-gradient(135deg, #B86C1B, #D8933B)',
      borderGradient: 'linear-gradient(135deg, #B86C1B, #F5A347, #B86C1B)',
      details: [
        'Anonymous repayment transactions',
        'Unlinkable payment history',
        'Hidden repayment amounts',
        'Zero-knowledge settlement'
      ],
      stats: 'Secure'
    },
    {
      id: 5,
      title: 'Secure Withdrawal',
      icon: Shield,
      description: 'Withdraw with complete privacy',
      gradient: 'linear-gradient(135deg, #D8933B, #B86C1B, #964A16)',
      borderGradient: 'linear-gradient(135deg, #D8933B, #7A2214)',
      details: [
        'Private collateral withdrawal',
        'Final proof generation',
        'No withdrawal amount disclosure',
        'Transaction unlinkability'
      ],
      stats: 'Enterprise'
    }
  ]

  // Calculate stacked card positions
  const getCardStyle = (index) => {
    const distance = Math.abs(index - activeCard)
    const isActive = index === activeCard
    const isLeft = index < activeCard
    const isRight = index > activeCard
    
    let translateX = 0
    let scale = 1
    let opacity = 1
    let zIndex = 50 - distance * 10
    
    if (isActive) {
      translateX = dragOffset
      scale = 1
      opacity = 1
      zIndex = 100
    } else if (isLeft) {
      translateX = -(distance * 180) - 60
      scale = 0.85
      opacity = 0.9
    } else if (isRight) {
      translateX = distance * 180 + 60
      scale = 0.85
      opacity = 0.9
    }
    
    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      opacity: Math.max(opacity, 0.2),
      zIndex,
      transition: isDragging ? 'none' : 'all 0.4s ease-out'
    }
  }

  // Drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true)
    setDragStartX(e.type.includes('touch') ? e.touches[0].clientX : e.clientX)
  }

  const handleDragMove = (e) => {
    if (!isDragging) return
    
    const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    const delta = currentX - dragStartX
    setDragOffset(delta)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (Math.abs(dragOffset) > 60) {
      if (dragOffset > 0) {
        setActiveCard(prev => Math.max(prev - 1, 0))
      } else {
        setActiveCard(prev => Math.min(prev + 1, cards.length - 1))
      }
    }
    
    setDragOffset(0)
  }

  // Click on any card to navigate
  const handleCardClick = (index) => {
    if (index === activeCard) {
      setShowDetail(cards[index])
    } else {
      setActiveCard(index)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActiveCard(prev => Math.min(prev + 1, cards.length - 1))
      } else if (e.key === 'ArrowLeft') {
        setActiveCard(prev => Math.max(prev - 1, 0))
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Intersection observer
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

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={containerRef}
      id="about-project"
      className="relative min-h-screen bg-black overflow-hidden"
    >
      {/* Clean black background only */}
      <div className="absolute inset-0 bg-black" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header section */}
          <div className="text-center mb-16">
            <div 
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/50 border border-white/10 mb-8 transition-all duration-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-[#964A16]" />
              <span className="text-sm font-medium text-white tracking-wider">
                VEIL CREDIT PROTOCOL
              </span>
              <div className="w-2 h-2 rounded-full bg-[#B86C1B]" />
            </div>

            <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-700 delay-200 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <span className="block text-white">Privacy-Preserving</span>
              <span className="block mt-2 text-white">Lending Protocol</span>
            </h1>

            <div className={`h-px mb-8 max-w-2xl mx-auto transition-all duration-700 delay-300 ${
              isVisible ? 'w-full opacity-100' : 'w-0 opacity-0'
            }`} 
            style={{ background: 'linear-gradient(90deg, transparent, #B86C1B, transparent)' }} />

            <p className={`text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              A revolutionary lending protocol where all operations remain{' '}
              <span className="font-semibold text-white">completely unlinkable</span> on-chain.
            </p>
          </div>

          {/* Stacked Cards Carousel */}
          <div className="relative h-[500px] mb-24">
            {/* Cards container */}
            <div 
              className="relative h-full flex items-center justify-center"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              {cards.map((card, index) => {
                const style = getCardStyle(index)
                const isActive = index === activeCard
                
                return (
                  <div
                    key={card.id}
                    className={`absolute w-[420px] h-[420px] cursor-pointer transition-all duration-400`}
                    style={style}
                    onClick={() => handleCardClick(index)}
                  >
                    <div className={`relative w-full h-full rounded-2xl transition-all duration-300 overflow-hidden ${
                      isActive
                        ? 'shadow-xl'
                        : ''
                    }`}>
                      
                      {/* Solid gradient card background */}
                      <div 
                        className="absolute inset-0"
                        style={{ background: card.gradient }}
                      />
                      
                      {/* Gradient border effect */}
                      <div className="absolute -inset-px rounded-2xl opacity-50"
                        style={{ background: card.borderGradient }}
                      />
                      
                      {/* Card content */}
                      <div className="relative z-10 h-full p-8 flex flex-col">
                        {/* Card header */}
                        <div className="flex items-start justify-between mb-6">
                          <div 
                            className="w-16 h-16 rounded-xl flex items-center justify-center bg-black/30 backdrop-blur-sm"
                          >
                            <card.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-xl font-bold text-white/40">
                            0{card.id}
                          </div>
                        </div>

                        {/* Card title */}
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {card.title}
                        </h3>

                        {/* Card description */}
                        <p className="text-white/90 mb-6">
                          {card.description}
                        </p>

                        {/* Stats */}
                        <div className="text-4xl font-bold mb-auto text-white">
                          {card.stats}
                        </div>

                        {/* Click indicator */}
                        {isActive ? (
                          <div className="flex items-center justify-between text-white/70 text-sm pt-4 border-t border-white/30">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              <span>Click for details</span>
                            </div>
                            <div className="text-white/50">
                              Card {index + 1}/{cards.length}
                            </div>
                          </div>
                        ) : (
                          <div className="text-white/50 text-sm pt-4 border-t border-white/20">
                            Click to select
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigation dots */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              {cards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCard(index)}
                  className="group p-1"
                >
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeCard ? 'scale-125' : ''
                    }`}
                    style={{ 
                      background: index === activeCard 
                        ? card.gradient
                        : '#ffffff40' 
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-sm text-gray-500">
                Drag cards • Click dots • Click any card to select • Active card for details
              </p>
            </div>
          </div>

          {/* Features grid - Clean without gradient backgrounds */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {[
              {
                icon: Brain,
                title: 'Zero-Knowledge',
                description: 'Advanced cryptography with ZK-SNARKs',
                gradient: 'linear-gradient(135deg, #7A2214, #964A16)'
              },
              {
                icon: Network,
                title: 'Decentralized',
                description: 'Trustless execution on Ethereum',
                gradient: 'linear-gradient(135deg, #964A16, #B86C1B)'
              },
              {
                icon: ShieldCheck,
                title: 'Enterprise Grade',
                description: 'Bank-level security guarantees',
                gradient: 'linear-gradient(135deg, #B86C1B, #D8933B)'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: feature.gradient }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Tech Stack Visualization */}
          <div className={`mt-16 pt-16 border-t border-white/10 transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-white mb-4">Technical Architecture</h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Built on cutting-edge privacy technologies
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Circom', color: '#7A2214', width: '90%', icon: Circuit },
                { name: 'SnarkJS', color: '#964A16', width: '85%', icon: Cpu },
                { name: 'Solidity', color: '#B86C1B', width: '95%', icon: Code },
                { name: 'Merkle Trees', color: '#D8933B', width: '88%', icon: Database },
              ].map((tech, index) => (
                <motion.div 
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: tech.color + '20' }}>
                      {tech.icon && <tech.icon className="w-4 h-4" style={{ color: tech.color }} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">{tech.name}</span>
                        <span className="text-gray-400">{tech.width}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 delay-300"
                          style={{ 
                            width: isVisible ? tech.width : '0%',
                            backgroundColor: tech.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Protocol Stats */}
          <div className={`mt-16 pt-16 border-t border-white/10 transition-all duration-700 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { 
                  value: 'Zero', 
                  label: 'On-Chain Linkages', 
                  icon: EyeOff,
                  description: 'No transaction links between operations'
                },
                { 
                  value: '100%', 
                  label: 'Privacy Guarantee', 
                  icon: Shield,
                  description: 'Complete financial privacy'
                },
                { 
                  value: 'ZK', 
                  label: 'Proof System', 
                  icon: Brain,
                  description: 'Zero-knowledge cryptography'
                },
                { 
                  value: 'Immutable', 
                  label: 'Verification', 
                  icon: Lock,
                  description: 'On-chain verification guarantees'
                },
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center p-6 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <div className="inline-flex p-3 rounded-lg mb-4" style={{ background: 'linear-gradient(135deg, #7A2214, #B86C1B)' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-gray-300 text-sm mb-2">{stat.label}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                      {stat.description}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Enhanced Call-to-Action Section */}
          <div className={`mt-20 text-center transition-all duration-700 delay-900 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.9 }}
              className="max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-black/60 to-transparent border border-white/10 relative overflow-hidden group"
            >
              {/* Animated background elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              
              <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#B86C1B]" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Experience True Financial Privacy?
              </h3>
              <p className="text-gray-300 mb-8">
                Connect your wallet and start your journey with completely private lending operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/dashboard"
                  className="group relative px-8 py-3 rounded-lg font-medium text-white transition-all overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #7A2214, #B86C1B)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    Explore Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                <a 
                  href="/deposit"
                  className="group px-8 py-3 rounded-lg font-medium border transition-colors border-white/20 hover:border-white/40 text-white hover:bg-white/5"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Private Deposit
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-6">
                No personal data required • Completely anonymous • Non-custodial
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80"
            onClick={() => setShowDetail(null)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-xl overflow-hidden border border-white/20">
            {/* Modal background */}
            <div 
              className="absolute inset-0"
              style={{ background: showDetail.gradient }}
            />
            
            {/* Modal content */}
            <div className="relative z-10">
              {/* Modal header */}
              <div className="p-6 border-b border-white/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center bg-black/30"
                    >
                      <showDetail.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {showDetail.title}
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        {showDetail.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetail(null)}
                    className="p-2 rounded hover:bg-black/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal content */}
              <div className="p-6">
                {/* Stats highlight */}
                <div 
                  className="p-4 rounded-lg mb-6 bg-black/30 backdrop-blur-sm"
                >
                  <div className="text-3xl font-bold text-white mb-1">
                    {showDetail.stats}
                  </div>
                  <p className="text-white/70 text-sm">
                    Privacy level guarantee
                  </p>
                </div>

                {/* Features list */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                  <div className="space-y-3">
                    {showDetail.details.map((detail, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3"
                      >
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-white"
                        />
                        <span className="text-white/90 text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-3 rounded-lg font-medium text-white text-sm transition-all hover:opacity-90 bg-black/50 hover:bg-black/60"
                  >
                    Learn More
                  </button>
                  <button
                    onClick={() => setShowDetail(null)}
                    className="flex-1 py-3 rounded-lg font-medium text-white bg-black/30 hover:bg-black/40 transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}