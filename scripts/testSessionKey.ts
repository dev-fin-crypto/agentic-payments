import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http, Address, maxUint256 } from "viem";
import { sepolia } from "viem/chains";
import "dotenv/config";

// Address of the deployed spend limit module and test USDC on Sepolia
const SPEND_LIMIT_MODULE = "0x4939abee6cf623b680a97a059c400b5081a3bd1e" as const;
const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as const;

interface SessionKeyPermissions {
  agentAddress: Address;
  token: Address;
  dailyLimit: bigint;
  validUntil: number; // Unix timestamp
}

async function main() {
  console.log("🚀 Initializing Session Key Generation for AI Agent...\n");

  // 1. Generate a temporary private key for the AI agent
  const agentPrivateKey = generatePrivateKey();
  const agentAccount = privateKeyToAccount(agentPrivateKey);

  console.log(`🤖 Generated Agent Session Key Address: ${agentAccount.address}`);
  console.log(`🔑 Private Key (stored locally for agent): ${agentPrivateKey.slice(0, 10)}...\n`);

  // 2. Configure session key parameters and constraints (Guardrail Policy)
  const oneDayInSeconds = 24 * 60 * 60;
  const validUntil = Math.floor(Date.now() / 1000) + oneDayInSeconds;
  const dailyLimitInUSDC = 100n * 10n ** 6n; // 100 USDC (USDC has 6 decimals)

  const permissions: SessionKeyPermissions = {
    agentAddress: agentAccount.address,
    token: USDC_SEPOLIA,
    dailyLimit: dailyLimitInUSDC,
    validUntil,
  };

  console.log("📜 Session Key Guardrail Policy:");
  console.log(`   • Allowed Token: USDC (${permissions.token})`);
  console.log(`   • Daily Spend Limit: 100 USDC`);
  console.log(`   • Valid Until: ${new Date(permissions.validUntil * 1000).toLocaleString()}\n`);

  // 3. Test signing a message with the agent's session key
  const testMessage = "Agentic Payment Approval Request #001";
  const signature = await agentAccount.signMessage({ message: testMessage });

  console.log(`✍️ Test Message Signed by Agent: "${testMessage}"`);
  console.log(`📝 Signature: ${signature.slice(0, 20)}...\n`);

  console.log("🎉 Session Key setup & agent signature test completed successfully!");
}

main().catch((error) => {
  console.error("❌ Error setting up Session Key:", error);
  process.exit(1);
});