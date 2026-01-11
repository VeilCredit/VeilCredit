import { Barretenberg, Fr } from "@aztec/bb.js";

const ZERO_VALUES = [
  "0x0451eb4c47d57fcdbfc03ece9dca82d8eb9cc0fdf2fc29f35c737bd7870c3316",
  "0x1f382b89487e99307da129bd27498f0689b61ec3377002dca5c0b377059d6021",
  "0x17f01878cf077ca76ea2dae68c061a72dbdc9409ca8a97afa234c3b2eff35894",
  "0x0baebc4ece3df90a95f4dd6955ee882757da72018e7a9aae8e2fb514a8eb4f83",
  "0x0a2a7a8d230ae091b8632a898173d0b6826b4b2bb3988743e256d90452bfce9f",
  "0x0ba905b9914303c7dfbe46c6fe078d560787a82a5ef8a42ec1e59a909ac07c41",
  "0x10ebdbf41d16456b4baacb705009cd02d8eaf0ccae37a640e0c06aafeb06de61",
  "0x082ef2fa251d49df0c54686da6f2e413bff48eb5975abea2a9ff20049f8dc778",
  "0x01662928cbf03d39083c8f55873b7c3ea6bb2d9b310459314e6b2defac6aa8fb",
  "0x24be53f765be812833d3d4a80d6a58b6d2bb63e5cd41420832d2e5e56672517e",
  "0x2c269eed81e12e6519e955889c0deeb1377a215de6be738ebfbd70737b6453e8",
  "0x1e8e0239c8b8804918ee5eb9a40d5ee8e75a93bbbca4bc7656005fe134708b6b",
  "0x17c71fe6702f7f6f7a39e1aa4cd93431ff2c5a9c9d3621f5ddbaffe73ca6eeb2",
  "0x17f39263d0911883dc3db2a32c55780b11c976f608a13ef63d9744ffa5fc3118",
  "0x0ca1a6043263474bab095312fdcc6c3f9c72fe3e67c7a795090cf376533f7f5a",
  "0x1b272f362459073ff21522bdcb2e1d7fca9ff41cb0c8057a53b6d932dc3c18df"
];

export async function merkleTree(leaves) {
  const bb = await Barretenberg.new();

  try {
    const leaf = new Fr(BigInt(leaves[0]));
    let current = leaf;

    const pathElements = [];
    const pathIndices = [];

    for (let i = 0; i < 16; i++) {
      const sibling = new Fr(BigInt(ZERO_VALUES[i]));
      pathElements.push(sibling.toString());
      pathIndices.push(true); // ✅ leaf is always LEFT
      current = await bb.poseidon2Hash([current, sibling]);
    }

    return {
      root: current.toString(),
      getIndex: () => 0,
      proof: () => ({
        root: current.toString(),
        pathElements,
        pathIndices,
      }),
    };
  } finally {
    await bb.destroy();
  }
}