import { Fr, UltraHonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import fs from "fs";
import path from "path";
import { buildTreeUpTo } from "./treeSnapShot.js";
const circuit = JSON.parse(
  fs.readFileSync(path.resolve("./zk/circuits/circuits.json"), "utf8")
);

function zkField(x) {
  return new Fr(BigInt(x)).toString();
}



export async function generateBorrowProof(params, depositLeaves, bb) {
  const {
    nullifier,
    secret,
    borrowAmount,
    assetPrice,
    minCollateralRatio,
    tokenId,
    recipient,
    collateralAmount,
    actualCollateralRatio,
    epochCommitment,
    epoch,
    roundId,
    price,
  } = params;

  const noir = new Noir(circuit);
  const honk = new UltraHonkBackend(circuit.bytecode, { threads: 1 });

  // ---- Recompute commitment ----
  const nullifierF = new Fr(BigInt(nullifier));
  const secretF = new Fr(BigInt(secret));
  const amountF = new Fr(BigInt(collateralAmount));
  const tokenIdF = new Fr(BigInt(tokenId));

  const commitmentF = await bb.poseidon2Hash([
    nullifierF,
    secretF,
    amountF,
    tokenIdF,
  ]);

  const nullifierHashF = await bb.poseidon2Hash([nullifierF, nullifierF]);

  // ---- Merkle proof from GLOBAL tree ----
  const depositSnapshot = await buildTreeUpTo(
    bb,
    depositLeaves,
    commitmentF.toString()
  );

  const proof = await depositSnapshot.getProof(commitmentF.toString());

  // ---- Circuit input ----
  const input = {
    root: proof.root,
    nullifier_hash: zkField(nullifierHashF),
    borrow_amount: zkField(borrowAmount),
    asset_price: zkField(assetPrice),
    minimum_collateralization_ratio: zkField(minCollateralRatio),
    tokenId: zkField(tokenId),
    recepient: zkField(recipient),
    epoch_commitment: zkField(epochCommitment),
    epoch: zkField(epoch),

    nullifier: zkField(nullifier),
    secret: zkField(secret),
    merkle_proof: proof.pathElements,
    is_even: proof.pathIndices,
    amount: zkField(collateralAmount),
    actual_collateralization_ratio: zkField(actualCollateralRatio),
    roundId: zkField(roundId),
    price: zkField(price),
  };

  const { witness } = await noir.execute(input);
  const { proof: zkProof, publicInputs } = await honk.generateProof(witness, {
    keccakZK: true,
  });

  return { proof: zkProof, publicInputs };
}
