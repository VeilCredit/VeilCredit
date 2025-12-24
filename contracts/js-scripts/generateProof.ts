import { Barretenberg, UltraHonkBackend, Fr} from "@aztec/bb.js";
import { ethers } from "ethers";
import { Noir } from "@noir-lang/noir_js";
import fs from "fs";
import path from "path";
import { merkleTree } from "./merkleTree";

// Try to import Fr from internal path


const circuit = JSON.parse(
  fs.readFileSync(
    path.resolve(
      __dirname,
      "../../circuits/circuit_prove_collateral_deposit/target/circuits.json"
    ),
    "utf-8"
  )
);

const MAX_U128 = (1n << 128n) - 1n;
const MAX_U64 = (1n << 64n) - 1n;

function assertU128(x: bigint, name: string) {
  if (x < 0n || x > MAX_U128) {
    throw new Error(`${name} out of u128 range`);
  }
}

function assertU64(x: bigint, name: string) {
  if (x < 0n || x > MAX_U64) {
    throw new Error(`${name} out of u64 range`);
  }
}

export async function generateProof(
  nullifier_: string,
  secret_: string,
  borrow_amount_: bigint | number,
  asset_price_: bigint | number,
  minimum_collateralization_ratio_: bigint | number,
  tokenId_: bigint | number,
  recepient_: string,
  amount_: bigint | number,
  actual_collateralization_ratio_: bigint | number,
  epochCommitment_: string,
  epoch_: bigint | number,
  roundId_: bigint | number,
  price_: bigint | number,
  leaves: string[]
) {
  const bb = await Barretenberg.new();
  
  // Get Fr constructor from bb instance if not imported
  const FrConstructor = Fr || (bb as any).Fr;
  
  if (!FrConstructor) {
    throw new Error("Fr class not found in @aztec/bb.js. Check your bb.js version.");
  }
  
  try {
    const noir = new Noir(circuit);
    const honk = new UltraHonkBackend(circuit.bytecode, { threads: 1 });

    // Validate inputs
    assertU128(BigInt(borrow_amount_), "borrow_amount");
    assertU128(BigInt(asset_price_), "asset_price");
    assertU128(BigInt(minimum_collateralization_ratio_), "minimum_collateralization_ratio");
    assertU64(BigInt(tokenId_), "tokenId");
    assertU128(BigInt(amount_), "amount");
    assertU128(BigInt(actual_collateralization_ratio_), "actual_collateralization_ratio");
    assertU128(BigInt(epoch_), "epoch");
    assertU64(BigInt(roundId_), "roundId");
    assertU128(BigInt(price_), "price");

    // Create Fr instances
    const borrow_amount = new FrConstructor(BigInt(borrow_amount_));
    const asset_price = new FrConstructor(BigInt(asset_price_));
    const minimum_collateralization_ratio = new FrConstructor(BigInt(minimum_collateralization_ratio_));
    const tokenId = new FrConstructor(BigInt(tokenId_));
    const amount = new FrConstructor(BigInt(amount_));
    const actual_collateralization_ratio = new FrConstructor(BigInt(actual_collateralization_ratio_));
    const epoch = new FrConstructor(BigInt(epoch_));
    const roundId = new FrConstructor(BigInt(roundId_));
    const price = new FrConstructor(BigInt(price_));


    const nullifierField = FrConstructor.fromString ? FrConstructor.fromString(nullifier_) : new FrConstructor(BigInt(nullifier_));
    const secretField = FrConstructor.fromString ? FrConstructor.fromString(secret_) : new FrConstructor(BigInt(secret_));
    const recepient = FrConstructor.fromString ? FrConstructor.fromString(recepient_) : new FrConstructor(BigInt(recepient_));
    const epochCommitment = FrConstructor.fromString ? FrConstructor.fromString(epochCommitment_) : new FrConstructor(BigInt(epochCommitment_));
    // Compute hashes
    const nullifierHash = await bb.poseidon2Hash([nullifierField, nullifierField]);
    
    const tree = await merkleTree(leaves);
    
    const commitment = await bb.poseidon2Hash([
      nullifierField,
      secretField,
      amount,
      tokenId,
    ]);
    
    const merkleProof = tree.proof(tree.getIndex(commitment.toString()));

    // Prepare circuit inputs
    const input = {
      root: merkleProof.root,
      nullifier_hash: nullifierHash.toString(),
      borrow_amount: borrow_amount.toString(),
      asset_price: asset_price.toString(),
      minimum_collateralization_ratio: minimum_collateralization_ratio.toString(),
      tokenId: tokenId.toString(),
      recepient: recepient.toString(),
      epoch_commitment: epochCommitment.toString(),
      epoch: epoch.toString(),
      
      nullifier: nullifierField.toString(),
      secret: secretField.toString(),
      merkle_proof: merkleProof.pathElements.map((i) => i.toString()),
      is_even: merkleProof.pathIndices.map((i) => i % 2 === 0),
      amount: amount.toString(),
      actual_collateralization_ratio: actual_collateralization_ratio.toString(),
      roundId: roundId.toString(),
      price: price.toString(),
    };

    // Generate witness and proof
    const { witness } = await noir.execute(input);
    
    const originalLog = console.log;
    console.log = () => {}; // Silence logs
    
    const { proof, publicInputs } = await honk.generateProof(witness, { keccakZK: true });
    
    console.log = originalLog;

    // Encode result
    const result = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes", "bytes32[]"],
      [proof, publicInputs]
    );
    
    return result;
  } catch (err) {
    console.error("Proof generation error:", err);
    throw err;
  }
}

// CLI execution
(async () => {
  const nullifier = process.argv[2];
  const secret = process.argv[3];
  const borrowAmountArg = process.argv[4];
  const assetPriceArg = process.argv[5];
  const tokenIdArg = process.argv[6];
  const recepient = process.argv[7];
  const minimum_collateralization_ratio_arg = process.argv[8];
  const actual_collateralization_ratio_arg = process.argv[9];
  const collateralAmountArg = process.argv[10];
  const epochCommitment = process.argv[11];
  const epochArg = process.argv[12];
  const roundIdArg = process.argv[13];
  const priceArg = process.argv[14];
  const leaves = process.argv.slice(15);

  // Validation
  if (!nullifier) throw new Error("nullifier argument missing");
  if (!secret) throw new Error("secret argument missing");
  if (!borrowAmountArg) throw new Error("borrowAmount argument missing");
  if (!assetPriceArg) throw new Error("assetPrice argument missing");
  if (!tokenIdArg) throw new Error("tokenId argument missing");
  if (!recepient) throw new Error("recepient argument missing");
  if (!minimum_collateralization_ratio_arg) throw new Error("minimum collateralization ratio argument missing");
  if (!actual_collateralization_ratio_arg) throw new Error("actual collateralization ratio argument missing");
  if (!collateralAmountArg) throw new Error("collateralAmount argument missing");
  if(!epochCommitment) throw new Error("epochCommitment argument missing");
  if(!epochArg) throw new Error("epoch argument missing");
  if(!roundIdArg) throw new Error("roundId argument missing");
  if(!priceArg) throw new Error("price argument missing");
  if (!leaves || leaves.length === 0) throw new Error("leaves argument missing");

  const borrowAmount = BigInt(borrowAmountArg);
  const tokenId = BigInt(tokenIdArg);
  const assetPrice = BigInt(assetPriceArg);
  const minimumCollateralizationRatio = BigInt(minimum_collateralization_ratio_arg);
  const actualCollateralizationRatio = BigInt(actual_collateralization_ratio_arg);
  const collateralAmount = BigInt(collateralAmountArg);
  const epoch = BigInt(epochArg);
  const roundId = BigInt(roundIdArg);
  const price = BigInt(priceArg);

  const result = await generateProof(
    nullifier,
    secret,
    borrowAmount,
    assetPrice,
    minimumCollateralizationRatio,
    tokenId,
    recepient,
    collateralAmount,
    actualCollateralizationRatio,
    epochCommitment,
    epoch,
    roundId,
    price,
    leaves
  );

  process.stdout.write(result);
  process.exit(0);
})();