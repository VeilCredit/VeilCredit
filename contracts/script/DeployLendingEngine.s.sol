// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script,console} from "forge-std/Script.sol";
import {LendingEngine} from "../src/LendingEngine.sol";
import {StealthVault,Poseidon2} from "../src/StealthVault.sol";
import {CollateralHonkVerifier, HealthHonkVerifier} from "../test/CollateralHonkVerifier.sol";
import {RepaymentHonkVerifier} from "../test/RepaymentHonkVerifier.sol";
import {HelperConfig} from "./HelperConfig.sol";
import {LpToken} from "../src/tokens/LpToken.sol";
import {ERC20Mock} from "lib/openzeppelin-contracts/contracts/mocks/token/ERC20Mock.sol";

contract DeployLendingEngine is Script{
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
        Poseidon2 posiedon2 = new Poseidon2();
        vm.startBroadcast(deployerKey);
        ERC20Mock usdt = new ERC20Mock();
        LpToken lpToken = new LpToken();
        address user = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        CollateralHonkVerifier collateralHonkVerifier = new CollateralHonkVerifier();
        HealthHonkVerifier healthHonkVerifier = new HealthHonkVerifier();
        RepaymentHonkVerifier repaymentHonkVerifier = new RepaymentHonkVerifier();
        StealthVault stealthVault = new StealthVault(
            weth,
            16,
            posiedon2,
            address(repaymentHonkVerifier),
            address(weth)
        );
        ERC20Mock(address(weth)).mint(user, 1e18 * 10);

        LendingEngine lendingEngine = new LendingEngine(
            address(usdt),
            address(lpToken),
            address(collateralHonkVerifier),
            WETH_TOKEN_ID,
            address(stealthVault),
            16,
            posiedon2,
            address(healthHonkVerifier)
        );
        stealthVault.transferOwnership(address(lendingEngine));
        ERC20Mock(address(usdt)).mint(
            address(lendingEngine),
            1e18 * 100000
        );

        console.log("addreess lendingengine",address(lendingEngine));
        console.log("address stealthvault",address(stealthVault));
        vm.stopBroadcast();

    } 
}

