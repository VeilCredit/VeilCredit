'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Zap } from 'lucide-react'

export default function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 relative overflow-hidden group"
                    style={{
                      background: 'linear-gradient(135deg, #5C0C0B 0%, #7A2214 50%, #964A16 100%)',
                      border: '1px solid rgba(122, 34, 20, 0.4)',
                      color: 'white'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative flex items-center justify-center gap-3">
                      <Zap className="w-5 h-5" />
                      Connect Wallet to View Dashboard
                    </span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-6 py-3 rounded-lg font-medium text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm bg-white/5 hover:bg-white/10 transition-colors text-white"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 14, height: 14 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-gray-300">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #5C0C0B 0%, #7A2214 50%, #964A16 100%)',
                      border: '1px solid rgba(122, 34, 20, 0.4)',
                      color: 'white'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/80" />
                      {account.displayName}
                      {account.displayBalance ? ` (${account.displayBalance})` : ''}
                    </span>
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}