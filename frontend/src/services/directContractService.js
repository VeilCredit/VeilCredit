// // services/directContractService.js
// import { ethers } from 'ethers';

// const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/your-infura-key';
// const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LENDING_ENGINE_ADDRESS;

// // Function signatures (first 4 bytes of keccak256 hash)
// const FUNCTION_SIGNATURES = {
//   getTotalSupply: '0x18160ddd', // keccak256('getTotalSupply()')
//   getTotalBorrow: '0x4b3ec705', // keccak256('getTotalBorrow()')
//   getTotalReserves: '0x11b71a0e' // keccak256('getTotalReserves()')
// };

// export async function getProtocolStatsDirect() {
//   try {
//     const provider = new ethers.JsonRpcProvider(RPC_URL);
    
//     // Make direct eth_call RPC requests
//     const calls = await Promise.all([
//       provider.call({
//         to: CONTRACT_ADDRESS,
//         data: '0x' + FUNCTION_SIGNATURES.getTotalSupply
//       }),
//       provider.call({
//         to: CONTRACT_ADDRESS,
//         data: '0x' + FUNCTION_SIGNATURES.getTotalBorrow
//       }),
//       provider.call({
//         to: CONTRACT_ADDRESS,
//         data: '0x' + FUNCTION_SIGNATURES.getTotalReserves
//       })
//     ]);
    
//     // Decode the uint256 results
//     const decoder = ethers.AbiCoder.defaultAbiCoder();
    
//     const totalSupply = decoder.decode(['uint256'], calls[0])[0];
//     const totalBorrow = decoder.decode(['uint256'], calls[1])[0];
//     const totalReserves = decoder.decode(['uint256'], calls[2])[0];
    
//     console.log("Direct RPC call results:", {
//       totalSupply: totalSupply.toString(),
//       totalBorrow: totalBorrow.toString(),
//       totalReserves: totalReserves.toString()
//     });
    
//     return {
//       totalSupply: totalSupply.toString(),
//       totalBorrow: totalBorrow.toString(),
//       totalReserves: totalReserves.toString()
//     };
    
//   } catch (error) {
//     console.error("Direct RPC call failed:", error);
//     return {
//       totalSupply: "0",
//       totalBorrow: "0",
//       totalReserves: "0"
//     };
//   }
// }