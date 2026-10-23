"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
require("dotenv/config");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SMART_ACCOUNT_ADDRESS = "0xB03A0e6B64060225427dBca74DD9e7ec651386c3";
if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY is missing in .env file");
    process.exit(1);
}
async function main() {
    console.log("🚀 Starting funding transaction to Smart Account...");
    const account = (0, accounts_1.privateKeyToAccount)(PRIVATE_KEY);
    const publicClient = (0, viem_1.createPublicClient)({
        chain: chains_1.sepolia,
        transport: (0, viem_1.http)("https://ethereum-sepolia-rpc.publicnode.com"),
    });
    const walletClient = (0, viem_1.createWalletClient)({
        account,
        chain: chains_1.sepolia,
        transport: (0, viem_1.http)("https://ethereum-sepolia-rpc.publicnode.com"),
    });
    console.log(`📤 Sending 0.005 ETH from EOA (${account.address}) to Smart Account (${SMART_ACCOUNT_ADDRESS})...`);
    const hash = await walletClient.sendTransaction({
        to: SMART_ACCOUNT_ADDRESS,
        value: (0, viem_1.parseEther)("0.005"),
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
