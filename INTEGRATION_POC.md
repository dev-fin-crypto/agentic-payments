# Integration Proof of Concept: AgentGuardMiddleware & Base Smart Account

This document records the end-to-end (E2E) integration test results between an autonomous agent execution layer and `AgentGuardMiddleware` on Base Mainnet (simulation).

## Architecture Overview

[ AI Agent Context ]
│
│ (1) Transfer Request: recipient, amount, calldata
▼
┌────────────────────────────────────────────────────────┐
│               AgentGuardMiddleware                     │
├────────────────────────────────────────────────────────┤
│  • Whitelist Validation (Target Address)               │
│  • Daily Spend Limit Check (USDC Cap)                  │
│  • Builder Code Injection (bc_jt46z84t)               │
└────────────────────────────────────────────────────────┘
│
├─► [REJECT] ──► Return Error (Access / Limit restriction)
│
▼ (2) Validated UserOperation
┌────────────────────────────────────────────────────────┐
│              Safe Smart Account / Base                 │
├────────────────────────────────────────────────────────┤
│  SpendLimitModule.sol ──► On-chain Execution           │
└────────────────────────────────────────────────────────┘


## E2E Execution Telemetry

* **Environment:** Base Mainnet Simulation
* **Builder Code:** `bc_jt46z84t`
* **Test Runner:** `testAgentIntegration.js`


Initializing autonomous AI agent...
Connecting agentic-payments-guard module (Safe Smart Account / Base)...
Initial limits: { dailyLimitUSDC: 150, spentTodayUSDC: 0, remainingUSDC: 150 }

--- Scenario 1: Agent requests API service payment (50.0 USDC) ---
[APPROVED] Middleware passed the transaction.
Target (USDC Contract): 0x833589fCD6Eb6E08f4c7C32D4f71b54bdA02913
Generated UserOp Calldata (+ Builder Code): 0xa9059cbb...000002faf080bc_jt46z84t
Limit status: { dailyLimitUSDC: 150, spentTodayUSDC: 50, remainingUSDC: 100 }

--- Scenario 2: Agent attempts to transfer funds to an unaudited address ---
[BLOCKED BY GUARD MODULE]: SECURITY REJECTION: Recipient address 0x9999999999999999999999999999999999999999 is not present in the agent's whitelist.

--- Scenario 3: Agent attempts a large purchase (120 USDC with 100 remaining) ---
[BLOCKED BY GUARD MODULE]: GUARDRAIL REJECTION: Daily limit exceeded. Requested: 120.0 USDC, Available: 100 USDC.

--- Scenario 4: Adjusting request within remaining limit bounds (100.0 USDC) ---
[APPROVED] Final payment for remaining balance processed successfully.
Final daily limit metrics: { dailyLimitUSDC: 150, spentTodayUSDC: 150, remainingUSDC: 0 }
AI agent and payment gateway simulation completed successfully!

Verification Summary
Attribution: Builder Code (bc_jt46z84t) is correctly appended to valid UserOperation calldata.

Security: Non-whitelisted destinations are rejected before reaching the execution module.

Budget Control: Cumulative daily spending caps enforce rejection when single or aggregated amounts exceed remaining allowance.

Resilience: Agent flow accommodates boundary constraints and successfully executes subsequent valid requests up to zero balance.