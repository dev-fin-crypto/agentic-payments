import { SpendLimitClient } from "../src/sdk/SpendLimitClient";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const SPEND_LIMIT_MODULE = "0x4939abee6cf623b680a97a059c400b5081a3bd1e" as const;

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY is missing in .env file");
  process.exit(1);
}

async function main() {
  console.log("🚀 Initializing Plug-and-Play Guardrail SDK E2E Test...\n");

  // Initialize SDK client
  const sdk = new SpendLimitClient({
    privateKey: PRIVATE_KEY,
    moduleAddress: SPEND_LIMIT_MODULE,
  });

  console.log(`👤 SDK initialized for account: ${sdk.getAccountAddress()}`);

  // Scenario 1: Payment within limit (Success)
  console.log("\n--- Scenario 1: Normal Agent Payment ---");
  const isAllowedNormal = await sdk.validateAgentPayment("45.50", "100.00");
  console.log(`Result: ${isAllowedNormal ? "PASSED ✅" : "FAILED ❌"}`);

  // Scenario 2: Over-limit payment (Block)
  console.log("\n--- Scenario 2: Over-limit Agent Payment ---");
  const isAllowedExcess = await sdk.validateAgentPayment("150.00", "100.00");
  console.log(`Result: ${isAllowedExcess ? "PASSED ✅" : "BLOCKED CORRECTLY 🛡️"}`);

  console.log("\n🎉 End-to-End SDK integration test completed successfully!");
}

main().catch((error) => {
  console.error("❌ E2E Test error:", error);
  process.exit(1);
});