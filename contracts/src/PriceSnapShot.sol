// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {
    AutomationCompatibleInterface
} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {Poseidon2,Field} from "./IncrementalMerkleTree.sol";

contract PriceSnapShot is AutomationCompatibleInterface {
    AggregatorV3Interface public feed;
    uint256 public currentEpoch;
    uint256 public maxPriceAge = 120;
    uint256 public lastSnapShotRound;
    uint256 public lastSnapShotTime;
    Poseidon2 hasher;

    //  constants

    uint256 public constant SNAPSHOT_INTERVAL = 180; 
    struct SnapShot {
        bytes32 commitment;
        uint256 updatedAt;
        uint64 roundId;
        uint256 price;
    }
    mapping(uint256 => SnapShot) public s_snapShots;

    constructor(address _feed, Poseidon2 _hasher) {
        feed = AggregatorV3Interface(_feed);
        hasher = _hasher;
    }

    function checkUpkeep(
        bytes calldata /*checkData*/
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        (uint80 roundId, , , , ) = feed
            .latestRoundData();
        bool newRound = roundId > lastSnapShotRound;
        bool timePassed = (block.timestamp - lastSnapShotTime) >= SNAPSHOT_INTERVAL;

        upkeepNeeded = newRound || timePassed;
        performData = "";
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        _snapShot();
    }

    // internal funnctions

    function _snapShot() internal{
        (uint80 roundId, int256 price, , uint256 updatedAt, ) = feed
            .latestRoundData();
        require(price>0,"Invalid price");
        currentEpoch++;
        Field.Type[] memory inputs = new Field.Type[](2);
        inputs[0] = Field.toField(roundId);
        inputs[1] = Field.toField(uint256(price));
        Field.Type epochCommitment = hasher.hash(inputs, 2, false);
        s_snapShots[currentEpoch] = SnapShot({
            commitment: Field.toBytes32(epochCommitment),
            updatedAt: updatedAt,
            roundId: uint64(roundId),
            price: uint256(price)
        });
        lastSnapShotRound = uint64(roundId);
        lastSnapShotTime = block.timestamp;
    }

    // getters

    function getCurrentEpoch() external view returns (uint256) {
        return currentEpoch;
    }
    function getCurrentSnapShot() external view returns (SnapShot memory) {
        return s_snapShots[currentEpoch];
    }

    function getSnapShot(uint256 epoch) external view returns (SnapShot memory) {
        return s_snapShots[epoch];
    }

    
}