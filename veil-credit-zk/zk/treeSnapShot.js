import { IncrementalMerkleTree } from "./incrementalMerkleTree.js";


export async function buildTreeUpTo(bb, leaves, targetLeaf) {
  const tree = new IncrementalMerkleTree(bb);

  for (const leaf of leaves) {
    await tree.insert(leaf);
    if (leaf === targetLeaf) break;
  }

  return tree;
}