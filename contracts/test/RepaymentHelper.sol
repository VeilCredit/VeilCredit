// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "forge-std/Test.sol";

struct RepaymentProofParams {
    bytes32 nullifierDeposit;
    bytes32 secretDeposit;
    uint256 borrowAmount;
    uint256 assetPrice;
    uint256 tokenId;
    address recepient;
    uint256 minCollateralizationRatio;
    uint256 actualCollateralizationRatio;
    uint256 collateralAmount;
    bytes32 nullifierRepayment;
    bytes32 secretRepayment;
    uint256 withdrawAmount;
}

contract RepaymentProofHelper is Test {

    function getRepaymentProof(
        RepaymentProofParams memory params,
        bytes32[] memory leavesDeposit,
        bytes32[] memory leavesRepayment
    ) external returns (bytes memory, bytes32[] memory) {
        string[] memory inputs = _buildInputArray(params, leavesDeposit, leavesRepayment);
        bytes memory result = vm.ffi(inputs);
        return abi.decode(result, (bytes, bytes32[]));
    }

    function _buildInputArray(
        RepaymentProofParams memory params,
        bytes32[] memory leavesDeposit,
        bytes32[] memory leavesRepayment
    ) private pure returns(string[] memory) {
        // +1 for "--split" separator
        uint256 totalSize = 15 + leavesDeposit.length + 1 + leavesRepayment.length;
        string[] memory inputs = new string[](totalSize);

        _setBaseInputs(inputs);
        _setParams(inputs, params);
        _setLeaves(inputs, leavesDeposit, leavesRepayment);

        return inputs;
    }

    function _setBaseInputs(string[] memory inputs) private pure {
        inputs[0] = "npx";
        inputs[1] = "tsx";
        inputs[2] = "js-scripts/generateRepaymentProof.ts";
    }

    function _setParams(string[] memory inputs, RepaymentProofParams memory p) private pure {
        // ✅ Ordered to match TS argv exactly
        inputs[3]  = vm.toString(p.nullifierDeposit);
        inputs[4]  = vm.toString(p.secretDeposit);
        inputs[5]  = vm.toString(p.borrowAmount);
        inputs[6]  = vm.toString(p.assetPrice);
        inputs[7]  = vm.toString(p.tokenId);
        inputs[8]  = vm.toString(bytes32(uint256(uint160(p.recepient))));
        inputs[9]  = vm.toString(p.minCollateralizationRatio);
        inputs[10] = vm.toString(p.actualCollateralizationRatio);
        inputs[11] = vm.toString(p.collateralAmount);
        inputs[12] = vm.toString(p.nullifierRepayment);
        inputs[13] = vm.toString(p.secretRepayment);
        inputs[14] = vm.toString(p.withdrawAmount);
    }

    function _setLeaves(
        string[] memory inputs,
        bytes32[] memory leavesDeposit,
        bytes32[] memory leavesRepayment
    ) private pure {
        uint256 offset = 15;

        // Deposit leaves
        for (uint256 i = 0; i < leavesDeposit.length; i++) {
            inputs[offset++] = vm.toString(leavesDeposit[i]);
        }

        // 🔥 Insert "--split" for TS parser
        inputs[offset++] = "--split";

        // Repayment leaves
        for (uint256 i = 0; i < leavesRepayment.length; i++) {
            inputs[offset++] = vm.toString(leavesRepayment[i]);
        }
    }
}