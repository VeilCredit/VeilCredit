import express from "express";
import cors from "cors";
import { Barretenberg, Fr } from "@aztec/bb.js";
import { ethers } from "ethers";
import { generateBorrowProof } from "./zk/generateBorrowProof.js";
import { generateRepaymentProof } from "./zk/generateRepaymentProof.js";
import { generatePeriodicProofOfSolvancy } from "./zk/generatePeriodicProofOfSolvancy.js";
const app = express();
app.use(cors());
app.use(express.json());

/**
 * Canonical BN254 field helper
 * This is the ONLY allowed representation boundary
 */
function zkField(x) {
  return new Fr(BigInt(x)).toString();
}

app.post("/generate-commitment", async (req, res) => {
  let bb;

  try {
    const { amount, tokenId } = req.body;
    if (amount === undefined || tokenId === undefined) {
      return res.status(400).json({ error: "invalid input" });
    }

    bb = await Barretenberg.new();

    // Canonical fields
    const amountFr = new Fr(BigInt(amount));
    const tokenIdFr = new Fr(BigInt(tokenId));

    // Secrets (canonical usage ONLY)
    const nullifier = Fr.random();
    const secret = Fr.random();

    // Poseidon hashes (canonical)
    const commitmentFr = await bb.poseidon2Hash([
      nullifier,
      secret,
      amountFr,
      tokenIdFr,
    ]);

    const loanCommitmentF = await bb.poseidon2Hash([commitmentFr]);
    const repaymentCommitmentF = await bb.poseidon2Hash([loanCommitmentF])

    const nullifierHashFr = await bb.poseidon2Hash([
      nullifier,
      nullifier,
    ]);

    // Convert EVERYTHING to canonical decimal strings
    const commitment = commitmentFr.toString();
    const loanCommitment = loanCommitmentF.toString()
    const repayCommitment = repaymentCommitmentF.toString()
    const nullifierStr = nullifier.toString();
    const secretStr = secret.toString();
    const nullifierHashStr = nullifierHashFr.toString();

    // Contract payload (bytes32 expected)
    const payload = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32", "bytes32","bytes32","bytes32"],
      [
        ethers.toBeHex(BigInt(commitment), 32),
        ethers.toBeHex(BigInt(loanCommitment), 32),
        ethers.toBeHex(BigInt(repayCommitment), 32),
        ethers.toBeHex(BigInt(nullifierStr), 32),
        ethers.toBeHex(BigInt(secretStr), 32),
      ]
    );

    res.json({
      payload,
      zkParams: {
        // ONLY canonical fields
        commitment,
        nullifier: nullifierStr,
        secret: secretStr,
        nullifier_hash: nullifierHashStr,
        amount: amount.toString(),
        tokenId: tokenId.toString(),
      },
    });
  } catch (e) {
    console.error("ZK error:", e);
    res.status(500).json({ error: "zk failure" });
  } finally {
    if (bb) await bb.destroy();
  }
});


app.post("/generate-borrow-proof", async (req, res) => {
  try {
    /**
     * IMPORTANT:
     * req.body MUST contain ONLY canonical field strings
     * No bytes. No hex. No Fr reconstruction.
     */
    const result = await generateBorrowProof(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/generate-periodic-proof-of-solvancy", async (req, res) => {
  try {
    /**
     * IMPORTANT:
     * req.body MUST contain ONLY canonical field strings
     * No bytes. No hex. No Fr reconstruction.
     */
    const result = await generatePeriodicProofOfSolvancy(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/generate-repayment-proof", async (req,res) => {
  try{
    const result = await generateRepaymentProof(req.body);
    res.json(result);
  }catch(err){
    console.error(err);
    res.status(500).json({error: err.message})
  }
})

app.listen(4000, () => {
  console.log("ZK service running at http://localhost:4000");
});