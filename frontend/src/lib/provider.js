import { ethers } from "ethers";

export function getProvider() {
  if (typeof window === "undefined") {
    throw new Error("Provider must be used in browser");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  return new ethers.BrowserProvider(window.ethereum);
}
