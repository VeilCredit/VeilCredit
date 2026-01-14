import { Fr, UltraHonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import fs from "fs";
import path from "path";

/* ================= CIRCUIT ================= */

const circuit = JSON.parse(
  fs.readFileSync(
    path.resolve("./zk/circuits/circuit_prove_loan_repayment.json"),
    "utf-8"
  )
);

/* ================= HELPERS ================= */

function zkField(x) {
  return new Fr(BigInt(x)).toString();
}

export async function generateRepaymentProof(
  params,
  depositTree,
  loanTree,
  repaymentTree,
  bb
) {
  const {
    nullifier_deposit,
    secret_deposit,
    withdrawAmount,
    recipient,
    tokenId,
    collateralAmount,
  } = params;

  const noir = new Noir(circuit);
  const honk = new UltraHonkBackend(circuit.bytecode, { threads: 1 });

  /* ---------- FIELD CONVERSION ---------- */

  const nullifierF = new Fr(BigInt(nullifier_deposit));
  const secretF = new Fr(BigInt(secret_deposit));
  const tokenIdF = new Fr(BigInt(tokenId));
  const collateralAmountF = new Fr(BigInt(collateralAmount));
  const withdrawAmountF = new Fr(BigInt(withdrawAmount));
  const recipientF = new Fr(BigInt(recipient));

  /* ---------- COMMITMENTS ---------- */

  // Deposit commitment
  const depositCommitment = await bb.poseidon2Hash([
    nullifierF,
    secretF,
    collateralAmountF,
    tokenIdF,
  ]);

  // Loan commitment
  const loanCommitment = await bb.poseidon2Hash([
    depositCommitment,
  ]);

  // Repayment commitment
  const repaymentCommitment = await bb.poseidon2Hash([
    loanCommitment,
  ]);

  /* ---------- MERKLE PROOFS (GLOBAL TREES) ---------- */

  const depositProof = await depositTree.getProof(
    depositCommitment.toString()
  );

  const loanProof = await loanTree.getProof(
    loanCommitment.toString()
  );

  const repaymentProof = await repaymentTree.getProof(
    repaymentCommitment.toString()
  );

  /* ---------- OPTIONAL SAFETY CHECKS ---------- */



  /* ---------- CIRCUIT INPUT ---------- */

  const input = {
    root_deposit: depositProof.root,
    root_loan: loanProof.root,
    root_repay: repaymentProof.root,

    withdraw_amount: zkField(withdrawAmountF),
    recipient: zkField(recipientF),

    nullifier_d: zkField(nullifierF),
    secret_d: zkField(secretF),
    token_id: zkField(tokenIdF),
    amount: zkField(collateralAmountF),

    merkle_proof_deposit: depositProof.pathElements,
    is_even_deposit: depositProof.pathIndices,

    merkle_proof_loan: loanProof.pathElements,
    is_even_loan: loanProof.pathIndices,

    merkle_proof_repay: repaymentProof.pathElements,
    is_even_repay: repaymentProof.pathIndices,
  };

  /* ---------- PROVE ---------- */

  const { witness } = await noir.execute(input);
  const { proof, publicInputs } = await honk.generateProof(witness, {
    keccakZK: true,
  });

  return { proof, publicInputs };
}