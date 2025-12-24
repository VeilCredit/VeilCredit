// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
interface IIncrementalMerkleTree{
    function isKnownRoot(bytes32 _root) external view returns (bool);
}