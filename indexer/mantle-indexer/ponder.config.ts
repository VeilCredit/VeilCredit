import { createConfig } from "ponder";
import {http} from "viem"
import { StealthVaultAbi } from "./abis/StealthVaultAbi";
import { LendingEngineAbi } from "./abis/LendingEngineAbi";

export default createConfig({
  database: {
  kind: "postgres",
  connectionString: "postgresql://localhost:5432/ponder",
  },
  chains: {
    anvil: {
      id: 31337,
      rpc: process.env.PONDER_RPC_URL_1!,
    },
  },
  contracts: {
    LendingEngine: {
      chain: "anvil",
      abi: LendingEngineAbi,
      address: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
      startBlock: 0,
    },
    StealthVault: {
      chain: "anvil",
      abi: StealthVaultAbi,
      address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
      startBlock: 0,
    }
  },
});
