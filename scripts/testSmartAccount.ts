import { createPublicClient, http, Address, formatEther } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts";
import "dotenv/config";

// Load owner private key from .env file
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY is missing in .env file");
  process.exit(1);
}

async function main() {
  console.log("🚀 Initializing Smart Account setup on Sepolia...\n");

  // 1. Create standard viem public client for Sepolia
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  // 2. Create EOA owner from private key
  const owner = privateKeyToAccount(PRIVATE_KEY);
  console.log(`🔑 Owner EOA Address: ${owner.address}`);

  // 3. Create Safe Smart Account (ERC-7579 compatible)
  const safeAccount = await toSafeSmartAccount({
    client: publicClient,
    owners: [owner],
    version: "1.4.1",
  });

  const smartAccountAddress: Address = safeAccount.address;
  console.log(`✨ Smart Account Address: ${smartAccountAddress}\n`);

  // 4. Check ETH balance on Smart Account
  const balance = await publicClient.getBalance({
    address: smartAccountAddress,
  });

  console.log(`💰 Smart Account ETH Balance: ${formatEther(balance)} ETH`);
  console.log("🎉 Smart Account initialization test completed successfully!");
}

main().catch((error) => {
  console.error("❌ Error setting up Smart Account:", error);
  process.exit(1);
});