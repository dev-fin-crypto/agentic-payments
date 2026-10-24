// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {SpendLimitModule} from "../src/SpendLimitModule.sol";

contract SpendLimitModuleTest is Test {
    SpendLimitModule public module;

    // Emulated addresses for testing
    address public owner = address(0x111);
    address public usdcToken = address(0x036CbD53842c5426634e7929541eC2318f3dCF7e);
    address public allowedRecipient = address(0x222);
    address public unknownRecipient = address(0x999);

    // Initial limit: 100 USDC (accounting for 6 decimal places: 100_000_000)
    uint256 public constant INITIAL_DAILY_LIMIT = 100 * 1e6;

    function setUp() public {
        // Deploy constructor as owner
        vm.prank(owner);
        module = new SpendLimitModule(usdcToken, INITIAL_DAILY_LIMIT);

        // Add allowed address to whitelist as owner
        vm.prank(owner);
        module.setWhitelist(allowedRecipient, true);
    }

    // 1. Verify successful payment within the limit
    function test_SuccessfulPayment() public {
        uint256 paymentAmount = 40 * 1e6; // 40 USDC

        module.validateAndRecordSpend(allowedRecipient, paymentAmount);

        assertEq(module.currentPeriodSpent(), paymentAmount, "Current period spent should equal payment amount");
    }

    // 2. Verify revert when trying to send funds to a non-whitelisted address
    function test_RevertWhen_TargetNotWhitelisted() public {
        uint256 paymentAmount = 10 * 1e6;

        vm.expectRevert(abi.encodeWithSelector(SpendLimitModule.TargetNotWhitelisted.selector, unknownRecipient));
        module.validateAndRecordSpend(unknownRecipient, paymentAmount);
    }

    // 3. Verify revert when exceeding the daily spend limit
    function test_RevertWhen_ExceedsDailyLimit() public {
        // Payment of 110 USDC with a 100 USDC limit
        uint256 excessAmount = 110 * 1e6;

        vm.expectRevert(
            abi.encodeWithSelector(SpendLimitModule.ExceedsDailyLimit.selector, excessAmount, INITIAL_DAILY_LIMIT)
        );
        module.validateAndRecordSpend(allowedRecipient, excessAmount);
    }

    // 4. Verify daily limit resets after 24 hours
    function test_DailyLimitResetsAfter24Hours() public {
        uint256 paymentAmount = 80 * 1e6;

        // Make a payment of 80 USDC
        module.validateAndRecordSpend(allowedRecipient, paymentAmount);

        // Warp time forward by 24 hours and 1 second
        vm.warp(block.timestamp + 1 days + 1);

        // Now another 80 USDC payment can be made since the limit has reset
        module.validateAndRecordSpend(allowedRecipient, paymentAmount);

        assertEq(module.currentPeriodSpent(), paymentAmount, "Spent amount should reset for new period");
    }
}
