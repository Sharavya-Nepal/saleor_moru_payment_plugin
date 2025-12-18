/**
 * Moru Payment Gateway API Client
 * Based on Moru Payment Gateway API documentation
 * Base URL: https://test.moru-gateway.pnpl.com.np/gateway
 */

export interface MoruConfig {
  apiUrl: string;
  authKey: string;
}

export interface MoruInitiateRequest {
  return_url: string;
  amount: string;
  transaction_id: string;
  merchant_info: {
    email: string;
    name?: string;
  };
  additional_fields?: Record<string, unknown>;
}

export interface MoruInitiateResponse {
  code: string;
  message: string;
  data: {
    transaction_id: string;
    mpi: string;
    msi: string;
    payment_url: string;
    amount: number;
    state: "Initiated" | "Pending" | "Completed" | "Failed" | "Canceled";
    source_type: string;
    additional_fields?: Record<string, unknown>;
  };
  errors: Record<string, unknown>;
}

export interface MoruCheckRequest {
  transaction_id: string;
}

export interface MoruCheckResponse {
  code: string;
  message: string;
  data: {
    transaction_id: string;
    moru_txn_identifier: string;
    amount: number;
    state: "Pending" | "Completed" | "Failed" | "Canceled";
    completed: boolean;
    initiated_time: string;
    additional_fields?: Record<string, unknown>;
  };
  errors: Record<string, unknown>;
}

export class MoruPaymentService {
  private config: MoruConfig;

  constructor(config: MoruConfig) {
    this.config = config;
  }

  /**
   * Generate authentication headers for Moru API
   */
  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `AUTH_KEY ${this.config.authKey}`,
    };
  }

  /**
   * Initiate a payment with Moru
   * POST /v2/initiate
   */
  async initiatePayment(request: MoruInitiateRequest): Promise<MoruInitiateResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/v2/initiate`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      const data: MoruInitiateResponse = await response.json();

      // Check for success response code
      if (data.code !== "0000") {
        console.error("Moru initiate payment error:", data);
        throw new Error(data.message || "Failed to initiate payment");
      }

      return data;
    } catch (error) {
      console.error("Error initiating Moru payment:", error);
      throw error;
    }
  }

  /**
   * Check payment status with Moru
   * POST /v2/check
   */
  async checkPaymentStatus(request: MoruCheckRequest): Promise<MoruCheckResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/v2/check`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      const data: MoruCheckResponse = await response.json();

      return data;
    } catch (error) {
      console.error("Error checking Moru payment status:", error);
      throw error;
    }
  }
}

/**
 * Get configured Moru Payment Service instance
 */
export function getMoruService(): MoruPaymentService {
  const config: MoruConfig = {
    apiUrl: process.env.MORU_API_URL || "https://test.moru-gateway.pnpl.com.np/gateway",
    authKey: process.env.MORU_AUTH_KEY || "",
  };

  if (!config.authKey) {
    throw new Error(
      "Moru AUTH_KEY is required. Please set MORU_AUTH_KEY environment variable."
    );
  }

  return new MoruPaymentService(config);
}