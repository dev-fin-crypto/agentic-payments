import { createWalletClient, createPublicClient, http, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const SMART_ACCOUNT_ADDRESS = "0xB03A0e6B64060225427dBca74DD9e7ec651386c3" as const;

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY is missing in .env file");
  process.exit(1);
}

async function main() {
  console.log("🚀 Starting funding transaction to Smart Account...");

  const account = privateKeyToAccount(PRIVATE_KEY);
  
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  console.log(`📤 Sending 0.005 ETH from EOA (${account.address}) to Smart Account (${SMART_ACCOUNT_ADDRESS})...`);

  const hash = await walletClient.sendTransaction({
    to: SMART_ACCOUNT_ADDRESS,
    value: parseEther("0.005"),
  });

  console.log(`⏳ Transaction sent! Hash: ${hash}`);
  console.log("🔍 Waiting for transaction confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`✅ Successfully funded Smart Account in block ${receipt.blockNumber}!`);
}

main().catch((error) => {
  console.error("❌ Error funding smart account:", error);
  process.exit(1);
});