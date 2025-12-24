import { ponder } from "ponder:registry";
import { 
  stealthDeposit, 
  stealthWithdrawal, 
  commitmentUsage 
} from "../ponder.schema";

// ============ STEALTH DEPOSITS ============
ponder.on("StealthVault:Deposit", async ({ event, context }) => {
  // Record the deposit
  await context.db.insert(stealthDeposit).values({
    id: event.args.commitment,
    commitment: event.args.commitment,
    insertedIndex: event.args.insertedIndex,
    timestamp: event.args.timeStamp,
    blockNumber: event.block.number,
  });

  // Track commitment usage
  await context.db.insert(commitmentUsage).values({
    id: event.args.commitment,
    commitment: event.args.commitment,
    isUsed: 0,
    usedAt: null,
    usedInTx: null,
  });
});

// ============ STEALTH WITHDRAWALS ============
ponder.on("StealthVault:DepositWithdrawn", async ({ event, context }) => {
  await context.db.insert(stealthWithdrawal).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    withdrawer: event.args.withdrawer,
    amount: event.args.amount,
    nullifierHash: event.transaction.hash,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
  });
});
