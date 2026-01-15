// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script, console} from "forge-std/Script.sol";
import {LendingEngine} from "../src/LendingEngine.sol";
import {StealthVault, Poseidon2} from "../src/StealthVault.sol";
import {CollateralHonkVerifier, HealthHonkVerifier} from "../test/CollateralHonkVerifier.sol";
import {RepaymentHonkVerifier} from "../test/RepaymentHonkVerifier.sol";
import {HelperConfig} from "./HelperConfig.sol";
import {LpToken} from "../src/tokens/LpToken.sol";
import {ERC20Mock} from "lib/openzeppelin-contracts/contracts/mocks/token/ERC20Mock.sol";
import {PriceSnapShot} from "../src/PriceSnapshot.sol";

contract DeployLendingEngine is Script {
    function run() public {
        uint256 WETH_TOKEN_ID = 0;
        HelperConfig helperConfig = new HelperConfig();
        (
            address wethPriceFeedAddress,
            address wbtcPriceFeedAddress,
            address weth,
            address wbtc,
            uint256 deployerKey
        ) = helperConfig.activeNetworkConfig();
        vm.startBroadcast(deployerKey);
        Poseidon2 posiedon2 = new Poseidon2();
        ERC20Mock usdt = new ERC20Mock();
        LpToken lpToken = new LpToken();
        console.log("wethPriceFeedAddress", wethPriceFeedAddress);
        uint256 size;
        assembly {
            size := extcodesize(wethPriceFeedAddress)
        }
        console.log("price feed code size", size);

        address collateralVerifier = 0x71795dA3422c1ECf82EE215A467dF1e8c1A96472;
        address loanRepaymentVerifier = 0xC7e1bD0fe99286e75a1ed31405C9C33e73BF1E64;
        address loanHealthVerifier = 0x5d7C1CfD7c9e32f8ea79F79c8d7D62f8b14B90f9;
        StealthVault stealthVault = new StealthVault(
            weth,
            16,
            posiedon2,
            loanRepaymentVerifier,
            address(weth)
        );

        LendingEngine lendingEngine = new LendingEngine(
            address(wethPriceFeedAddress),
            address(usdt),
            address(lpToken),
            collateralVerifier,
            WETH_TOKEN_ID,
            address(stealthVault),
            16,
            posiedon2,
            loanHealthVerifier
        );
        stealthVault.setLendingEngine(address(lendingEngine));
        stealthVault.transferOwnership(address(lendingEngine));

        console.log("addreess lendingengine", address(lendingEngine));
        console.log("address stealthvault", address(stealthVault));
        console.log("address weth", address(weth));
        console.log("address usdt", address(usdt));
        lendingEngine.callPerformUpKeep();
        vm.stopBroadcast();
    }
}
