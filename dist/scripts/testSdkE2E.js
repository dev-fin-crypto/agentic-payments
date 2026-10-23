"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpendLimitClient_1 = require("../src/sdk/SpendLimitClient");
require("dotenv/config");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SPEND_LIMIT_MODULE = "0x4939abee6cf623b680a97a059c400b5081a3bd1e";
if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY is missing in .env file");
    process.exit(1);
}
async function main() {
    console.log("🚀 Initializing Plug-and-Play Guardrail SDK E2E Test...\n");
    // Инициализация SDK клиента
    const sdk = new SpendLimitClient_1.SpendLimitClient({
        privateKey: PRIVATE_KEY,
        moduleAddress: SPEND_LIMIT_MODULE,
    });
    console.log(`👤 SDK initialized for account: ${sdk.getAccountAddress()}`);
    // Сценарий 1: Платеж в рамках лимита (Успех)
    console.log("\n--- Scenario 1: Normal Agent Payment ---");
    const isAllowedNormal = await sdk.validateAgentPayment("45.50", "100.00");
    console.log(`Result: ${isAllowedNormal ? "PASSED ✅" : "FAILED ❌"}`);
    // Сценарий 2: Платеж с превышением лимита (Блокировка)
    console.log("\n--- Scenario 2: Over-limit Agent Payment ---");
    const isAllowedExcess = await sdk.validateAgentPayment("150.00", "100.00");
    console.log(`Result: ${isAllowedExcess ? "PASSED ✅" : "BLOCKED CORRECTLY 🛡️"}`);
    console.log("\n🎉 End-to-End SDK integration test completed successfully!");
}
main().catch((error) => {
    console.error("❌ E2E Test error:", error);
    process.exit(1);
});
