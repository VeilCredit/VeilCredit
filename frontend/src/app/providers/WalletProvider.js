'use client'

import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mainnet, sepolia } from 'wagmi/chains'

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css'

// Create query client
const queryClient = new QueryClient()

// Configure RainbowKit
const config = getDefaultConfig({
  appName: 'VeilCredit Protocol',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [sepolia, mainnet],
  ssr: true,
})

// Create custom theme using ONLY supported properties
// Check what properties your version supports
const customTheme = darkTheme({
  // Try these properties one by one
  // borderRadius: 'large',
  // fontStack: 'system',
  // overlayBlur: 'small',
})

export function WalletProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={customTheme}
          initialChain={sepolia}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}