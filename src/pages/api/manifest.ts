import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";
import { paymentGatewayInitializeSessionWebhook } from "./webhooks/payment-gateway-initialize-session";
import { transactionInitializeSessionWebhook } from "./webhooks/transaction-initialize-session";
import { transactionProcessSessionWebhook } from "./webhooks/transaction-process-session";
import { transactionChargeRequestedWebhook } from "./webhooks/transaction-charge-requested";
import { transactionRefundRequestedWebhook } from "./webhooks/transaction-refund-requested";
import { transactionCancelRequestedWebhook } from "./webhooks/transaction-cancel-requested";

export default createManifestHandler({
  async manifestFactory({ appBaseUrl, request: _request }) {
    // Use environment variable for base URL if provided (for reverse proxy setups)
    // Otherwise fall back to auto-detected appBaseUrl (for local development)
    const baseUrl = process.env.SALEOR_APP_URL || appBaseUrl;
    
    const manifest: AppManifest = {
      id: "moru.payment.app",
      version: "1.0.0",
      name: "Moru Payment App",
      about: "Saleor Payment App for Moru Payment Wallet integration by Sharavya Technologies",
      permissions: ["HANDLE_PAYMENTS"],
      appUrl: baseUrl,
      tokenTargetUrl: `${baseUrl}/api/register`,
      dataPrivacyUrl: `${baseUrl}/data-privacy`,
      homepageUrl: "https://sharavya.com",
      supportUrl: "https://sharavya.com/support",
      extensions: [],
      webhooks: [
        {
          ...paymentGatewayInitializeSessionWebhook.getWebhookManifest(baseUrl),
          targetUrl: `${baseUrl}${paymentGatewayInitializeSessionWebhook.webhookPath}`,
        },
        {
          ...transactionInitializeSessionWebhook.getWebhookManifest(baseUrl),
          targetUrl: `${baseUrl}${transactionInitializeSessionWebhook.webhookPath}`,
        },
        {
          ...transactionProcessSessionWebhook.getWebhookManifest(baseUrl),
          targetUrl: `${baseUrl}${transactionProcessSessionWebhook.webhookPath}`,
        },
        {
          ...transactionChargeRequestedWebhook.getWebhookManifest(baseUrl),
          targetUrl: `${baseUrl}${transactionChargeRequestedWebhook.webhookPath}`,
        },
        {
          ...transactionRefundRequestedWebhook.getWebhookManifest(baseUrl),
          targetUrl: `${baseUrl}${transactionRefundRequestedWebhook.webhookPath}`,
        },
        {
          ...transactionCancelRequestedWebhook.getWebhookManifest(baseUrl),
          targetUrl: `${baseUrl}${transactionCancelRequestedWebhook.webhookPath}`,
        },
      ],
      author: "Sharavya Technologies",
    };

    return manifest;
  },
});
