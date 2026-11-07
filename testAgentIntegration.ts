import { AgentGuardMiddleware, GuardConfig } from "./AgentGuardMiddleware.js";
import { Address, Hex } from "viem";

// Guard configuration with real Builder Code for Base Dashboard
const BUILDER_CODE_SUFFIX: Hex = "0xbc46z84t"; // Matches bc_jt46z84t

const guardConfig: GuardConfig = {
  dailyLimitUSDC: "150.0", // Strict daily agent limit: 150 USDC
  whitelistedRecipients: [
    "0x1111111111111111111111111111111111111111", // Verified liquidity provider / API
    "0x2222222222222222222222222222222222222222"  // Partner settlement service
  ],
  builderCode: BUILDER_CODE_SUFFIX
};

async function runAIAgentSimulation() {
  console.log("🤖 [Sphere #2] Initializing autonomous AI agent...");
  console.log("🛡️ [Sphere #1] Connecting agentic-payments-guard module (Safe Smart Account / Base)...");
  
  const guard = new AgentGuardMiddleware(guardConfig);
  console.log(`📊 Initial limits: ${JSON.stringify(guard.getMetrics(), null, 2)}\n`);

  const trustedMerchant: Address = "0x1111111111111111111111111111111111111111";
  const rogueAddress: Address = "0x9999999999999999999999999999999999999999";

  // --- Scenario 1: Legitimate AI agent micro-payment ---
  console.log("--- Scenario 1: Agent requests API service payment (50.0 USDC) ---");
  const res1 = await guard.interceptPayment({
    recipient: trustedMerchant,
    amountInUSDC: "50.0"
  });

  if (res1.approved && res1.userOpPayload) {
    console.log("✅ [APPROVED] Middleware passed the transaction.");
    console.log("📦 Target (USDC Contract):", res1.userOpPayload.target);
    console.log("📦 Generated UserOp Calldata (+ Builder Code):", res1.userOpPayload.calldata);
  } else {
    console.log("❌ [REJECTED]:", res1.reason);
  }
  console.log(`📊 Limit status:`, guard.getMetrics(), "\n");

  // --- Scenario 2: Attack attempt / unauthorized destination address ---
  console.log("--- Scenario 2: Agent attempts to transfer funds to an unaudited address ---");
  const res2 = await guard.interceptPayment({
    recipient: rogueAddress,
    amountInUSDC: "10.0"
  });

  if (!res2.approved) {
    console.log("🛡️ [BLOCKED BY GUARD MODULE]:", res2.reason);
  }
  console.log("\n");

  // --- Scenario 3: Attempt to exceed remaining daily limit ---
  console.log("--- Scenario 3: Agent attempts a large purchase (120 USDC with 100 remaining) ---");
  const res3 = await guard.interceptPayment({
    recipient: trustedMerchant,
    amountInUSDC: "120.0"
  });

  if (!res3.approved) {
    console.log("🛡️ [BLOCKED BY GUARD MODULE]:", res3.reason);
  }

  // Successful usage of remaining limit
  console.log("\n--- Scenario 4: Adjusting request within remaining limit bounds (100.0 USDC) ---");
  const res4 = await guard.interceptPayment({
    recipient: trustedMerchant,
    amountInUSDC: "100.0"
  });

  if (res4.approved) {
    console.log("✅ [APPROVED] Final payment for remaining balance processed successfully.");
  }

  console.log(`\n📊 Final daily limit metrics:`, guard.getMetrics());
  console.log("🎉 AI agent and payment gateway simulation completed successfully!");
}

runAIAgentSimulation().catch(console.error);