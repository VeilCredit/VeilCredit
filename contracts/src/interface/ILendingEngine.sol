// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

interface ILendingEngine{
    function depositLiquidity(address token,uint256 amount) external;
    function borrowLoan(
        bytes memory proof_,
        bytes32 root_,
        bytes32 nullifierHash_,
        uint256 borrowAmount_,
        uint256 assetPrice_,
        uint256 tokenId_,
        address payable recepientAddress,
        bytes32[] memory publicInputs
    ) external;


    function getMinimumCollateral(uint256 borrowAmountUSDT,uint256 collateralPriceUSD) external pure returns(uint256 minimumCollateralUsed);
    
    function getBorrowTokenAddress() external view returns(address);
    function getCollateralTokenId() external view returns(uint256);
    function repayLoan(
        bytes32 commitment_,
        uint256 amount_,
        bytes32 nullifierHash_
    ) external returns(uint32 insertedIndex);
    function isKnownRoot(bytes32 _root) external view returns (bool);
    function getTotalSupply() external returns(uint256);
    function getTotalBorrow() external returns(uint256);
    function getTotalReserves() external returns(uint256);
}