import { Address, Hex, parseUnits, encodePacked } from "viem";

export interface AgentIntent {
  recipient: Address;
  amountInUSDC: string; // Amount in human-readable format (e.g., "25.50")
  data?: Hex;           // Optional execution calldata
}

export interface GuardConfig {
  dailyLimitUSDC: string;
  whitelistedRecipients: Address[];
  builderCode: Hex;     // Builder Code suffix for Base Dashboard (e.g., 0xbc46z84t)
}

export interface GuardVerificationResult {
  approved: boolean;
  reason?: string;
  userOpPayload?: {
    target: Address;
    value: bigint;
    calldata: Hex;
  };
}

export class AgentGuardMiddleware {
  private currentPeriodSpent: bigint = 0n;
  private lastResetTime: number = Date.now();
  private dailyLimit: bigint;
  private whitelist: Set<string>;
  private builderCode: Hex;

  // Native USDC contract address on Base network
  public static readonly USDC_BASE: Address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  constructor(config: GuardConfig) {
    this.dailyLimit = parseUnits(config.dailyLimitUSDC, 6); // USDC uses 6 decimals
    this.whitelist = new Set(config.whitelistedRecipients.map(addr => addr.toLowerCase()));
    this.builderCode = config.builderCode;
  }

  /**
   * Intercepts and verifies the AI agent's intent before UserOp generation
   */
  public async interceptPayment(intent: AgentIntent): Promise<GuardVerificationResult> {
    const now = Date.now();
    
    // 1. Automatic 24-hour window reset
    if (now - this.lastResetTime >= 24 * 60 * 60 * 1000) {
      this.currentPeriodSpent = 0n;
      this.lastResetTime = now;
    }

    const requestedAmount = parseUnits(intent.amountInUSDC, 6);

    // 2. Recipient whitelist verification
    if (!this.whitelist.has(intent.recipient.toLowerCase())) {
      return {
        approved: false,
        reason: `SECURITY REJECTION: Recipient address ${intent.recipient} is not present in the agent's whitelist.`
      };
    }

    // 3. Daily spend cap verification
    if (this.currentPeriodSpent + requestedAmount > this.dailyLimit) {
      const available = Number(this.dailyLimit - this.currentPeriodSpent) / 1e6;
      return {
        approved: false,
        reason: `GUARDRAIL REJECTION: Daily limit exceeded. Requested: ${intent.amountInUSDC} USDC, Available: ${available} USDC.`
      };
    }

    // 4. Update internal spent tracking state
    this.currentPeriodSpent += requestedAmount;

    // 5. Generate ERC-20 transfer calldata (`transfer(address,uint256)`) 
    // Function selector for transfer: 0xa9059cbb
    const transferSelector = "0xa9059cbb";
    const encodedRecipient = intent.recipient.toLowerCase().replace("0x", "").padStart(64, "0");
    const encodedAmount = requestedAmount.toString(16).padStart(64, "0");
    
    const baseTransferCalldata = `${transferSelector}${encodedRecipient}${encodedAmount}` as Hex;

    // Inject Builder Code into calldata suffix for Base Dashboard attribution tracking
    const userOpPayloadWithAttribution = encodePacked(
      ["bytes", "bytes"],
      [baseTransferCalldata, this.builderCode]
    );

    return {
      approved: true,
      userOpPayload: {
        target: AgentGuardMiddleware.USDC_BASE,
        value: 0n, // ERC-20 transfers do not pass native ETH via value
        calldata: userOpPayloadWithAttribution
      }
    };
  }

  /**
   * Returns current limit usage metrics
   */
  public getMetrics() {
    return {
      dailyLimitUSDC: Number(this.dailyLimit) / 1e6,
      spentTodayUSDC: Number(this.currentPeriodSpent) / 1e6,
      remainingUSDC: Number(this.dailyLimit - this.currentPeriodSpent) / 1e6
    };
  }
}