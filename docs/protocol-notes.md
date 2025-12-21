# Protocol Notes — ZK Private Lending (Internal)

> ⚠️ Internal protocol notes for hackathon development.  
> This document reflects the current implementation and may evolve.

---

## 1. Overview

VeilCredit enables fully anonymous on-chain lending using zero-knowledge proofs.

Users deposit collateral and interact with the lending engine by proving eligibility instead of revealing identity or collateral amounts. The protocol enforces borrowing, periodic health checks, repayment, withdrawal, and liquidation entirely via cryptographic proofs.

---

## 2. Core Components

### Collateral Vault
- Locks user collateral
- Releases funds upon valid withdrawal proofs

### Deposit Merkle Tree
- Stores private deposit commitments

### Lending Engine
- Handles borrow, repay, and liquidation logic

### ZK Prover
- Generates zero-knowledge proofs for protocol actions

### On-chain Verifiers
- Verify submitted proofs

### Repayment Merkle Tree
- Stores repayment commitments after loans are repaid

### Chainlink Price Oracle & Keepers
- Oracle provides asset prices
- Keepers update price snapshots and check proof deadlines
- Keepers **do not** make lending or liquidation decisions

---

## 3. User Flow

### Deposit Collateral
- User generates a **secret** and **nullifier**
- Commitment is derived from these values
- User deposits collateral
- Commitment is inserted into the **deposit Merkle tree**
- Merkle root is updated on-chain

---

### Borrow Loan
- User generates a **proof of solvency**
- Proof verifies:
  - A valid commitment exists in the deposit tree
  - Collateral is sufficient
- Proof is verified on-chain
- Price used in proof comes from the on-chain **Chainlink price snapshot**
- Upon successful verification:
  - Loan is granted
  - Lending engine stores:
    - Loan amount
    - Nullifier hash
    - Minimum collateral liquidatable if rules are violated

---

### Periodic Health Proof
- User must submit a proof of solvency every **T interval**
- Proof confirms continued control of the commitment
- Failure to submit a valid proof triggers **liquidation of minimum collateral**

---

### Loan Repayment
- User generates a **new secret and nullifier**
- User repays **full loan amount + interest**
- Partial repayments are **not supported**
- Lending engine marks the original position (old nullifier) as repaid
- Repayment commitment is inserted into the **repayment Merkle tree**

---

### Withdraw Collateral
- User generates a **proof of repayment**
- Vault verifies:
  - Commitment exists in repayment tree
  - Nullifier is unused
- Collateral is released
- Nullifier hash is permanently marked as used

---

## 4. Privacy Guarantees

### Hidden
- User identity
- Collateral amount
- Deposit–borrow linkage

### Important Note
The protocol is **private-by-design**, but **user behavior can break privacy**.

### What Breaks Privacy
Using the same wallet to:
- Deposit collateral
- Submit proofs
- Receive loan funds
- Repay loan

> Currently, the protocol does **not** provide native relayer services.

---

## 5. How to Achieve Full Privacy

- User deposits collateral using a **main wallet**
- Proofs are submitted via a **relayer or alternate wallet**
- Loan repayment can be submitted from **any wallet**
- Protocol only checks **nullifier hashes and amounts**, not sender identity
- Withdrawal proof can be submitted from the original wallet

⚠️ **Nullifiers must never be reused across different actions**

---

## 6. Frontend Responsibilities

- Store secrets and nullifiers locally
- Warn users: **losing secrets = permanent fund loss**
- Trigger proof generation
- Automate periodic proof submissions where possible
- Display proof deadlines clearly
- Handle proof failures and reverts gracefully

---

## 7. Failure Scenarios & Warnings

- Missing or invalid periodic proof → **liquidation**
- Reusing nullifiers → **transaction reverts**
- Lost secret or nullifier → **funds permanently locked**
- No recovery mechanism exists

> Losing secrets is equivalent to losing wallet mnemonics.
