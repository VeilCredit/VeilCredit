import { Barretenberg, UltraHonkBackend, Fr } from "@aztec/bb.js";
import { ethers } from "ethers";
import { Noir } from "@noir-lang/noir_js";
import fs from "fs";
import path from "path";
import { merkleTree } from "./merkleTree";

const circuit = JSON.parse(
  fs.readFileSync(
    path.resolve(
      __dirname,
      "../../circuits/circuit_prove_loan_repayment/target/circuit_prove_loan_repayment.json"
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

export async function generateRepaymentProof(
  nullifier_repayment: string,
  secret_repayment: string,
  withdrawAmount: bigint | number,
  leaves_repayment: string[],

  //   inputs for deposit commitment
  nullifier_deposit: string,
  secret_deposit: string,
  borrow_amount_deposit: bigint | number,
  asset_price_deposit: bigint | number,
  minimum_collateralization_ratio_deposit: bigint | number,
  tokenId_deposit: bigint | number,
  recepient_deposit: string,
  amount_deposit: bigint | number,
  actual_collateralization_ratio_deposit: bigint | number,
  leaves_deposit: string[]
) {
  const bb = await Barretenberg.new();
  const FrConstructor = Fr || (bb as any).Fr;

  if (!FrConstructor) {
    throw new Error("Fr class not found");
  }
  try {
    const noir = new Noir(circuit);
    const honk = new UltraHonkBackend(circuit.bytecode, { threads: 1 });
    const repayNullifierField = FrConstructor.fromString
      ? FrConstructor.fromString(nullifier_repayment)
      : new FrConstructor(BigInt(nullifier_repayment));
    const repaySecretField = FrConstructor.fromString
      ? FrConstructor.fromString(secret_repayment)
      : new FrConstructor(BigInt(secret_repayment));

    const repaytNullifierHash = await bb.poseidon2Hash([repayNullifierField]);
    const repayTree = await merkleTree(leaves_repayment);
    const repayCommitment = await bb.poseidon2Hash([
      repayNullifierField,
      repaySecretField,
    ]);
    const repaymentTreeMerkleProof = repayTree.proof(
      repayTree.getIndex(repayCommitment.toString())
    );

    assertU128(BigInt(borrow_amount_deposit), "borrow_amount");
    assertU128(BigInt(asset_price_deposit), "asset_price");
    assertU128(
      BigInt(minimum_collateralization_ratio_deposit),
      "minimum_collateralization_ratio"
    );
    assertU64(BigInt(tokenId_deposit), "tokenId");
    assertU128(BigInt(amount_deposit), "amount");
    assertU128(
      BigInt(actual_collateralization_ratio_deposit),
      "actual_collateralization_ratio"
    );

    const borrow_amount = new FrConstructor(BigInt(borrow_amount_deposit));
    const asset_price = new FrConstructor(BigInt(asset_price_deposit));
    const minimum_collateralization_ratio = new FrConstructor(
      BigInt(minimum_collateralization_ratio_deposit)
    );
    const tokenId = new FrConstructor(BigInt(tokenId_deposit));
    const amount = new FrConstructor(BigInt(amount_deposit));
    const actual_collateralization_ratio = new FrConstructor(
      BigInt(actual_collateralization_ratio_deposit)
    );

    const depositNullifierField = FrConstructor.fromString
      ? FrConstructor.fromString(nullifier_deposit)
      : new FrConstructor(BigInt(nullifier_deposit));
    const depositSecretField = FrConstructor.fromString
      ? FrConstructor.fromString(secret_deposit)
      : new FrConstructor(BigInt(secret_deposit));
    const recepient = FrConstructor.fromString
      ? FrConstructor.fromString(recepient_deposit)
      : new FrConstructor(BigInt(recepient_deposit));

    const depositNullifierHash = await bb.poseidon2Hash([
      depositNullifierField,
      depositNullifierField,
    ]);

    const depositTree = await merkleTree(leaves_deposit);

    const depositCommitment = await bb.poseidon2Hash([
      depositNullifierField,
      depositSecretField,
      amount,
      tokenId,
    ]);

    const depositMerkleProof = depositTree.proof(
      depositTree.getIndex(depositCommitment.toString())
    );
    // root_repay: pub Field,
    // nullifier_hash_repay: pub Field,
    // nullifier_repay: Field,
    // secret_repay: Field,
    // merkle_proof_repay: [Field; 16],
    // is_even_repay: [bool; 16],
    // withdrawAmount: pub u128,

    // root_deposit: pub Field,
    // nullifier_hash: pub Field,
    // borrow_amount: pub u128,
    // asset_price: pub u128,
    // minimum_collateralization_ratio: pub u128,
    // tokenId: pub u64,
    // recepient: pub Field,

    // nullifier_deposit: Field,
    // secret_deposit: Field,
    // merkle_proof_deposit: [Field;16],
    // is_even_deposit: [bool;16],
    // amount: u128,
    // actual_collateralization_ratio: u128,

    const input = {
      root_repay: repaymentTreeMerkleProof.root,
      nullifier_hash_repay: repaytNullifierHash.toString(),
      nullifier_repay: repayNullifierField.toString(),
      secret_repay: repaySecretField.toString(),
      merkle_proof_repay: repaymentTreeMerkleProof.pathElements.map((i) =>
        i.toString()
      ),
      is_even_repay: repaymentTreeMerkleProof.pathIndices.map(
        (i) => i % 2 == 0
      ),
      withdrawAmount: withdrawAmount.toString(),

      root_deposit: depositMerkleProof.root,
      nullifier_hash_deposit: depositNullifierHash.toString(),
      borrow_amount: borrow_amount.toString(),
      asset_price: asset_price.toString(),
      minimum_collateralization_ratio:
        minimum_collateralization_ratio.toString(),
      tokenId: tokenId.toString(),
      recepient: recepient.toString(),
      nullifier_deposit: depositNullifierField.toString(),
      secret_deposit: depositSecretField.toString(),
      merkle_proof_deposit: depositMerkleProof.pathElements.map((i) =>
        i.toString()),
      is_even_deposit: depositMerkleProof.pathIndices.map(
        (i) => i % 2 == 0
      ),
      amount: amount.toString(),
      actual_collateralization_ratio: actual_collateralization_ratio.toString(),
    };

    const {witness} = await noir.execute(input);
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

(async () =>{
  const nullifier_deposit = process.argv[2];
  const secret_deposit = process.argv[3];
  const borrowAmountArg = process.argv[4];
  const assetPriceArg = process.argv[5];
  const tokenIdArg = process.argv[6];
  const recepient = process.argv[7];
  const minimum_collateralization_ratio_arg = process.argv[8];
  const actual_collateralization_ratio_arg = process.argv[9];
  const collateralAmountArg = process.argv[10];
  const nullifier_repayment = process.argv[11];
  const secret_repaymnet = process.argv[12];
  const withdrawAmountArg = process.argv[13];
  const arrayArgs = process.argv.slice(14);

// Find the divider
const dividerIndex = arrayArgs.indexOf("--split");

if (dividerIndex === -1) {
  throw new Error("Missing --split to separate the two arrays");
}

// First array
const leaves_deposit = arrayArgs.slice(0, dividerIndex);

// Second array
const leaves_repayment = arrayArgs.slice(dividerIndex + 1);

  // Validation
  if (!nullifier_deposit) throw new Error("nullifier argument missing");
  if (!secret_deposit) throw new Error("secret argument missing");
  if (!borrowAmountArg) throw new Error("borrowAmount argument missing");
  if (!assetPriceArg) throw new Error("assetPrice argument missing");
  if (!tokenIdArg) throw new Error("tokenId argument missing");
  if (!recepient) throw new Error("recepient argument missing");
  if (!minimum_collateralization_ratio_arg) throw new Error("minimum collateralization ratio argument missing");
  if (!actual_collateralization_ratio_arg) throw new Error("actual collateralization ratio argument missing");
  if (!collateralAmountArg) throw new Error("collateralAmount argument missing");
  if (!leaves_deposit || leaves_deposit.length === 0) throw new Error("leaves argument missing");

  const borrowAmount = BigInt(borrowAmountArg);
  const tokenId = BigInt(tokenIdArg);
  const assetPrice = BigInt(assetPriceArg);
  const minimumCollateralizationRatio = BigInt(minimum_collateralization_ratio_arg);
  const actualCollateralizationRatio = BigInt(actual_collateralization_ratio_arg);
  const collateralAmount = BigInt(collateralAmountArg);
  const withdrawAmount = BigInt(withdrawAmountArg);
  const result = await generateRepaymentProof(
        nullifier_repayment,
        secret_repaymnet,
        withdrawAmount,
        leaves_repayment,

        nullifier_deposit,
        secret_deposit,
        borrowAmount,
        assetPrice,
        minimumCollateralizationRatio,
        tokenId,
        recepient,
        collateralAmount,
        actualCollateralizationRatio,
        leaves_deposit
      );
    
      process.stdout.write(result);
      process.exit(0);
})();
