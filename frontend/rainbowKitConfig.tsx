"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { anvil, sepolia } from "wagmi/chains"

export default getDefaultConfig({
    appName: "DEFI PROTOCOL",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT!, // the "!" mark shows that this thing will 100% exist
    chains: [anvil, sepolia],
    ssr: false
})