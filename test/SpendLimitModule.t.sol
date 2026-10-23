// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {SpendLimitModule} from "../src/SpendLimitModule.sol";

contract SpendLimitModuleTest is Test {
    SpendLimitModule public module;

    // Эмуляция адресов для теста
    address public owner = address(0x111);
    address public usdcToken = address(0x036CbD53842c5426634e7929541eC2318f3dCF7e);
    address public allowedRecipient = address(0x222);
    address public unknownRecipient = address(0x999);

    // Начальный лимит: 100 USDC (учитываем 6 знаков после запятой: 100_000_000)
    uint256 public constant INITIAL_DAILY_LIMIT = 100 * 1e6;

    function setUp() public {
        // Запускаем конструктор от имени owner
        vm.prank(owner);
        module = new SpendLimitModule(usdcToken, INITIAL_DAILY_LIMIT);

        // Добавляем разрешенный адрес в белый список от имени owner
        vm.prank(owner);
        module.setWhitelist(allowedRecipient, true);
    }

    // 1. Проверяем успешный платеж в рамках лимита
    function test_SuccessfulPayment() public {
        uint256 paymentAmount = 40 * 1e6; // 40 USDC

        module.validateAndRecordSpend(allowedRecipient, paymentAmount);

        assertEq(module.currentPeriodSpent(), paymentAmount, "Current period spent should equal payment amount");
    }

    // 2. Проверяем блокировку при попытке отправить деньги не из белого списка
    function test_RevertWhen_TargetNotWhitelisted() public {
        uint256 paymentAmount = 10 * 1e6;

        vm.expectRevert(
            abi.encodeWithSelector(SpendLimitModule.TargetNotWhitelisted.selector, unknownRecipient)
        );
        module.validateAndRecordSpend(unknownRecipient, paymentAmount);
    }

    // 3. Проверяем блокировку при превышении суточного лимита
    function test_RevertWhen_ExceedsDailyLimit() public {
        // Платеж 110 USDC при лимите в 100 USDC
        uint256 excessAmount = 110 * 1e6;

        vm.expectRevert(
            abi.encodeWithSelector(SpendLimitModule.ExceedsDailyLimit.selector, excessAmount, INITIAL_DAILY_LIMIT)
        );
        module.validateAndRecordSpend(allowedRecipient, excessAmount);
    }

    // 4. Проверяем сброс суточного лимита через 24 часа
    function test_DailyLimitResetsAfter24Hours() public {
        uint256 paymentAmount = 80 * 1e6;

        // Делаем платеж на 80 USDC
        module.validateAndRecordSpend(allowedRecipient, paymentAmount);

        // Перематываем время вперед на 24 часа и 1 секунду
        vm.warp(block.timestamp + 1 days + 1);

        // Теперь можно совершить еще один платеж на 80 USDC, так как лимит сбросился
        module.validateAndRecordSpend(allowedRecipient, paymentAmount);

        assertEq(module.currentPeriodSpent(), paymentAmount, "Spent amount should reset for new period");
    }
}