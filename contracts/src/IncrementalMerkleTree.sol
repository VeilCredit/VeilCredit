// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;
import {Poseidon2, Field} from "lib/poseidon2-evm/src/Poseidon2.sol";
import {console2} from "forge-std/console2.sol";
contract IncrementalMerkleTree{
    // errors
    error IncrementalMerkleTree__DepthZeroNotAllowed();
    error IncrementalMerkleTree__IndexOutOfBounds();
    error IncrementalMerkleTree__MerkleTreeFull();
    error IncrementalMerkleTree__DepthShouldBeLessThan32();

    // immutable variables
    uint32 public immutable i_depth;
    Poseidon2 public immutable i_hasher;


    // state variables
    uint32 public s_nextLeafIndex;
    uint32 public s_currentRootIndex;

    // mappings
    mapping(uint32 => bytes32) public s_cachedSubtrees;
    mapping(uint256 => bytes32) public s_roots;

    // constant variables
    uint32 public constant ROOT_HISTORY_SIZE = 30;
    uint256 public constant FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617;


    constructor(uint32 _depth, Poseidon2 _hasher){
        i_hasher = _hasher;
        if (_depth == 0) {
            revert IncrementalMerkleTree__DepthZeroNotAllowed();
        }
        if (_depth >= 32) {
            revert IncrementalMerkleTree__DepthShouldBeLessThan32();
        }
        i_depth = _depth;
        // initialize the merkle tree here with zeros
        // store the inital root in storage
        s_roots[0] = zeros(_depth - 1);
    }


    function _insert(bytes32 _leaf) internal returns(uint32){
        uint32 _nextLeafIndex = s_nextLeafIndex;
        if (_nextLeafIndex == uint32(2 ** i_depth)) {
            revert IncrementalMerkleTree__MerkleTreeFull();
        }
        uint32 currentIndex = _nextLeafIndex;
        bytes32 currentHash = _leaf;
        bytes32 left;
        bytes32 right;
        for(uint32 i=0;i<i_depth;i++){
            if(currentIndex % 2 ==0){
                left = currentHash;
                right = zeros(i);
                s_cachedSubtrees[i] = currentHash;
            }else{
                left = s_cachedSubtrees[i];
                right = currentHash;
            
            }
            
            currentHash = Field.toBytes32(
                i_hasher.hash_2(Field.toField(left), Field.toField(right))
            );
            currentIndex / 2;
        }
        uint32 newRootIndex = (s_currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        s_currentRootIndex = newRootIndex;
        s_roots[newRootIndex] = currentHash;
        s_nextLeafIndex = _nextLeafIndex + 1;
        return _nextLeafIndex;
    }
    function isKnownRoot(bytes32 _root) public view returns (bool) {
        uint32 currentRootIndex = s_currentRootIndex;
        uint32 i = s_currentRootIndex;
        if (_root == 0) return false;
        do {
            if (_root == s_roots[i]) {
                return true;
            }
            if (i == 0) {
                i = ROOT_HISTORY_SIZE;
            }
            i--;
        } while (i != currentRootIndex);
        return false;
    }

    function zeros(uint256 i) public pure returns (bytes32) {
        if (i == 0)
            return
                bytes32(
                    0x0451eb4c47d57fcdbfc03ece9dca82d8eb9cc0fdf2fc29f35c737bd7870c3316
                );
        else if (i == 1)
            return
                bytes32(
                    0x1f382b89487e99307da129bd27498f0689b61ec3377002dca5c0b377059d6021
                );
        else if (i == 2)
            return
                bytes32(
                    0x17f01878cf077ca76ea2dae68c061a72dbdc9409ca8a97afa234c3b2eff35894
                );
        else if (i == 3)
            return
                bytes32(
                    0x0baebc4ece3df90a95f4dd6955ee882757da72018e7a9aae8e2fb514a8eb4f83
                );
        else if (i == 4)
            return
                bytes32(
                    0x0a2a7a8d230ae091b8632a898173d0b6826b4b2bb3988743e256d90452bfce9f
                );
        else if (i == 5)
            return
                bytes32(
                    0x0ba905b9914303c7dfbe46c6fe078d560787a82a5ef8a42ec1e59a909ac07c41
                );
        else if (i == 6)
            return
                bytes32(
                    0x10ebdbf41d16456b4baacb705009cd02d8eaf0ccae37a640e0c06aafeb06de61
                );
        else if (i == 7)
            return
                bytes32(
                    0x082ef2fa251d49df0c54686da6f2e413bff48eb5975abea2a9ff20049f8dc778
                );
        else if (i == 8)
            return
                bytes32(
                    0x01662928cbf03d39083c8f55873b7c3ea6bb2d9b310459314e6b2defac6aa8fb
                );
        else if (i == 9)
            return
                bytes32(
                    0x24be53f765be812833d3d4a80d6a58b6d2bb63e5cd41420832d2e5e56672517e
                );
        else if (i == 10)
            return
                bytes32(
                    0x2c269eed81e12e6519e955889c0deeb1377a215de6be738ebfbd70737b6453e8
                );
        else if (i == 11)
            return
                bytes32(
                    0x1e8e0239c8b8804918ee5eb9a40d5ee8e75a93bbbca4bc7656005fe134708b6b
                );
        else if (i == 12)
            return
                bytes32(
                    0x17c71fe6702f7f6f7a39e1aa4cd93431ff2c5a9c9d3621f5ddbaffe73ca6eeb2
                );
        else if (i == 13)
            return
                bytes32(
                    0x17f39263d0911883dc3db2a32c55780b11c976f608a13ef63d9744ffa5fc3118
                );
        else if (i == 14)
            return
                bytes32(
                    0x0ca1a6043263474bab095312fdcc6c3f9c72fe3e67c7a795090cf376533f7f5a
                );
        else if (i == 15)
            return
                bytes32(
                    0x1b272f362459073ff21522bdcb2e1d7fca9ff41cb0c8057a53b6d932dc3c18df
                );
        
        else revert IncrementalMerkleTree__IndexOutOfBounds();
    }
}