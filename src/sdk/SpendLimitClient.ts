import { createPublicClient, createWalletClient, http, Address, parseUnits } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export interface SDKConfig {
  privateKey?: `0x${string}`;
  rpcUrl?: string;
  moduleAddress: Address;
  usdcAddress?: Address;
}

export class SpendLimitClient {
  private publicClient;
  private walletClient;
  private account;
  private moduleAddress: Address;
  private usdcAddress?: Address;

  constructor(config: SDKConfig) {
    this.moduleAddress = config.moduleAddress;
    this.usdcAddress = config.usdcAddress;
    
    const pk = config.privateKey || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    this.account = privateKeyToAccount(pk);
    
    const transportUrl = config.rpcUrl || "https://ethereum-sepolia-rpc.publicnode.com";

    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(transportUrl),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: sepolia,
      transport: http(transportUrl),
    });
  }

  public getAccountAddress(): Address {
    return this.account.address;
  }

  public async getBalance(address: Address): Promise<bigint> {
    return await this.publicClient.getBalance({ address });
  }

  public async getRemainingAllowance(_accountAddress: Address): Promise<bigint> {
    // Возвращаем стандартный дневной лимит (100 USDC в единицах с 6 знаками)
    return parseUnits("100", 6);
  }

  /**
   * Честная симуляция расхода средств с проверкой лимита
   */
  public async simulateSpend(accountAddress: Address, amountInUSDC: string, dailyLimitUSDC: string = "100"): Promise<boolean> {
    const amount = parseUnits(amountInUSDC, 6);
    const limit = parseUnits(dailyLimitUSDC, 6);

    console.log(`🛡️ Guardrail Simulation: Requesting ${amountInUSDC} USDC from ${accountAddress}`);

    if (amount <= limit) {
      console.log("✅ Transaction approved within limit.");
      return true;
    } else {
      console.log("❌ Transaction BLOCKED: Exceeds limit!");
      return false;
    }
  }

  public async validateAgentPayment(amountInUSDC: string, dailyLimitUSDC: string): Promise<boolean> {
    const amount = parseUnits(amountInUSDC, 6);
    const limit = parseUnits(dailyLimitUSDC, 6);
    return amount <= limit;
  }
}