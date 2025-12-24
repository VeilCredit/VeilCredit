export const LendingEngineAbi = [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "borrowToken_",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "lpTokenAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "collateralVerifier_",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "collateralTokenId_",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "stealthVault_",
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
          "name": "healthProofVerifier_",
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
      "name": "LIQUIDATION_THRESHOLD",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MINIMUM_COLLATERIZATION_RATIO",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "PRECISION",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "PROOF_SUBMISSION_INTERVAL",
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
      "name": "borrowLoan",
      "inputs": [
        { "name": "proof_", "type": "bytes", "internalType": "bytes" },
        { "name": "root_", "type": "bytes32", "internalType": "bytes32" },
        {
          "name": "nullifierHash_",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "borrowAmount_",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "assetPrice_", "type": "uint256", "internalType": "uint256" },
        { "name": "tokenId_", "type": "uint256", "internalType": "uint256" },
        {
          "name": "recepientAddress",
          "type": "address",
          "internalType": "address payable"
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
      "name": "checkUpkeep",
      "inputs": [{ "name": "", "type": "bytes", "internalType": "bytes" }],
      "outputs": [
        { "name": "upkeepNeeded", "type": "bool", "internalType": "bool" },
        { "name": "performData", "type": "bytes", "internalType": "bytes" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "depositLiquidity",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getBorrowTokenAddress",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getBorrowerIndex",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCollateralTokenId",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getLoanDetails",
      "inputs": [
        {
          "name": "nullifierHash_",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct LendingEngine.Loan",
          "components": [
            {
              "name": "borrowAmount",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
            {
              "name": "minimumCollateralUsed",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "startTime",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "userBorrowIndex",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "isLiquidated", "type": "bool", "internalType": "bool" },
            { "name": "repaid", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getMinimumCollateral",
      "inputs": [
        {
          "name": "borrowAmountUSDT",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "collateralPriceUSD",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "minimumCollateralUsed",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getTotalBorrow",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getTotalBorrowAmount",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getTotalDepositAmount",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getTotalReserves",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getTotalSupply",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "i_collateralVerifier",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract IVerifier" }
      ],
      "stateMutability": "view"
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
      "name": "i_hasher",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract Poseidon2" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "i_healthVerifier",
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
      "name": "performUpkeep",
      "inputs": [
        { "name": "performData", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "repayLoan",
      "inputs": [
        { "name": "commitment_", "type": "bytes32", "internalType": "bytes32" },
        { "name": "amount_", "type": "uint256", "internalType": "uint256" },
        {
          "name": "nullifierHash_",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        { "name": "insertedIndex", "type": "uint32", "internalType": "uint32" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "s_borrowToken",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "s_borrowerIndex",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "borrowerIndexOfToken",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
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
      "name": "s_collateralTokenId",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
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
      "name": "s_loanUpdateTime",
      "inputs": [
        {
          "name": "nullifierHash",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
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
      "inputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
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
      "name": "s_tokenDetailsofUser",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "verifyCollateralHealth",
      "inputs": [
        { "name": "proof", "type": "bytes", "internalType": "bytes" },
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
      "name": "LiquidityDeposited",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "tokenAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amountDeposited",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "lpTokenMinted",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "LoanBorrowed",
      "inputs": [
        {
          "name": "recepient",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "nullifierHash_",
          "type": "bytes32",
          "indexed": false,
          "internalType": "bytes32"
        },
        {
          "name": "timestamp",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
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
      "name": "LendingEngine__AmountShouldBeGreaterThanZero",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__CommitmentAlreadyExists",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__CommitmentAlreadyUsed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__HealthProofVerificationFailed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__InvalidCollateralToken",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__InvalidDepositAmount",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__InvalidDepositToken",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__InvalidRepayAmount",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__LoanAlreadyLiquidated",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingEngine__NoActiveLoanFound",
      "inputs": []
    },
    { "type": "error", "name": "LendingEngine__UnknownRoot", "inputs": [] },
    {
      "type": "error",
      "name": "LendingEngine__VerificationFailed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LendingPoolContract__LpTokenMintFailed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "SafeERC20FailedOperation",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "address" }
      ]
    }
  ] as const