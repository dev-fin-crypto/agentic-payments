"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const dotenv = __importStar(require("dotenv"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
dotenv.config();
async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
    if (!privateKey) {
        throw new Error("❌ PRIVATE_KEY not found in .env file");
    }
    const account = (0, accounts_1.privateKeyToAccount)(privateKey);
    console.log(`🤖 Deploying contract from account: ${account.address}`);
    const publicClient = (0, viem_1.createPublicClient)({
        chain: chains_1.sepolia,
        transport: (0, viem_1.http)(rpcUrl),
    });
    const walletClient = (0, viem_1.createWalletClient)({
        account,
        chain: chains_1.sepolia,
        transport: (0, viem_1.http)(rpcUrl),
    });
    // Read Foundry compiled artifact
    const artifactPath = node_path_1.default.resolve(process.cwd(), "out/SpentLimitModul.sol/SpendLimitModule.json");
    if (!node_fs_1.default.existsSync(artifactPath)) {
        throw new Error(`❌ Artifact not found at: ${artifactPath}. Please run 'forge build' first!`);
    }
    const artifact = JSON.parse(node_fs_1.default.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;
    const bytecode = artifact.bytecode.object;
    console.log("📦 Artifact loaded successfully, sending deployment transaction...");
    // USDC Address on Ethereum Sepolia Testnet (Circle Official)
    const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const dailyLimit = (0, viem_1.parseUnits)("100", 6);
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
