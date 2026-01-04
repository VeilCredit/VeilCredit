import { ethers } from "ethers";
import ERC20ABI from "@/abis/ERC20.json";

export function getERC20(tokenAddress, signerOrProvider) {
  return new ethers.Contract(tokenAddress, ERC20ABI, signerOrProvider);
}
