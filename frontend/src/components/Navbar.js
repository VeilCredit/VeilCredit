'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  Menu, X, Home, CreditCard, Download, Upload, 
  Info, Shield, Zap, DollarSign, ArrowRightToLine, Activity
} from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll visibility logic
  useEffect(() => {
    if (!mounted) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const windowHeight = window.innerHeight
      setIsVisible(currentScrollY > windowHeight * 0.7)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: CreditCard },
    { name: 'Deposit', href: '/deposit', icon: Download },
    { name: 'Borrow', href: '/borrow', icon: Upload },
    { name: 'Repay', href: '/repay', icon: DollarSign },
    { name: 'Withdraw', href: '/withdraw', icon: ArrowRightToLine },
    { name: 'Monitor', href: '/monitor', icon: Activity },
    { name: 'About', href: '/#about', icon: Info },
  ]

  if (!mounted || (pathname === '/' && !isVisible)) {
    return null
  }

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/90 border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#5C0C0B]/20 to-[#7A2214]/10 border border-white/10 group-hover:border-white/20 transition-colors">
                <Shield className="w-5 h-5 text-[#964A16]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">VeilCredit</span>
                <span className="text-xs text-gray-400 font-normal">Private Lending</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'text-white bg-white/5' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Wallet Connection with Gradient */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <ConnectButton.Custom>
                  {({ account, chain, openConnectModal, mounted }) => {
                    const ready = mounted
                    const connected = ready && account && chain

                    return (
                      <div {...(!ready && { style: { opacity: 0 } })}>
                        {!connected ? (
                          <button
                            onClick={openConnectModal}
                            className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 relative overflow-hidden group"
                            style={{
                              background: 'linear-gradient(135deg, #5C0C0B 0%, #7A2214 50%, #964A16 100%)',
                              border: '1px solid rgba(122, 34, 20, 0.4)',
                              color: 'white'
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span className="relative flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Connect Wallet
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm text-gray-300 font-mono">
                              {account.address.slice(0, 6)}...{account.address.slice(-4)}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  }}
                </ConnectButton.Custom>
              </div>
              
              {/* Mobile menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-lg">
            <div className="container mx-auto px-6 py-4">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'text-white bg-white/5' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      {isVisible && <div className="h-16" />}
    </>
  )
}