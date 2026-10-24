// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title SpendLimitModule
 * @notice Security module (Guardrail) for AI agents.
 * Strictly limits the daily USDC spending cap and allowed recipient addresses.
 */
contract SpendLimitModule {
    // Smart account owner (company / B2B client)
    address public immutable owner;

    // USDC token address (e.g., on Base Sepolia network)
    address public immutable usdcToken;

    // Daily limit in atomic units (for USDC, 6 decimals, i.e., 100 USDC = 100_000_000)
    uint256 public dailyLimit;

    // Start time of the current 24-hour window
    uint256 public currentPeriodStart;

    // Amount already spent in the current 24-hour window
    uint256 public currentPeriodSpent;

    // Target whitelist of allowed destination addresses
    mapping(address => bool) public isWhitelisted;

    // Security errors
    error NotOwner();
    error TargetNotWhitelisted(address target);
    error ExceedsDailyLimit(uint256 requested, uint256 available);

    // Tracking events
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
     * @notice Add or remove an address from the whitelist
     */
    function setWhitelist(address target, bool status) external onlyOwner {
        isWhitelisted[target] = status;
        emit WhitelistUpdated(target, status);
    }

    /**
     * @notice Update the daily spend limit
     */
    function setDailyLimit(uint256 newLimit) external onlyOwner {
        dailyLimit = newLimit;
        emit LimitUpdated(newLimit);
    }

    /**
     * @notice Validate and record an AI agent payment
     * @dev This method is called before executing the agent transaction
     */
    function validateAndRecordSpend(address target, uint256 amount) external {
        // 1. Check address whitelist
        if (!isWhitelisted[target]) {
            revert TargetNotWhitelisted(target);
        }

        // 2. Reset daily window if 24 hours (86400 seconds) have passed
        if (block.timestamp >= currentPeriodStart + 1 days) {
            currentPeriodStart = block.timestamp;
            currentPeriodSpent = 0;
        }

        // 3. Check daily spend limit
        if (currentPeriodSpent + amount > dailyLimit) {
            revert ExceedsDailyLimit(amount, dailyLimit - currentPeriodSpent);
        }

        // 4. Record the expenditure
        currentPeriodSpent += amount;

        emit PaymentExecuted(target, amount);
    }
}
