import { Barretenberg, Fr } from '@aztec/bb.js';

async function hashLeftRight(left, right) {
  const bb = await Barretenberg.new();
  const frLeft = Fr.fromString(left);
  const frRight = Fr.fromString(right);
  const hash = await bb.poseidon2Hash([frLeft, frRight]);
  return hash.toString();
}

export class PoseidonTree {
  constructor(levels, zeros) {
    if (zeros.length < levels + 1) {
      throw new Error("Not enough zero values provided for the given tree height.");
    }
    this.levels = levels;
    this.hashLeftRight = hashLeftRight;
    this.storage = new Map();
    this.zeros = zeros;
    this.totalLeaves = 0;
  }

  async init(defaultLeaves = []) {
    if (defaultLeaves.length > 0) {
      this.totalLeaves = defaultLeaves.length;

      defaultLeaves.forEach((leaf, index) => {
        this.storage.set(PoseidonTree.indexToKey(0, index), leaf);
      });

      for (let level = 1; level <= this.levels; level++) {
        const numNodes = Math.ceil(this.totalLeaves / (2 ** level));
        for (let i = 0; i < numNodes; i++) {
          const left = this.storage.get(PoseidonTree.indexToKey(level - 1, 2 * i)) || this.zeros[level - 1];
          const right = this.storage.get(PoseidonTree.indexToKey(level - 1, 2 * i + 1)) || this.zeros[level - 1];
          const node = await this.hashLeftRight(left, right);
          this.storage.set(PoseidonTree.indexToKey(level, i), node);
        }
      }
    }
  }

  static indexToKey(level, index) {
    return `${level}-${index}`;
  }

  getIndex(leaf) {
    for (const [key, value] of this.storage.entries()) {
      if (value === leaf && key.startsWith('0-')) {
        return parseInt(key.split('-')[1]);
      }
    }
    return -1;
  }

  root() {
    return this.storage.get(PoseidonTree.indexToKey(this.levels, 0)) || this.zeros[this.levels];
  }

  proof(index) {
    const leaf = this.storage.get(PoseidonTree.indexToKey(0, index));
    if (!leaf) throw new Error("leaf not found");

    const pathElements = [];
    const pathIndices = [];

    this.traverse(index, (level, currentIndex, siblingIndex) => {
      const sibling = this.storage.get(PoseidonTree.indexToKey(level, siblingIndex)) || this.zeros[level];
      pathElements.push(sibling);
      pathIndices.push(currentIndex % 2);
    });

    return {
      root: this.root(),
      pathElements,
      pathIndices,
      leaf,
    };
  }

  async insert(leaf) {
    const index = this.totalLeaves;
    await this.update(index, leaf, true);
    this.totalLeaves++;
  }

  async update(index, newLeaf, isInsert = false) {
    if (!isInsert && index >= this.totalLeaves) {
      throw Error("Use insert method for new elements.");
    } else if (isInsert && index < this.totalLeaves) {
      throw Error("Use update method for existing elements.");
    }

    const keyValueToStore = [];
    let currentElement = newLeaf;

    await this.traverseAsync(index, async (level, currentIndex, siblingIndex) => {
      const sibling = this.storage.get(PoseidonTree.indexToKey(level, siblingIndex)) || this.zeros[level];
      const [left, right] = currentIndex % 2 === 0 ? [currentElement, sibling] : [sibling, currentElement];
      keyValueToStore.push({ key: PoseidonTree.indexToKey(level, currentIndex), value: currentElement });
      currentElement = await this.hashLeftRight(left, right);
    });

    keyValueToStore.push({ key: PoseidonTree.indexToKey(this.levels, 0), value: currentElement });
    keyValueToStore.forEach(({ key, value }) => this.storage.set(key, value));
  }

  traverse(index, fn) {
    let currentIndex = index;
    for (let level = 0; level < this.levels; level++) {
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
      fn(level, currentIndex, siblingIndex);
      currentIndex = Math.floor(currentIndex / 2);
    }
  }

  async traverseAsync(index, fn) {
    let currentIndex = index;
    for (let level = 0; level < this.levels; level++) {
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
      await fn(level, currentIndex, siblingIndex);
      currentIndex = Math.floor(currentIndex / 2);
    }
  }
}

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
  "0x1b272f362459073ff21522bdcb2e1d7fca9ff41cb0c8057a53b6d932dc3c18df",
  "0x00a2325623b0d02ff945d6003895712b70a01c6e5c3783ea469b019029a2bbce"
];

export async function merkleTree(leaves) {
  const TREE_HEIGHT = 16;
  const tree = new PoseidonTree(TREE_HEIGHT, ZERO_VALUES);

  await tree.init();

  // Insert some leaves (from input)
  for (const leaf of leaves) {
    await tree.insert(leaf);
  }

  return tree;
}