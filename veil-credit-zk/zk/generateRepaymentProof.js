import { Barretenberg, UltraHonkBackend, Fr } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import fs from "fs";
import path from "path";
import { merkleTree } from "./merkleTree.js";
function zkField(x) {
  return new Fr(BigInt(x)).toString();
}

const circuit = JSON.parse(
  fs.readFileSync(
    path.resolve("./zk/circuits/circuit_prove_loan_repayment.json"),
    "utf-8"
  )
);

async function jsComputeRoot(bb, leaf, path, is_even) {
  let current = leaf;
  for (let i = 0; i < path.length; i++) {
    const sibling = new Fr(BigInt(path[i]));
    current = is_even[i]
      ? await bb.poseidon2Hash([current, sibling])
      : await bb.poseidon2Hash([sibling, current]);
  }
  return current;
}

export async function generateRepaymentProof(params) {
  const {
    nullifier_deposit,
    secret_deposit,
    withdrawAmount,
    recipient,

    tokenId,
    collateralAmount,
    leaves_deposit,
    leaves_loan,
    leaves_repayment,
  } = params;

  const bb = await Barretenberg.new();

  try {
    console.log("here")
    const noir = new Noir(circuit);
    console.log("here")
    const honk = new UltraHonkBackend(circuit.bytecode, { threads: 1 });
    console.log("here")

    const nullifierF = new Fr(BigInt(nullifier_deposit));
    console.log("here")

    const secretF = new Fr(BigInt(secret_deposit));
    console.log("here")

    const tokenIdF = new Fr(BigInt(tokenId));
    console.log("here")

    const collateralAmountF = new Fr(BigInt(collateralAmount));
    console.log("here")

    const withdrawAmountF = new Fr(BigInt(withdrawAmount));
    console.log("here")

    const recipientF = new Fr(BigInt(recipient));
    console.log("here")


    const commitmentDeposit = await bb.poseidon2Hash([
      nullifierF,
      secretF,
      collateralAmountF,
      tokenIdF,
    ]);

    const loanCommitment = await bb.poseidon2Hash([commitmentDeposit]);

    const repaymentCommitment = await bb.poseidon2Hash([loanCommitment]);

    const depositTree = await merkleTree(leaves_deposit);
    const loanTree = await merkleTree(leaves_loan);
    const repaymentTree = await merkleTree(leaves_repayment);

    const depositProof = depositTree.proof(
      depositTree.getIndex(commitmentDeposit.toString())
    );
    const loanProof = loanTree.proof(
      loanTree.getIndex(loanCommitment.toString())
    );
    const repaymentProof = repaymentTree.proof(
      repaymentTree.getIndex(repaymentCommitment.toString())
    );

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

    const jsRootDeposit = await jsComputeRoot(
      bb,
      commitmentDeposit,
      depositProof.pathElements,
      depositProof.pathIndices
    );

    const jsRootLoan = await jsComputeRoot(
      bb,
      loanCommitment,
      loanProof.pathElements,
      loanProof.pathIndices
    );

    const jsRootRepay = await jsComputeRoot(
      bb,
      repaymentCommitment,
      repaymentProof.pathElements,
      repaymentProof.pathIndices
    );

    if (jsRootDeposit.toString() != depositProof.root) {
      throw new Error("JS root != public root — proof invalid");
    }
    if (jsRootLoan.toString() != loanProof.root) {
      throw new Error("JS root != public root — proof invalid");
    }
    if (jsRootRepay.toString() != repaymentProof.root) {
      throw new Error("JS root != public root — proof invalid");
    }

    const { witness } = await noir.execute(input);
    const { proof, publicInputs } = await honk.generateProof(witness, {
      keccakZK: true,
    });
    console.log(proof);
    console.log(publicInputs);

    return { proof, publicInputs };
  } finally {
    await bb.destroy();
  }
}
