import { ponder } from "ponder:registry";
import { 
  liquidityDeposit, 
  userTokenStats, 
  protocolStats, 
  loan 
} from "../ponder.schema";

// ============ LIQUIDITY DEPOSITS ============
ponder.on("LendingEngine:LiquidityDeposited", async ({ event, context }) => {
  // Record the liquidity deposit event
  await context.db.insert(liquidityDeposit).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    tokenAddress: event.args.tokenAddress,
    amountDeposited: event.args.amountDeposited,
    lpTokenMinted: event.args.lpTokenMinted,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
  });

  // Update or create user stats
  const userStatsId = `${event.args.user}-${event.args.tokenAddress}`.toLowerCase();
  
  const existingStats = await context.db
    .select()
    .from(userTokenStats)
    .where((row) => row.id === userStatsId)
    .limit(1);

  if (existingStats.length > 0) {
    await context.db
      .update(userTokenStats, { id: userStatsId })
      .set({
        totalDeposited: existingStats[0].totalDeposited + event.args.amountDeposited,
        lpTokenBalance: existingStats[0].lpTokenBalance + event.args.lpTokenMinted,
        lastUpdated: event.block.timestamp,
      });
  } else {
    await context.db.insert(userTokenStats).values({
      id: userStatsId,
      user: event.args.user,
      tokenAddress: event.args.tokenAddress,
      totalDeposited: event.args.amountDeposited,
      totalBorrowed: 0n,
      lpTokenBalance: event.args.lpTokenMinted,
      lastUpdated: event.block.timestamp,
    });
  }

  // Update protocol stats
  const existingProtocolStats = await context.db
    .select()
    .from(protocolStats)
    .where((row) => row.id === "singleton")
    .limit(1);

  if (existingProtocolStats.length > 0) {
    await context.db
      .update(protocolStats, { id: "singleton" })
      .set({
        totalSupply: existingProtocolStats[0].totalSupply + event.args.amountDeposited,
        updatedAt: event.block.timestamp,
      });
  } else {
    await context.db.insert(protocolStats).values({
      id: "singleton",
      totalBorrow: 0n,
      totalReserves: 0n,
      totalSupply: event.args.amountDeposited,
      updatedAt: event.block.timestamp,
    });
  }
});

// ============ LOAN BORROWED ============
ponder.on("LendingEngine:LoanBorrowed", async ({ event, context }) => {
  // Create loan record
  await context.db.insert(loan).values({
    id: event.args.nullifierHash_,
    recipient: event.args.recepient,
    borrowAmount: 0n,
    tokenId: 0n,
    minimumCollateralUsed: 0n,
    startTime: event.args.timestamp,
    isLiquidated: 0,
    repaid: 0,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
  });

  // Update protocol stats timestamp
  const existingProtocolStats = await context.db
    .select()
    .from(protocolStats)
    .where((row) => row.id === "singleton")
    .limit(1);

  if (existingProtocolStats.length > 0) {
    await context.db
      .update(protocolStats, { id: "singleton" })
      .set({
        updatedAt: event.block.timestamp,
      });
  } else {
    await context.db.insert(protocolStats).values({
      id: "singleton",
      totalBorrow: 0n,
      totalReserves: 0n,
      totalSupply: 0n,
      updatedAt: event.block.timestamp,
    });
  }
});