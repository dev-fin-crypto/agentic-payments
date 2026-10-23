// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title SpendLimitModule
 * @notice Модуль безопасности (Guardrail) для AI-агентов.
 * Жестко ограничивает суточный лимит трат в USDC и разрешенные адреса получателей.
 */
contract SpendLimitModule {
    // Владелец смарт-аккаунта (компания / B2B клиент)
    address public immutable owner;
    
    // Адрес токена USDC (например, в сети Base Sepolia)
    address public immutable usdcToken;

    // Суточный лимит в атомарных единицах (для USDC это 6 знаков, т.е. 100 USDC = 100_000_000)
    uint256 public dailyLimit;

    // Время начала текущего 24-часового окна
    uint256 public currentPeriodStart;

    // Сумма, уже потраченная в текущем 24-часовом окне
    uint256 public currentPeriodSpent;

    // Белый список разрешенных адресов назначений (Target Whitelist)
    mapping(address => bool) public isWhitelisted;

    // Ошибки безопасности
    error NotOwner();
    error TargetNotWhitelisted(address target);
    error ExceedsDailyLimit(uint256 requested, uint256 available);

    // События для отслеживания
    event LimitUpdated(uint256 newLimit);
    event WhitelistUpdated(address indexed target, bool status);
    event PaymentExecuted(address indexed target, uint256 amount);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _usdcToken, uint256 _initialDailyLimit) {
        owner = msg.sender;
        usdcToken = _usdcToken;
        dailyLimit = _initialDailyLimit;
        currentPeriodStart = block.timestamp;
    }

    /**
     * @notice Добавить или удалить адрес из белого списка
     */
    function setWhitelist(address target, bool status) external onlyOwner {
        isWhitelisted[target] = status;
        emit WhitelistUpdated(target, status);
    }

    /**
     * @notice Изменить суточный лимит
     */
    function setDailyLimit(uint256 newLimit) external onlyOwner {
        dailyLimit = newLimit;
        emit LimitUpdated(newLimit);
    }

    /**
     * @notice Проверка и регистрация платежа AI-агента
     * @dev Этот метод вызывается перед исполнением транзакции агента
     */
    function validateAndRecordSpend(address target, uint256 amount) external {
        // 1. Проверка белого списка адресов
        if (!isWhitelisted[target]) {
            revert TargetNotWhitelisted(target);
        }

        // 2. Сброс суточного окна, если прошло 24 часа (86400 секунд)
        if (block.timestamp >= currentPeriodStart + 1 days) {
            currentPeriodStart = block.timestamp;
            currentPeriodSpent = 0;
        }

        // 3. Проверка суточного лимита
        if (currentPeriodSpent + amount > dailyLimit) {
            revert ExceedsDailyLimit(amount, dailyLimit - currentPeriodSpent);
        }

        // 4. Фиксация расхода
        currentPeriodSpent += amount;

        emit PaymentExecuted(target, amount);
    }
}