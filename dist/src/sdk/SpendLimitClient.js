"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpendLimitClient = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
class SpendLimitClient {
    publicClient;
    walletClient;
    account;
    moduleAddress;
    usdcAddress;
    constructor(config) {
        this.moduleAddress = config.moduleAddress;
        this.usdcAddress = config.usdcAddress;
        const pk = config.privateKey || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        this.account = (0, accounts_1.privateKeyToAccount)(pk);
        const transportUrl = config.rpcUrl || "https://ethereum-sepolia-rpc.publicnode.com";
        this.publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(transportUrl),
        });
        this.walletClient = (0, viem_1.createWalletClient)({
            account: this.account,
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(transportUrl),
        });
    }
    getAccountAddress() {
        return this.account.address;
    }
    async getBalance(address) {
        return await this.publicClient.getBalance({ address });
    }
    async getRemainingAllowance(_accountAddress) {
        // Возвращаем стандартный дневной лимит (100 USDC в единицах с 6 знаками)
        return (0, viem_1.parseUnits)("100", 6);
    }
    /**
     * Честная симуляция расхода средств с проверкой лимита
     */
    async simulateSpend(accountAddress, amountInUSDC, dailyLimitUSDC = "100") {
        const amount = (0, viem_1.parseUnits)(amountInUSDC, 6);
        const limit = (0, viem_1.parseUnits)(dailyLimitUSDC, 6);
        console.log(`🛡️ Guardrail Simulation: Requesting ${amountInUSDC} USDC from ${accountAddress}`);
        if (amount <= limit) {
            console.log("✅ Transaction approved within limit.");
            return true;
        }
        else {
            console.log("❌ Transaction BLOCKED: Exceeds limit!");
            return false;
        }
    }
    async validateAgentPayment(amountInUSDC, dailyLimitUSDC) {
        const amount = (0, viem_1.parseUnits)(amountInUSDC, 6);
        const limit = (0, viem_1.parseUnits)(dailyLimitUSDC, 6);
        return amount <= limit;
    }
}
exports.SpendLimitClient = SpendLimitClient;
