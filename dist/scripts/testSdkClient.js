"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpendLimitClient_1 = require("../src/sdk/SpendLimitClient");
async function main() {
    console.log("🚀 Starting SpendLimitClient integration test...\n");
    // Deployed SpendLimitModule address on Sepolia
    const moduleAddress = "0x4939abee6cf623b680a97a059c400b5081a3bd1e";
    // Official USDC address on Sepolia
    const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    // Dummy target smart account (or deployer)
    const testAccountAddress = "0x5d0BB75312FDe8A27cde8cC2A699C4df875706B0";
    const client = new SpendLimitClient_1.SpendLimitClient({
        moduleAddress,
        usdcAddress,
    });
    // 1. Fetch remaining daily allowance
    console.log(`🔍 Checking remaining allowance for: ${testAccountAddress}`);
    try {
        const allowance = await client.getRemainingAllowance(testAccountAddress);
        console.log(`✅ Remaining Allowance: ${allowance} USDC\n`);
    }
    catch (error) {
        console.error("❌ Failed to fetch allowance:", error);
    }
    // 2. Simulate transaction within budget (e.g. 10 USDC)
    console.log(`🧪 Simulating spend of 10 USDC...`);
    const isAllowedSmall = await client.simulateSpend(testAccountAddress, "10");
    console.log(`Result: ${isAllowedSmall ? "✅ ALLOWED" : "❌ REJECTED"}\n`);
    // 3. Simulate transaction exceeding budget (e.g. 500 USDC)
    console.log(`🧪 Simulating spend of 500 USDC (exceeds limit)...`);
    const isAllowedLarge = await client.simulateSpend(testAccountAddress, "500");
    console.log(`Result: ${isAllowedLarge ? "✅ ALLOWED" : "❌ REJECTED"}\n`);
    console.log("🎉 SDK Client test execution completed!");
}
main().catch((error) => {
    console.error("❌ Error running SDK test:", error);
    process.exit(1);
});
