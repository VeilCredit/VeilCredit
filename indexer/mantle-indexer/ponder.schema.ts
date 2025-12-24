import { onchainTable } from "ponder";

// ============ LENDING ENGINE TABLES ============

export const protocolStats = onchainTable("protocol_stats", (t) => ({
  id: t.text().primaryKey(), // "singleton"
  totalBorrow: t.bigint().notNull(),
  totalReserves: t.bigint().notNull(),
  totalSupply: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
}));

export const liquidityDeposit = onchainTable("liquidity_deposit", (t) => ({
  id: t.text().primaryKey(), // tx hash + log index
  user: t.text().notNull(),
  tokenAddress: t.text().notNull(),
  amountDeposited: t.bigint().notNull(),
  lpTokenMinted: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
}));

export const loan = onchainTable("loan", (t) => ({
  id: t.text().primaryKey(), // nullifierHash
  recipient: t.text().notNull(),
  borrowAmount: t.bigint().notNull(),
  tokenId: t.bigint().notNull(),
  minimumCollateralUsed: t.bigint().notNull(),
  startTime: t.bigint().notNull(),
  isLiquidated: t.integer().notNull(), // 0 or 1 (SQLite doesn't have boolean)
  repaid: t.integer().notNull(), // 0 or 1
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
}));

export const userTokenStats = onchainTable("user_token_stats", (t) => ({
  id: t.text().primaryKey(), // user address + token address
  user: t.text().notNull(),
  tokenAddress: t.text().notNull(),
  totalDeposited: t.bigint().notNull(),
  totalBorrowed: t.bigint().notNull(),
  lpTokenBalance: t.bigint().notNull(),
  lastUpdated: t.bigint().notNull(),
}));

// ============ STEALTH VAULT TABLES ============

export const stealthDeposit = onchainTable("stealth_deposit", (t) => ({
  id: t.text().primaryKey(), // commitment hash
  commitment: t.text().notNull(),
  insertedIndex: t.integer().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
}));

export const stealthWithdrawal = onchainTable("stealth_withdrawal", (t) => ({
  id: t.text().primaryKey(), // tx hash + log index
  withdrawer: t.text().notNull(),
  amount: t.bigint().notNull(),
  nullifierHash: t.text().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
}));

export const commitmentUsage = onchainTable("commitment_usage", (t) => ({
  id: t.text().primaryKey(), // commitment hash
  commitment: t.text().notNull(),
  isUsed: t.integer().notNull(), // 0 or 1
  usedAt: t.bigint(),
  usedInTx: t.text(),
}));