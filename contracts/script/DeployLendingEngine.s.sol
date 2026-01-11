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

        address user = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        address collateralVerifier = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512;
        address loanRepaymentVerifier = 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707;
        address loanHealthVerifier = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;
        StealthVault stealthVault = new StealthVault(
            weth,
            16,
            posiedon2,
            loanRepaymentVerifier,
            address(weth)
        );
        ERC20Mock(address(weth)).mint(user, 1e18 * 10);

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
        ERC20Mock(address(usdt)).mint(address(lendingEngine), 1e18 * 100000);

        console.log("addreess lendingengine", address(lendingEngine));
        console.log("address stealthvault", address(stealthVault));
        console.log("address weth", address(weth));
        console.log("address usdt", address(usdt));
        lendingEngine.callPerformUpKeep();
        vm.stopBroadcast();
    }
}

// addreess lendingengine 0x9A676e781A523b5d0C0e43731313A708CB607508
//   address stealthvault 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
