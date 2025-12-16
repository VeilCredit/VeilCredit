import {ethers, Result} from "ethers";
import { Barretenberg,Fr } from "@aztec/bb.js";

export default async function generateRepaymentCommitment(): Promise<string>{
    const bb = await Barretenberg.new();
    const nullifier = Fr.random();
    const secret = Fr.random();
    const commitment: Fr = await bb.poseidon2Hash([
        nullifier,
        secret
    ])

    const result  = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32","bytes32","bytes32"],
        [commitment.toBuffer(),nullifier.toBuffer(),secret.toBuffer()]
    );
    return result;
}
(async () => {
    const result = await generateRepaymentCommitment();
    process.stdout.write(result);
    process.exit(0);
})().catch(err => {
    console.error("Error:", err); 
    process.exit(1);
});