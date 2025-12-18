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
    const manifest: AppManifest = {
      id: "moru.payment.app",
      version: "1.0.0",
      name: "Moru Payment App",
      about: "Saleor Payment App for Moru Payment Wallet integration",
      permissions: ["HANDLE_PAYMENTS"],
      appUrl: appBaseUrl,
      tokenTargetUrl: `${appBaseUrl}/api/register`,
      dataPrivacyUrl: `${appBaseUrl}/data-privacy`,
      homepageUrl: "https://moru.example.com",
      supportUrl: "https://moru.example.com/support",
      extensions: [],
      webhooks: [
        paymentGatewayInitializeSessionWebhook.getWebhookManifest(appBaseUrl),
        transactionInitializeSessionWebhook.getWebhookManifest(appBaseUrl),
        transactionProcessSessionWebhook.getWebhookManifest(appBaseUrl),
        transactionChargeRequestedWebhook.getWebhookManifest(appBaseUrl),
        transactionRefundRequestedWebhook.getWebhookManifest(appBaseUrl),
        transactionCancelRequestedWebhook.getWebhookManifest(appBaseUrl),
      ],
      author: "Moru Payment Solutions",
    };

    return manifest;
  },
});
