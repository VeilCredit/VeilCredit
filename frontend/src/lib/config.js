import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

//  ANVIL / LOCALHOST CHAIN 

export const anvil = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
})


// WAGMI CONFIG 

export const config = createConfig({
  chains: [anvil],
  transports: {
    [anvil.id]: http('http://localhost:8545'),
  },
  ssr: true, 
})