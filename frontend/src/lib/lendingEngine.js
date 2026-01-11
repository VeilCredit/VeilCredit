import { ethers } from "ethers";
import LendingEngineABI from "../abis/LendingEngine.json";

export async function getLendingEngine(signerOrProvider) {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  return new ethers.Contract(
    process.env.NEXT_PUBLIC_LENDING_ENGINE_ADDRESS,
    LendingEngineABI,
    signerOrProvider,
    provider
  );
}
