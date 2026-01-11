import { getLendingEngine } from "../lib/lendingEngine";

export async function getProtocolStats() {
  const engine = await getLendingEngine();

  const [totalSupply, totalBorrow, totalReserves] = await Promise.all([
    engine.getTotalSupply.staticCall(),
    engine.getTotalBorrow.staticCall(),
    engine.getTotalReserves.staticCall()
  ]);

  return {
    totalSupply: totalSupply.toString(),
    totalBorrow: totalBorrow.toString(),
    totalReserves: totalReserves.toString()
  };
}
