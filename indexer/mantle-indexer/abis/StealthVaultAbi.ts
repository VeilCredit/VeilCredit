export const StealthVaultAbi = [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "ethTokenAddress_",
          "type": "address",
          "internalType": "address"
        },
        { "name": "depth_", "type": "uint32", "internalType": "uint32" },
        {
          "name": "hasher_",
          "type": "address",
          "internalType": "contract Poseidon2"
        },
        {
          "name": "repaymentVerifier_",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "collateralTokenAddress",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "FIELD_SIZE",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ROOT_HISTORY_SIZE",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "deposit",
      "inputs": [
        { "name": "token_", "type": "address", "internalType": "address" },
        { "name": "amount_", "type": "uint256", "internalType": "uint256" },
        { "name": "commitment_", "type": "bytes32", "internalType": "bytes32" }
      ],
      "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "i_depth",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "i_ethTokenAddress",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "i_hasher",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract Poseidon2" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "i_repaymentVerifier",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract IVerifier" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isKnownRoot",
      "inputs": [
        { "name": "_root", "type": "bytes32", "internalType": "bytes32" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "liquidationCollateralTransfer",
      "inputs": [
        {
          "name": "s_collateralTokenId",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "s_cachedSubtrees",
      "inputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
      "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "s_collateralIdToAddress",
      "inputs": [
        {
          "name": "collateralTokenId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "s_commitments",
      "inputs": [
        { "name": "commitment", "type": "bytes32", "internalType": "bytes32" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "s_currentRootIndex",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "s_nextLeafIndex",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "s_nullifierHashes",
      "inputs": [
        {
          "name": "nullifierHash",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "s_roots",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "setLendingEngine",
      "inputs": [
        {
          "name": "lendingEngine_",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdraw",
      "inputs": [
        { "name": "token_", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" },
        { "name": "proof_", "type": "bytes", "internalType": "bytes" },
        { "name": "root_1", "type": "bytes32", "internalType": "bytes32" },
        { "name": "root_2", "type": "bytes32", "internalType": "bytes32" },
        {
          "name": "nullifierHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "withdrawAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "publicInputs",
          "type": "bytes32[]",
          "internalType": "bytes32[]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "zeros",
      "inputs": [{ "name": "i", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
      "stateMutability": "pure"
    },
    {
      "type": "event",
      "name": "Deposit",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "indexed": false,
          "internalType": "bytes32"
        },
        {
          "name": "insertedIndex",
          "type": "uint32",
          "indexed": false,
          "internalType": "uint32"
        },
        {
          "name": "timeStamp",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "DepositWithdrawn",
      "inputs": [
        {
          "name": "withdrawer",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "IncrementalMerkleTree__DepthShouldBeLessThan32",
      "inputs": []
    },
    {
      "type": "error",
      "name": "IncrementalMerkleTree__DepthZeroNotAllowed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "IncrementalMerkleTree__IndexOutOfBounds",
      "inputs": []
    },
    {
      "type": "error",
      "name": "IncrementalMerkleTree__MerkleTreeFull",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__CommitmentAlreadyUsed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        { "name": "account", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "SafeERC20FailedOperation",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "StealthVault__CommitmentAlreadyExists",
      "inputs": []
    },
    {
      "type": "error",
      "name": "StealthVault__InvalidRepaymentProof",
      "inputs": []
    },
    {
      "type": "error",
      "name": "StealthVault__InvalidToken",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "address" }
      ]
    },
    { "type": "error", "name": "StealthVault__UnknownRoot", "inputs": [] }
  ] as const