import { Barretenberg, UltraHonkBackend, Fr } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import fs from "fs";
import path from "path";
import { merkleTree } from "./merkleTree.js";

const MAX_U128 = (1n << 128n) - 1n;
const MAX_U64 = (1n << 64n) - 1n;

const circuit = JSON.parse(
  fs.readFileSync(path.resolve("./zk/circuits/circuit_prove_solvancy.json"), "utf-8")
);

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

function zkField(x) {
  return new Fr(BigInt(x)).toString();
}

export async function generatePeriodicProofOfSolvancy(params) {
  const {
    nullifier,
    secret,
    borrowAmount,
    assetPrice,
    liquidationThreshold,
    tokenId,
    collateralAmount,
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

    assertU128(BigInt(borrowAmount), "borrowAmount");
    console.log("here")

    assertU128(BigInt(assetPrice), "assetPrice");
    console.log("here")

    assertU128(BigInt(liquidationThreshold), "minCollateralRatio");
    console.log("here")

    assertU64(BigInt(tokenId), "tokenId");
    console.log("here")

    assertU128(BigInt(collateralAmount), "collateralAmount");
    console.log("here")

    assertU128(BigInt(epoch), "epoch");
    console.log("here")

    assertU64(BigInt(roundId), "roundId");
    console.log("here")

    assertU128(BigInt(price), "price");


    const nullifierF = new Fr(BigInt(nullifier));

    const secretF = new Fr(BigInt(secret));

    const borrowAmountF = new Fr(BigInt(borrowAmount));

    const liquidationThresholdF = new Fr(BigInt(liquidationThreshold))
    const assetPriceF = new Fr(BigInt(assetPrice));
    const tokenIdF = new Fr(BigInt(tokenId));
    const collateralAmountF = new Fr(BigInt(collateralAmount));
    const epochF = new Fr(BigInt(epoch));
    const roundIdF = new Fr(BigInt(roundId));
    const priceF = new Fr(BigInt(price));
    const epochCommitmentF = new Fr(BigInt(epochCommitment));

    const nullifierHashF = await bb.poseidon2Hash([nullifierF, nullifierF]);
    const commitmentF = await bb.poseidon2Hash([
      nullifierF,
      secretF,
      collateralAmountF,
      tokenIdF,
    ]);

    const tree = await merkleTree(leaves);
    const proofData = tree.proof(tree.getIndex(commitmentF.toString()));

    const input = {
      root: proofData.root,
      nullifier_hash: zkField(nullifierHashF),
      borrow_amount: zkField(borrowAmountF),
      asset_price: zkField(assetPriceF),
      liquidation_threshold: zkField(liquidationThresholdF),
      tokenId: zkField(tokenIdF),
      epoch_commitment: zkField(epochCommitmentF),
      epoch: zkField(epochF),

      nullifier: zkField(nullifierF),
      secret: zkField(secretF),
      merkle_proof: proofData.pathElements,
      is_even: proofData.pathIndices,
      amount: zkField(collateralAmountF),
      price: zkField(priceF),
      roundId: zkField(roundIdF),
    };

    const jsRoot = await jsComputeRoot(
        bb,
        commitmentF,
        proofData.pathElements,
        proofData.pathIndices
    )

    if(jsRoot.toString() != proofData.root){
      throw new Error("JS root != public root — proof invalid");
    }
    const {witness} = await noir.execute(input)

    const {proof, publicInputs } = await honk.generateProof(witness,{keccakZK: true,})
    return {proof, publicInputs}
  } finally {
    await bb.destroy();
  }
}
