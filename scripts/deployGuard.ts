import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  const rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";

  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY not found in .env file");
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`🤖 Deploying contract from account: ${account.address}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(rpcUrl),
  });

  // Read Foundry compiled artifact
  const artifactPath = path.resolve(
    process.cwd(),
    "out/SpentLimitModul.sol/SpendLimitModule.json"
  );
  
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`❌ Artifact not found at: ${artifactPath}. Please run 'forge build' first!`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode.object;

  console.log("📦 Artifact loaded successfully, sending deployment transaction...");

  // USDC Address on Ethereum Sepolia Testnet (Circle Official)
  const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const dailyLimit = parseUnits("100", 6);

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [usdcAddress, dailyLimit],
  });

  console.log(`⏳ Transaction sent: ${hash}`);
  console.log("🔄 Waiting for confirmation on Ethereum Sepolia...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log(`✅ Contract successfully deployed!`);
  console.log(`📍 Module Address: ${receipt.contractAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});