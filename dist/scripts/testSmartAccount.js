"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
const accounts_2 = require("permissionless/accounts");
require("dotenv/config");
// Загрузка приватного ключа владельца из файла .env
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY is missing in .env file");
    process.exit(1);
}
async function main() {
    console.log("🚀 Initializing Smart Account setup on Sepolia...\n");
    // 1. Создание стандартного публичного клиента viem для Sepolia
    const publicClient = (0, viem_1.createPublicClient)({
        chain: chains_1.sepolia,
        transport: (0, viem_1.http)("https://ethereum-sepolia-rpc.publicnode.com"),
    });
    // 2. Создание EOA-владельца из приватного ключа
    const owner = (0, accounts_1.privateKeyToAccount)(PRIVATE_KEY);
    console.log(`🔑 Owner EOA Address: ${owner.address}`);
    // 3. Создание Safe Smart Account (ERC-7579 совместимого)
    const safeAccount = await (0, accounts_2.toSafeSmartAccount)({
        client: publicClient,
        owners: [owner],
        version: "1.4.1",
    });
    const smartAccountAddress = safeAccount.address;
    console.log(`✨ Smart Account Address: ${smartAccountAddress}\n`);
    // 4. Проверка баланса ETH на Smart Account
    const balance = await publicClient.getBalance({
        address: smartAccountAddress,
    });
    console.log(`💰 Smart Account ETH Balance: ${(0, viem_1.formatEther)(balance)} ETH`);
    console.log("🎉 Smart Account initialization test completed successfully!");
}
main().catch((error) => {
    console.error("❌ Error setting up Smart Account:", error);
    process.exit(1);
});
