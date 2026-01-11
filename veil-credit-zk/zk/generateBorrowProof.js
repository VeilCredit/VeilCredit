import { Barretenberg, UltraHonkBackend, Fr } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import fs from "fs";
import path from "path";
import { merkleTree } from "./merkleTree.js";

const circuit = JSON.parse(
  fs.readFileSync(path.resolve("./zk/circuits/circuits.json"), "utf-8")
);

const MAX_U128 = (1n << 128n) - 1n;
const MAX_U64 = (1n << 64n) - 1n;

function assertU128(x, name) {
  if (x < 0n || x > MAX_U128) throw new Error(`${name} out of u128 range`);
}
function assertU64(x, name) {
  if (x < 0n || x > MAX_U64) throw new Error(`${name} out of u64 range`);
}
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

/**
 * Canonical BN254 field adapter
 * This is the ONLY allowed conversion
 */
function zkField(x) {
  return new Fr(BigInt(x)).toString();
}

export async function generateBorrowProof(params) {
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
    leaves,
  } = params;

  const bb = await Barretenberg.new();

  try {
    const noir = new Noir(circuit);
    const honk = new UltraHonkBackend(circuit.bytecode, { threads: 1 });

    // ---- VALIDATION ----
    assertU128(BigInt(borrowAmount), "borrowAmount");
    assertU128(BigInt(assetPrice), "assetPrice");
    assertU128(BigInt(minCollateralRatio), "minCollateralRatio");
    assertU64(BigInt(tokenId), "tokenId");
    assertU128(BigInt(collateralAmount), "collateralAmount");
    assertU128(BigInt(actualCollateralRatio), "actualCollateralRatio");
    assertU128(BigInt(epoch), "epoch");
    assertU64(BigInt(roundId), "roundId");
    assertU128(BigInt(price), "price");

    // ---- CANONICAL FIELD CONVERSION ----
    const nullifierF = new Fr(BigInt(nullifier));
    const secretF = new Fr(BigInt(secret));
    const borrowAmountF = new Fr(BigInt(borrowAmount));
    const assetPriceF = new Fr(BigInt(assetPrice));
    const minCRF = new Fr(BigInt(minCollateralRatio));
    const tokenIdF = new Fr(BigInt(tokenId));
    const collateralAmountF = new Fr(BigInt(collateralAmount));
    const actualCRF = new Fr(BigInt(actualCollateralRatio));
    const epochF = new Fr(BigInt(epoch));
    const roundIdF = new Fr(BigInt(roundId));
    const priceF = new Fr(BigInt(price));
    const recipientF = new Fr(BigInt(recipient));
    const epochCommitmentF = new Fr(BigInt(epochCommitment));

    // ---- HASHES (CANONICAL ONLY) ----
    const nullifierHashF = await bb.poseidon2Hash([nullifierF, nullifierF]);

    const commitmentF = await bb.poseidon2Hash([
      nullifierF,
      secretF,
      collateralAmountF,
      tokenIdF,
    ]);

    // ---- MERKLE TREE ----
    const tree = await merkleTree(leaves);
    const proofData = tree.proof(tree.getIndex(commitmentF.toString()));

    // ---- CIRCUIT INPUT ----
    const input = {
      root: proofData.root,
      nullifier_hash: zkField(nullifierHashF),
      borrow_amount: zkField(borrowAmountF),
      asset_price: zkField(assetPriceF),
      minimum_collateralization_ratio: zkField(minCRF),
      tokenId: zkField(tokenIdF),
      recepient: zkField(recipientF),
      epoch_commitment: zkField(epochCommitmentF),
      epoch: zkField(epochF),

      nullifier: zkField(nullifierF),
      secret: zkField(secretF),
      merkle_proof: proofData.pathElements,
      is_even: proofData.pathIndices,
      amount: zkField(collateralAmountF),
      actual_collateralization_ratio: zkField(actualCRF),
      roundId: zkField(roundIdF),
      price: zkField(priceF),
    };
    const jsRoot = await jsComputeRoot(
      bb,
      commitmentF,
      proofData.pathElements,
      proofData.pathIndices
    );

    if (jsRoot.toString() !== proofData.root) {
      throw new Error("JS root != public root — proof invalid");
    }

    if (jsRoot.toString() !== proofData.root) {
      throw new Error("JS root != public root — proof invalid");
    }

    const { witness } = await noir.execute(input);
    const { proof, publicInputs } = await honk.generateProof(witness, {
      keccakZK: true,
    });
    console.log(proof)
    console.log(publicInputs)

    return { proof, publicInputs };
  } finally {
    await bb.destroy();
  }
}
