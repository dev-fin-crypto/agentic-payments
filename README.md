# Plug-and-Play Guardrail SDK for Agentic Payments

[![npm version](https://img.shields.io/npm/v/agentic-payments-guard.svg)](https://www.npmjs.com/package/agentic-payments-guard)
[![license](https://img.shields.io/github/license/dev-fin-crypto/agentic-payments.svg)](LICENSE)

A lightweight TypeScript SDK and modular smart contract system designed to secure autonomous AI agent transactions on Ethereum & L2s. Enforce strict spending limits, utilize ephemeral session keys, and integrate ERC-4337 smart accounts effortlessly.

## 🚀 Features

- **ERC-4337 Smart Account Compatibility**: Secure agent operations via Safe modular accounts.
- **Spend Limit Guardrails**: Real-time simulation and on-chain validation of USDC daily spend limits.
- **Ephemeral Session Keys**: Authorize autonomous agent actions safely without exposing master private keys.
- **TypeScript First**: Fully typed client configuration and seamless developer experience.

---

## 📦 Installation

```bash
npm install agentic-payments-guard
```

---

## ⚡ Quick Start

```typescript
import { SpendLimitClient } from "agentic-payments-guard";

const client = new SpendLimitClient({
  privateKey: "0xYOUR_PRIVATE_KEY",
  moduleAddress: "0x4939abee6cf623b680a97a059c400b5081a3bd1e",
  usdcAddress: "0x94a9D9AC8a22534e3FaCa9F4e7F2E2cf85d5E4C8" // Sepolia USDC
});

async function run() {
  // Check remaining allowance
  const allowance = await client.getRemainingAllowance("0xB03A0e6B64060225427dBca74DD9e7ec651386c3");
  console.log(`Remaining Allowance: ${allowance}`);

  // Simulate agent spend
  const isAllowed = await client.simulateSpend("0xB03A0e6B64060225427dBca74DD9e7ec651386c3", "10");
  console.log(`Spend allowed: ${isAllowed}`);
}

run();
```

---

## 🧪 Running Tests

Compile TypeScript files and run integration tests:

```bash
npx tsc
node dist/scripts/testSdkE2E.js
node dist/scripts/testSdkClient.js
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.