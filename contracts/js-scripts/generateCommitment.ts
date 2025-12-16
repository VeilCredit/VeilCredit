import { ethers } from "ethers";

import { Barretenberg, Fr } from "@aztec/bb.js";

export default async function generateCommitment(
  amount: bigint | number, tokenId: bigint|number
): Promise<string> {
  const bb = await Barretenberg.new();
  const nullifier = Fr.random();
  const secret = Fr.random();
  const amountFr = new Fr(BigInt(amount) % Fr.MODULUS);
  const tokenIdFr = new Fr(BigInt(tokenId)% Fr.MODULUS)
  const commitment: Fr = await bb.poseidon2Hash([
    nullifier,
    secret,
    amountFr,
    tokenIdFr
  ]);
  const result = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32", "bytes32"],
    [commitment.toBuffer(), nullifier.toBuffer(), secret.toBuffer()]
  );
  return result;
}
(async () => {
  const amountArg = process.argv[2];
  const tokenIdArg = process.argv[3];

  if (!amountArg) {
    throw new Error("Amount argument missing");
  }
  if (!tokenIdArg) {
    throw new Error("tokenId argument missing");
  }

  const amount = BigInt(amountArg);
  const tokenId = BigInt(tokenIdArg);

  const result = await generateCommitment(amount, tokenId);

  process.stdout.write(result);
  process.exit(0);
})().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});